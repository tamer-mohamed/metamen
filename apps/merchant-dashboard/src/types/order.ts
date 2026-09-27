import type { Piastres } from "@metamen/core";

export type PaymentState = "authorized" | "captured" | "voided" | "refunded";

export type Order = {
  id: string;
  productName: string;
  amountInPiastres: Piastres;
  paymentState: PaymentState;
  orderDate: string;
  customerName: string;
  customerEmail: string;
};
