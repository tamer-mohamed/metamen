"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const inputClasses =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10";
const labelClasses = "flex flex-col gap-1 text-sm";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Metamen Demo Store");
  const [contactEmail, setContactEmail] = useState("merchant@example.com");
  const [supportPhone, setSupportPhone] = useState("+20 100 000 0000");
  const [notifyOnNewOrder, setNotifyOnNewOrder] = useState(true);
  const [notifyOnRefund, setNotifyOnRefund] = useState(true);

  return (
    <DashboardShell>
      <div className="flex max-w-xl flex-col gap-8">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Demo only — changes here are not saved and reset on reload.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase text-black/60 dark:text-white/60">
            Store Profile
          </h2>
          <label className={labelClasses}>
            Store name
            <input
              type="text"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Contact email
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Support phone
            <input
              type="tel"
              value={supportPhone}
              onChange={(event) => setSupportPhone(event.target.value)}
              className={inputClasses}
            />
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase text-black/60 dark:text-white/60">
            Payment Connection
          </h2>
          <div className="rounded-md border border-black/10 p-4 text-sm dark:border-white/10">
            <p className="font-medium">Connected via Kashier Connected Account</p>
            <p className="mt-1 text-black/60 dark:text-white/60">
              Metamen never stores or has access to your Kashier secret key — your
              account stays linked through Kashier&apos;s platform connection.
              Status: <span className="text-[var(--state-captured)]">Active (demo)</span>
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase text-black/60 dark:text-white/60">
            Notifications
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notifyOnNewOrder}
              onChange={(event) => setNotifyOnNewOrder(event.target.checked)}
            />
            Email me when a new order comes in
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notifyOnRefund}
              onChange={(event) => setNotifyOnRefund(event.target.checked)}
            />
            Email me when an order is refunded
          </label>
        </section>
      </div>
    </DashboardShell>
  );
}
