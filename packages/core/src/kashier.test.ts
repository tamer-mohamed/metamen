import { afterEach, describe, expect, it, vi } from "vitest";
import {
  captureOrder,
  piastresToKashierAmount,
  refundOrder,
  voidOrder,
} from "./kashier.js";

describe("piastresToKashierAmount", () => {
  it("converts whole piastres to a two-decimal EGP string", () => {
    expect(piastresToKashierAmount(45000)).toBe("450.00");
  });

  it("keeps sub-pound amounts correctly padded", () => {
    expect(piastresToKashierAmount(5)).toBe("0.05");
  });

  it("handles zero", () => {
    expect(piastresToKashierAmount(0)).toBe("0.00");
  });

  it("rejects a non-integer piastres value", () => {
    expect(() => piastresToKashierAmount(450.5)).toThrow(TypeError);
  });

  it("rejects a negative piastres value", () => {
    expect(() => piastresToKashierAmount(-100)).toThrow(TypeError);
  });
});

function mockFetchOnce(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("captureOrder / voidOrder / refundOrder", () => {
  const config = { secretKey: "test-secret" };

  it("captures a full amount against the orders host, not the sessions host", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    const result = await captureOrder(config, { orderId: "ORD-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-fep.kashier.io/v3/orders/ORD-1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ Authorization: "test-secret" }),
      }),
    );
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ apiOperation: "CAPTURE" });
    expect(result.status).toBe("SUCCESS");
  });

  it("captures a partial amount by converting piastres to the order action amount", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    await captureOrder(config, { orderId: "ORD-1", amountInPiastres: 45000 });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      apiOperation: "CAPTURE",
      transaction: { amount: 450 },
    });
  });

  it("voids a specific transaction to release an authorize hold", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    await voidOrder(config, { orderId: "ORD-1", targetTransactionId: "TX-1" });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      apiOperation: "VOID",
      transaction: { targetTransactionId: "TX-1" },
    });
  });

  it("refunds with a reason", async () => {
    const fetchMock = mockFetchOnce(200, { status: "SUCCESS" });

    await refundOrder(config, { orderId: "ORD-1", reason: "RTO" });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      apiOperation: "REFUND",
      reason: "RTO",
    });
  });

  it("throws with the response body when Kashier rejects the request", async () => {
    mockFetchOnce(400, { message: "some failure" });

    await expect(captureOrder(config, { orderId: "ORD-1" })).rejects.toThrow(
      /capture request failed with status 400/,
    );
  });
});
