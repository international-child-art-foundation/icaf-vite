import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  PaymentEntity,
  PaymentPurpose,
  UserEntity,
  isValidPaymentPurpose,
  normalizeEmail,
  validatePaymentEntity,
} from "@icaf/shared";
import {
  dynamodb,
  EVERY_WEBHOOK_ENABLED,
  EVERY_WEBHOOK_SECRET,
  STRIPE_WEBHOOK_SECRET,
  TABLE_NAME,
} from "../../config/aws-clients";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { sendGa4Purchase } from "../../utils/ga4Purchase";

type PaymentService = "stripe" | "every";

type PaymentRecordInput = {
  paymentId: string;
  paymentService: PaymentService;
  purpose: PaymentPurpose;
  userId?: string;
  email?: string;
  amountCents: number;
  currency: string;
  ts: number;
};

type StripeEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: Record<string, unknown>;
  };
};

type EveryDonationWebhook = {
  chargeId?: string;
  email?: string | null;
  amount?: string;
  currency?: string;
  createdAt?: string;
  donatedAt?: string;
  timestamp?: string | number;
};

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

function ok(): ApiGatewayResponse {
  return {
    statusCode: HTTP_STATUS.OK,
    body: JSON.stringify({ received: true }),
    headers: COMMON_HEADERS,
  };
}

function getHeader(event: ApiGatewayEvent, name: string): string | undefined {
  const headers = event.headers ?? {};
  const lowerName = name.toLowerCase();
  return Object.entries(headers).find(([key]) => key.toLowerCase() === lowerName)?.[1];
}

function rawBody(event: ApiGatewayEvent): string {
  if (event.rawBody !== undefined) return event.rawBody;
  if (!event.isBase64Encoded) return event.body ?? "";
  return Buffer.from(event.body ?? "", "base64").toString("utf8");
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifyStripeSignature(payload: string, signatureHeader: string | undefined): boolean {
  if (!STRIPE_WEBHOOK_SECRET || !payload || !signatureHeader) return false;

  const fields = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) return acc;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    acc[key] = [...(acc[key] ?? []), value];
    return acc;
  }, {});

  const timestamp = fields.t?.[0];
  const signatures = fields.v1 ?? [];
  if (!timestamp || signatures.length === 0) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 300) return false;

  const expected = createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return signatures.some((signature) => safeEqualHex(expected, signature));
}

function verifyEverySecret(event: ApiGatewayEvent): boolean {
  if (!EVERY_WEBHOOK_SECRET) return false;

  const headerSecret =
    getHeader(event, "x-every-webhook-secret") ??
    getHeader(event, "x-webhook-secret");
  const auth = getHeader(event, "authorization");
  const bearerSecret = auth?.match(/^Bearer\s+(.+)$/i)?.[1];
  const querySecret = event.queryStringParameters?.secret;
  const provided = headerSecret ?? bearerSecret ?? querySecret;

  if (!provided) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(EVERY_WEBHOOK_SECRET);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function metadataValue(object: Record<string, unknown>, name: string): string | undefined {
  const metadata = objectValue(object.metadata);
  return stringValue(metadata?.[name]);
}

function normalizeOptionalEmail(email: unknown): string | undefined {
  if (typeof email !== "string" || !email.trim()) return undefined;
  return normalizeEmail(email);
}

function parseCurrencyAmountToCents(amount: string, currency: string): number | null {
  const normalizedCurrency = currency.toUpperCase();
  const minorUnits = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 0 : 2;
  const match = amount.trim().match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return null;

  const whole = Number(match[1]);
  if (!Number.isSafeInteger(whole)) return null;

  const fraction = match[2] ?? "";
  if (fraction.length > minorUnits) return null;

  const multiplier = 10 ** minorUnits;
  const paddedFraction = fraction.padEnd(minorUnits, "0");
  const cents = whole * multiplier + (paddedFraction ? Number(paddedFraction) : 0);

  return Number.isSafeInteger(cents) ? cents : null;
}

async function getUserByEmail(email: string): Promise<UserEntity | undefined> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI.Email,
      KeyConditionExpression: "EMAIL_PK = :pk AND EMAIL_SK = :sk",
      ExpressionAttributeValues: {
        ":pk": emailPk(email),
        ":sk": emailGsiSk(EntityType.User),
      },
      Limit: 1,
    }),
  );

  return result.Items?.[0] as UserEntity | undefined;
}

function normalizeUserId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("USER#") ? trimmed.slice("USER#".length) : trimmed;
}

async function getOrCreatePaymentUser(
  email: string | undefined,
  nowSeconds: number,
  explicitUserId?: string,
): Promise<string> {
  const normalizedExplicitUserId = normalizeUserId(explicitUserId);
  if (normalizedExplicitUserId) return normalizedExplicitUserId;
  if (!email) return "ANON";

  const normalizedEmail = normalizeEmail(email);
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) return existing.user_id;

  const userId = randomUUID();
  const user: UserEntity & Record<string, unknown> = {
    PK: `USER#${userId}`,
    SK: "PROFILE",
    user_id: userId,
    email: normalizedEmail,
    is_virtual: true,
    ts: nowSeconds,
    banned: false,
    has_magazine_subscription: false,
    has_newsletter_subscription: false,
    artwork_emails_off: false,
    type: "USER",
    EMAIL_PK: emailPk(normalizedEmail),
    EMAIL_SK: emailGsiSk(EntityType.User),
  };

  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    }),
  );

  return userId;
}

async function recordPayment(input: PaymentRecordInput): Promise<ApiGatewayResponse> {
  const email = input.email ? normalizeEmail(input.email) : undefined;
  const userId = await getOrCreatePaymentUser(email, input.ts, input.userId);
  const payment: PaymentEntity & Record<string, unknown> = {
    PK: `USER#${userId}`,
    SK: `PAYMENT#${input.paymentId}`,
    user_id: userId === "ANON" ? "USER#ANON" : `USER#${userId}`,
    payment_id: input.paymentId,
    payment_service: input.paymentService,
    purpose: input.purpose,
    ...(email && { email }),
    amount_cents: input.amountCents,
    currency: input.currency.toUpperCase(),
    ts: input.ts,
    type: "PAYMENT",
  };

  const errors = validatePaymentEntity(payment);
  if (errors.length > 0) return CommonErrors.badRequest(errors.join("; "));

  try {
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: payment,
        ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
      return ok();
    }
    throw error;
  }

  await sendGa4Purchase({
    transactionId: input.paymentId,
    paymentService: input.paymentService,
    purpose: input.purpose,
    userId,
    amountMinorUnits: input.amountCents,
    currency: input.currency,
  });

  return ok();
}

function extractStripeEmail(object: Record<string, unknown>): string | undefined {
  const customerDetails = objectValue(object.customer_details);
  const customerEmail =
    normalizeOptionalEmail(customerDetails?.email) ??
    normalizeOptionalEmail(object.customer_email) ??
    normalizeOptionalEmail(object.receipt_email) ??
    normalizeOptionalEmail(object.email);

  return customerEmail;
}

function stripeMetadataPurpose(object: Record<string, unknown>): PaymentPurpose | undefined {
  const purpose = metadataValue(object, "purpose") ?? metadataValue(object, "payment_purpose");
  return purpose && isValidPaymentPurpose(purpose) ? purpose : undefined;
}

function isContestEntrySession(object: Record<string, unknown>): boolean {
  return Boolean(stringValue(object.client_reference_id) && metadataValue(object, "entryfee") === "true");
}

function paymentFromCheckoutSession(object: Record<string, unknown>, eventCreated: number): PaymentRecordInput | null {
  if (stringValue(object.mode) === "subscription") return null;
  if (stringValue(object.payment_status) && stringValue(object.payment_status) !== "paid") return null;

  const paymentIntent = stringValue(object.payment_intent);
  const sessionId = stringValue(object.id);
  const amountTotal = numberValue(object.amount_total);
  const currency = stringValue(object.currency);

  if (!sessionId || amountTotal === undefined || !currency) return null;

  return {
    paymentId: paymentIntent ?? sessionId,
    paymentService: "stripe",
    purpose: isContestEntrySession(object)
      ? "contest-entry"
      : stripeMetadataPurpose(object) ?? "donation",
    userId: isContestEntrySession(object)
      ? stringValue(object.client_reference_id)
      : undefined,
    email: extractStripeEmail(object),
    amountCents: amountTotal,
    currency,
    ts: numberValue(object.created) ?? eventCreated,
  };
}

function paymentFromPaymentIntent(object: Record<string, unknown>, eventCreated: number): PaymentRecordInput | null {
  if (stringValue(object.status) !== "succeeded") return null;
  if (object.invoice) return null;

  const paymentIntent = stringValue(object.id);
  const amountReceived = numberValue(object.amount_received) ?? numberValue(object.amount);
  const currency = stringValue(object.currency);

  if (!paymentIntent || amountReceived === undefined || !currency) return null;

  return {
    paymentId: paymentIntent,
    paymentService: "stripe",
    purpose: stripeMetadataPurpose(object) ?? "donation",
    email: extractStripeEmail(object),
    amountCents: amountReceived,
    currency,
    ts: numberValue(object.created) ?? eventCreated,
  };
}

function paymentFromInvoice(object: Record<string, unknown>, eventCreated: number): PaymentRecordInput | null {
  if (object.paid !== true && stringValue(object.status) !== "paid") return null;

  const invoiceId = stringValue(object.id);
  const paymentIntent = stringValue(object.payment_intent);
  const amountPaid = numberValue(object.amount_paid);
  const currency = stringValue(object.currency);

  if (!invoiceId || amountPaid === undefined || amountPaid <= 0 || !currency) return null;

  return {
    paymentId: paymentIntent ?? invoiceId,
    paymentService: "stripe",
    purpose: stripeMetadataPurpose(object) ?? "childart-magazine",
    email: extractStripeEmail(object),
    amountCents: amountPaid,
    currency,
    ts: numberValue(object.created) ?? eventCreated,
  };
}

function paymentFromStripeEvent(event: StripeEvent): PaymentRecordInput | null {
  const object = objectValue(event.data?.object);
  if (!object || !event.type) return null;

  const eventCreated = event.created ?? Math.floor(Date.now() / 1000);
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return paymentFromCheckoutSession(object, eventCreated);
    case "payment_intent.succeeded":
      return paymentFromPaymentIntent(object, eventCreated);
    case "invoice.paid":
      return paymentFromInvoice(object, eventCreated);
    default:
      return null;
  }
}

function paymentFromEveryDonation(body: EveryDonationWebhook): PaymentRecordInput | ApiGatewayResponse {
  const chargeId = stringValue(body.chargeId);
  const currency = stringValue(body.currency);
  const amount = stringValue(body.amount);

  if (!chargeId) return CommonErrors.badRequest("chargeId is required");
  if (!currency) return CommonErrors.badRequest("currency is required");
  if (!amount) return CommonErrors.badRequest("amount is required");

  const amountCents = parseCurrencyAmountToCents(amount, currency);
  if (amountCents === null) return CommonErrors.badRequest("amount is invalid");

  const parsedTs = [body.timestamp, body.donatedAt, body.createdAt]
    .map((value) => {
      if (typeof value === "number" && Number.isFinite(value)) return value > 9999999999 ? Math.floor(value / 1000) : Math.floor(value);
      if (typeof value === "string" && value.trim()) {
        const asNumber = Number(value);
        if (Number.isFinite(asNumber)) return asNumber > 9999999999 ? Math.floor(asNumber / 1000) : Math.floor(asNumber);
        const asDate = Date.parse(value);
        if (Number.isFinite(asDate)) return Math.floor(asDate / 1000);
      }
      return undefined;
    })
    .find((value): value is number => value !== undefined);

  return {
    paymentId: chargeId,
    paymentService: "every",
    purpose: "donation",
    email: normalizeOptionalEmail(body.email),
    amountCents,
    currency,
    ts: parsedTs ?? Math.floor(Date.now() / 1000),
  };
}

export const stripeWebhookHandler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const payload = rawBody(event);
    if (!verifyStripeSignature(payload, getHeader(event, "stripe-signature"))) {
      return CommonErrors.badRequest("Invalid Stripe signature");
    }

    const stripeEvent = JSON.parse(payload) as StripeEvent;
    const payment = paymentFromStripeEvent(stripeEvent);
    if (!payment) return ok();

    return await recordPayment(payment);
  } catch (error) {
    if (error instanceof SyntaxError) return CommonErrors.badRequest("Invalid JSON body");
    console.error("Error processing Stripe webhook:", error);
    return CommonErrors.internalServerError();
  }
};

export const everyWebhookHandler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  if (!EVERY_WEBHOOK_ENABLED) {
    return CommonErrors.notFound("Route not found");
  }

  try {
    if (!verifyEverySecret(event)) {
      return CommonErrors.badRequest("Invalid Every webhook secret");
    }

    const body = JSON.parse(rawBody(event)) as EveryDonationWebhook;
    const payment = paymentFromEveryDonation(body);
    if ("statusCode" in payment) return payment;

    return await recordPayment(payment);
  } catch (error) {
    if (error instanceof SyntaxError) return CommonErrors.badRequest("Invalid JSON body");
    console.error("Error processing Every webhook:", error);
    return CommonErrors.internalServerError();
  }
};
