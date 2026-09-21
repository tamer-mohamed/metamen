/** Money is always an integer count of piastres. Never a float. */
export type Piastres = number;

export function isValidPiastres(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function assertPiastres(value: number): Piastres {
  if (!isValidPiastres(value)) {
    throw new TypeError(
      `Expected a non-negative integer count of piastres, received: ${value}`,
    );
  }
  return value;
}

export function formatPiastres(
  value: Piastres,
  locale = "en-EG",
  currency = "EGP",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    assertPiastres(value) / 100,
  );
}
