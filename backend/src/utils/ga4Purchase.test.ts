import { describe, expect, it } from "vitest";

import { buildGa4PurchasePayload } from "./ga4Purchase";

describe("buildGa4PurchasePayload", () => {
  it("builds a GA4 purchase payload with standard ecommerce fields", () => {
    expect(buildGa4PurchasePayload({
      transactionId: "pi_123",
      paymentService: "stripe",
      purpose: "childart-magazine",
      userId: "user-123",
      amountMinorUnits: 1299,
      currency: "usd",
    })).toEqual({
      client_id: "icaf.user-123",
      user_id: "user-123",
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: "stripe:pi_123",
            affiliation: "stripe",
            currency: "USD",
            value: 12.99,
            items: [
              {
                item_id: "childart-magazine",
                item_name: "Childart Magazine",
                item_category: "stripe",
                currency: "USD",
                price: 12.99,
                quantity: 1,
              },
            ],
          },
        },
      ],
    });
  });

  it("does not attach a GA4 user_id for anonymous purchases", () => {
    expect(buildGa4PurchasePayload({
      transactionId: "ch_123",
      paymentService: "every",
      purpose: "donation",
      userId: "ANON",
      amountMinorUnits: 5000,
      currency: "JPY",
    })).toEqual({
      client_id: "icaf.every.ch_123",
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: "every:ch_123",
            affiliation: "every",
            currency: "JPY",
            value: 5000,
            items: [
              {
                item_id: "donation",
                item_name: "Donation",
                item_category: "every",
                currency: "JPY",
                price: 5000,
                quantity: 1,
              },
            ],
          },
        },
      ],
    });
  });
});
