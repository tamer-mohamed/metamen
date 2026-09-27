import { formatPiastres } from "@metamen/core";
import Link from "next/link";
import { orders } from "@/data/orders";
import { getCustomerSummaries } from "@/lib/customers";
import { getIncomeSummaryInPiastres } from "@/lib/income-summary";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatTile } from "@/components/dashboard/StatTile";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardPage() {
  const totalOrders = orders.length;
  const totalRevenueInPiastres = getIncomeSummaryInPiastres(orders);
  const uniqueCustomers = getCustomerSummaries(orders).length;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-3">
          <StatTile
            label="Total Orders"
            value={totalOrders.toLocaleString("en-US")}
          />
          <StatTile
            label="Total Revenue"
            value={formatPiastres(totalRevenueInPiastres)}
          />
          <StatTile
            label="Unique Customers"
            value={uniqueCustomers.toLocaleString("en-US")}
          />
        </div>

        <DashboardCharts orders={orders} />

        <Link
          href="/analytics"
          className="text-sm font-medium text-[var(--series-revenue)] hover:underline"
        >
          View full analytics with filters →
        </Link>
      </div>
    </DashboardShell>
  );
}
