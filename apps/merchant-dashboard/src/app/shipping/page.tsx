import { orders } from "@/data/orders";
import { shippingPlans } from "@/data/shipping-plans";
import { ShippingPlansList } from "@/components/shipping/ShippingPlansList";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ShippingPage() {
  const orderCount = orders.length;

  return (
    <DashboardShell>
      <div className="flex max-w-2xl flex-col gap-4">
        <div>
          <h1 className="text-lg font-semibold">Shipping</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Your rates improve automatically as your order volume grows.
            You&apos;ve placed {orderCount} orders — track your progress toward
            each carrier&apos;s next pricing tier below. Coming soon to your
            orders; demo plans shown.
          </p>
        </div>
        <ShippingPlansList plans={shippingPlans} orderCount={orderCount} />
      </div>
    </DashboardShell>
  );
}
