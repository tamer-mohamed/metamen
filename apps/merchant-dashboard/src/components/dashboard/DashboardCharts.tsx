import {
  getOrderVolumeTrend,
  getPaymentStateBreakdown,
  getRevenueShareByProduct,
  getReturnsTrend,
  getRevenueTrend,
} from "@/lib/analytics";
import { getTopCustomersBySpend } from "@/lib/customers";
import type { Order, PaymentState } from "@/types/order";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { RankedBarList } from "@/components/charts/RankedBarList";
import { PAYMENT_STATE_LABELS } from "./PaymentStateBadge";

const PAYMENT_STATE_COLOR_VAR: Record<PaymentState, string> = {
  authorized: "var(--state-authorized)",
  captured: "var(--state-captured)",
  voided: "var(--state-voided)",
  refunded: "var(--state-refunded)",
};

const DONUT_SLICE_COLORS = [
  "var(--series-revenue)",
  "var(--series-orders)",
  "var(--state-captured)",
  "var(--state-authorized)",
  "var(--donut-slice-5)",
];

export function DashboardCharts({ orders }: { orders: Order[] }) {
  const revenueTrend = getRevenueTrend(orders);
  const orderVolumeTrend = getOrderVolumeTrend(orders);
  const returnsTrend = getReturnsTrend(orders);
  const paymentStateBreakdown = getPaymentStateBreakdown(orders);
  const topCustomers = getTopCustomersBySpend(orders);
  const revenueShareByProduct = getRevenueShareByProduct(orders);
  const totalRevenueInPiastres = revenueShareByProduct.reduce(
    (sum, slice) => sum + slice.valueInPiastres,
    0,
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">Overview</h2>
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
        <LineChart
          title="Revenue over time"
          data={revenueTrend}
          color="var(--series-revenue)"
          format="currency"
        />
        <LineChart
          title="Orders over time"
          data={orderVolumeTrend}
          color="var(--series-orders)"
          format="count"
        />
        <LineChart
          title="Returns over time"
          data={returnsTrend}
          color="var(--series-returns)"
          format="count"
        />
        <BarChart
          title="Orders by payment state"
          bars={paymentStateBreakdown.map(({ state, count }) => ({
            label: PAYMENT_STATE_LABELS[state],
            value: count,
            color: PAYMENT_STATE_COLOR_VAR[state],
          }))}
          format="count"
        />
        <DonutChart
          title="Revenue share by product"
          totalLabel="Total revenue"
          totalValueInPiastres={totalRevenueInPiastres}
          slices={revenueShareByProduct.map((slice, index) => ({
            ...slice,
            color: DONUT_SLICE_COLORS[index] ?? "var(--chart-muted)",
          }))}
        />
        <RankedBarList
          title="Top customers by spend"
          color="var(--donut-slice-5)"
          entries={topCustomers}
        />
      </div>
    </section>
  );
}
