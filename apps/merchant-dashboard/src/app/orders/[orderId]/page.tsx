import { notFound } from "next/navigation";
import { findOrderById } from "@/data/orders";
import { OrderDetail } from "@/components/dashboard/OrderDetail";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  const order = findOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <DashboardShell>
      <OrderDetail order={order} />
    </DashboardShell>
  );
}
