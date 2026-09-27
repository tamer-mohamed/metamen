import { describe, expect, it } from "vitest";
import { piastresToKashierAmount } from "./kashier.js";

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
