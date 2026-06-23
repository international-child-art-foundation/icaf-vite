import type { PaymentPurpose } from "@icaf/shared";

import { GA4_API_SECRET, GA4_MEASUREMENT_ID } from "../config/aws-clients";

type PaymentService = "stripe" | "every";

export type Ga4PurchaseInput = {
  transactionId: string;
  paymentService: PaymentService;
  purpose: PaymentPurpose;
  userId: string;
  amountMinorUnits: number;
  currency: string;
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

function currencyMinorUnitFactor(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 1 : 100;
}

function ga4ClientId(input: Ga4PurchaseInput): string {
  if (input.userId !== "ANON") return `icaf.${input.userId}`;
  return `icaf.${input.paymentService}.${input.transactionId}`;
}

function itemNameForPurpose(purpose: PaymentPurpose): string {
  return purpose
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildGa4PurchasePayload(input: Ga4PurchaseInput): Record<string, unknown> {
  const currency = input.currency.toUpperCase();
  const value = input.amountMinorUnits / currencyMinorUnitFactor(currency);
  const userId = input.userId === "ANON" ? undefined : input.userId;

  return {
    client_id: ga4ClientId(input),
    ...(userId && { user_id: userId }),
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: `${input.paymentService}:${input.transactionId}`,
          affiliation: input.paymentService,
          currency,
          value,
          items: [
            {
              item_id: input.purpose,
              item_name: itemNameForPurpose(input.purpose),
              item_category: input.paymentService,
              currency,
              price: value,
              quantity: 1,
            },
          ],
        },
      },
    ],
  };
}

export async function sendGa4Purchase(input: Ga4PurchaseInput): Promise<void> {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_000);

  try {
    const url = new URL("https://www.google-analytics.com/mp/collect");
    url.searchParams.set("measurement_id", GA4_MEASUREMENT_ID);
    url.searchParams.set("api_secret", GA4_API_SECRET);

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildGa4PurchasePayload(input)),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn("GA4 purchase event was rejected", {
        status: response.status,
        statusText: response.statusText,
        transactionId: input.transactionId,
        paymentService: input.paymentService,
      });
    }
  } catch (error) {
    console.warn("Failed to send GA4 purchase event", {
      error,
      transactionId: input.transactionId,
      paymentService: input.paymentService,
    });
  } finally {
    clearTimeout(timeout);
  }
}
