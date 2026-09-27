import { orders } from "@/data/orders";
import { getCustomerSummaries } from "@/lib/customers";
import { CustomersList } from "@/components/dashboard/CustomersList";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function CustomersPage() {
  const customers = getCustomerSummaries(orders);

  return (
    <DashboardShell>
      <CustomersList customers={customers} />
    </DashboardShell>
  );
}
