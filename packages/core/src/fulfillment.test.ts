import { describe, expect, it } from "vitest";
import { decidePaymentAction } from "./fulfillment.js";

describe("decidePaymentAction", () => {
  it.each(["created", "shipped", "delivered"] as const)(
    "does nothing to the payment on '%s'",
    (status) => {
      expect(decidePaymentAction({ status })).toEqual({ type: "none" });
    },
  );

  it("fully refunds on 'failed' with no returned amount", () => {
    expect(decidePaymentAction({ status: "failed" })).toEqual({
      type: "refund",
      amountInPiastres: undefined,
    });
  });

  it("fully refunds on 'returned' with no returned amount", () => {
    expect(decidePaymentAction({ status: "returned" })).toEqual({
      type: "refund",
      amountInPiastres: undefined,
    });
  });

  it("partially refunds 'returned' when only part of the order came back", () => {
    expect(
      decidePaymentAction({ status: "returned", returnedAmountInPiastres: 50000 }),
    ).toEqual({ type: "refund", amountInPiastres: 50000 });
  });

  it("partially refunds 'failed' the same way as 'returned'", () => {
    expect(
      decidePaymentAction({ status: "failed", returnedAmountInPiastres: 5000 }),
    ).toEqual({ type: "refund", amountInPiastres: 5000 });
  });
});
