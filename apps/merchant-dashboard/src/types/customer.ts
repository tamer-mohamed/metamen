import type { Piastres } from "@metamen/core";

export type CustomerSummary = {
  name: string;
  email: string;
  orderCount: number;
  totalSpentInPiastres: Piastres;
};
