"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/analytics", label: "Analytics" },
  { href: "/shipping", label: "Shipping" },
  { href: "/settings", label: "Settings" },
  { href: "/support", label: "Support" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 border-b border-black/10 px-4 py-4 dark:border-white/10 sm:w-56 sm:flex-none sm:border-b-0 sm:border-r sm:px-4 sm:py-6">
      <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
        <Link href="/" className="text-lg font-semibold">
          Metamen
        </Link>
        <span className="text-sm text-black/60 dark:text-white/60">
          Demo Merchant
        </span>
      </div>
      <nav className="flex flex-row flex-wrap gap-1 sm:flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black/[0.06] dark:bg-white/[0.08]"
                  : "text-black/60 hover:bg-black/[0.03] dark:text-white/60 dark:hover:bg-white/[0.03]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
