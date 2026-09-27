"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const inputClasses =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10";
const labelClasses = "flex flex-col gap-1 text-sm";

const FAQ_ITEMS = [
  {
    question: "What do the payment states mean?",
    answer:
      "Authorized: the payment method is verified and funds are held. Captured: the payment has been successfully collected. Voided: an authorization hold was released before it was ever captured. Refunded: a captured payment was returned to the customer.",
  },
  {
    question: "Why does my income summary include refunded orders?",
    answer:
      "Income reflects orders that were successfully captured at some point. A later refund doesn't retroactively remove it from this total — see Analytics for a full breakdown by payment state.",
  },
  {
    question: "Is my Kashier account safe with Metamen?",
    answer:
      "Yes. Metamen never stores or has access to your Kashier secret key. Your account connects through a Kashier Connected Account, so you keep full control of your funds.",
  },
  {
    question: "How do shipping quotes work?",
    answer:
      "We compare per-order rates from multiple shipping carriers across three categories — shipping, returns, and storage. Each carrier has volume tiers, so your rates automatically get cheaper as your order count crosses each threshold. This is shown on the Shipping page.",
  },
  {
    question: "Can I export my orders or analytics?",
    answer:
      "Export is on our roadmap. For now you can filter by date, product, and payment state on the Orders and Analytics pages.",
  },
];

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <DashboardShell>
      <div className="flex max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-lg font-semibold">Support</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Demo only — the form below doesn&apos;t send a real message.
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase text-black/60 dark:text-white/60">
            Contact us
          </h2>
          <div className="rounded-md border border-black/10 p-4 text-sm dark:border-white/10">
            <p>
              Email:{" "}
              <span className="font-medium">support@metamen.example</span>
            </p>
            <p className="mt-1">
              Phone: <span className="font-medium">+20 100 000 0001</span>
            </p>
            <p className="mt-1 text-black/60 dark:text-white/60">
              Sun–Thu, 9am–6pm Cairo time
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase text-black/60 dark:text-white/60">
            Frequently asked questions
          </h2>
          <div className="flex flex-col divide-y divide-black/10 rounded-md border border-black/10 dark:divide-white/10 dark:border-white/10">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group p-4">
                <summary className="cursor-pointer text-sm font-medium marker:content-none">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase text-black/60 dark:text-white/60">
            Send us a message
          </h2>
          {submitted ? (
            <div className="rounded-md border border-black/10 p-4 text-sm dark:border-white/10">
              <p className="font-medium text-[var(--state-captured)]">
                Message sent (demo)
              </p>
              <p className="mt-1 text-black/60 dark:text-white/60">
                In the real app, our team would get back to you within one
                business day.
              </p>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <label className={labelClasses}>
                Name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClasses}
                />
              </label>
              <label className={labelClasses}>
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClasses}
                />
              </label>
              <label className={labelClasses}>
                Message
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className={inputClasses}
                />
              </label>
              <button
                type="submit"
                className="self-start rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
              >
                Send message
              </button>
            </form>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
