import { afterEach, describe, expect, it, vi } from "vitest";
import { applyFulfillmentUpdate } from "./orchestration.js";

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
