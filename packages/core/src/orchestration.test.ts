import { afterEach, describe, expect, it, vi } from "vitest";
import { applyFulfillmentUpdate, applyVerifiedFulfillmentUpdate } from "./orchestration.js";

function fakeResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

function mockFetchOnce(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(fakeResponse(status, body));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** For flows that call fetch more than once (e.g. verify-then-act) — responses are consumed in order. */
function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  const fetchMock = vi.fn();
  for (const { status, body } of responses) {
    fetchMock.mockImplementationOnce(() => Promise.resolve(fakeResponse(status, body)));
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("applyFulfillmentUpdate", () => {
  const config = { secretKey: "test-secret" };

  it("does not call Kashier at all when the order is delivered", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    const result = await applyFulfillmentUpdate(config, "ORD-1", {
      status: "delivered",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ type: "none" });
  });

  it("fully refunds the order when the courier reports it returned", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    const result = await applyFulfillmentUpdate(config, "ORD-1", {
      status: "returned",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-fep.kashier.io/v3/orders/ORD-1",
      expect.objectContaining({ method: "PUT" }),
    );
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ apiOperation: "REFUND" });
    expect(result).toEqual({ status: "SUCCESS", raw: { status: "SUCCESS" } });
  });

  it("partially refunds when only part of the order was returned", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    await applyFulfillmentUpdate(config, "ORD-1", {
      status: "returned",
      returnedAmountInPiastres: 50000,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      apiOperation: "REFUND",
      transaction: { amount: 500 },
    });
  });

  it("propagates a Kashier failure instead of swallowing it", async () => {
    mockFetchOnce(400, { message: "refund window closed" });

    await expect(
      applyFulfillmentUpdate(config, "ORD-1", { status: "failed" }),
    ).rejects.toThrow(/refund request failed with status 400/);
  });
});

describe("applyVerifiedFulfillmentUpdate", () => {
  const config = { secretKey: "test-secret" };

  it("verifies the transaction with Kashier before refunding", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { body: { status: "SUCCESS", order: { orderId: "ORD-1" } } } },
      { status: 200, body: { status: "SUCCESS" } },
    ]);

    const result = await applyVerifiedFulfillmentUpdate(config, {
      orderId: "ORD-1",
      transactionId: "TX-1",
      update: { status: "returned", returnedAmountInPiastres: 50000 },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://test-api.kashier.io/v2/aggregator/transactions/TX-1",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://test-fep.kashier.io/v3/orders/ORD-1",
    );
    expect(result).toEqual({
      outcome: "applied",
      action: { status: "SUCCESS", raw: { status: "SUCCESS" } },
    });
  });

  it("refuses to act when the transaction isn't SUCCESS, without ever calling refund", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { body: { status: "PENDING", order: { orderId: "ORD-1" } } } },
    ]);

    const result = await applyVerifiedFulfillmentUpdate(config, {
      orderId: "ORD-1",
      transactionId: "TX-1",
      update: { status: "returned" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      outcome: "rejected",
      reason: expect.stringContaining("'PENDING'"),
    });
  });

  it("refuses to act when the transaction belongs to a different order than claimed", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { body: { status: "SUCCESS", order: { orderId: "ORD-someone-else" } } } },
    ]);

    const result = await applyVerifiedFulfillmentUpdate(config, {
      orderId: "ORD-1",
      transactionId: "TX-1",
      update: { status: "returned" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      outcome: "rejected",
      reason: expect.stringContaining("mismatched pair"),
    });
  });

  it("still verifies but never calls refund for a no-op status like delivered", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { body: { status: "SUCCESS", order: { orderId: "ORD-1" } } } },
    ]);

    const result = await applyVerifiedFulfillmentUpdate(config, {
      orderId: "ORD-1",
      transactionId: "TX-1",
      update: { status: "delivered" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://test-api.kashier.io/v2/aggregator/transactions/TX-1",
    );
    expect(result).toEqual({ outcome: "applied", action: { type: "none" } });
  });
});
