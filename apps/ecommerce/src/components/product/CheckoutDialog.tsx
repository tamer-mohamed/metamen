"use client";

import { useEffect, useRef } from "react";

const KASHIER_ORIGIN = "https://payments.kashier.io";

interface KashierMessage {
  message?: string;
  redirectUrl?: string;
}

export default function CheckoutDialog({
  url,
  onSuccess,
  onFailure,
  onClose,
}: {
  url: string;
  onSuccess: () => void;
  onFailure: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent<KashierMessage>) {
      if (event.origin !== KASHIER_ORIGIN) return;

      const message = event.data?.message;
      switch (message) {
        case "paymentSuccess":
        case "success":
          onSuccess();
          break;
        case "failure":
          onFailure();
          break;
        case "urlRedirection": {
          // 3D Secure and similar steps can't render inside a small iframe
          // (the bank's own page typically blocks framing), so escape to the
          // top-level window rather than trying to keep it embedded.
          const redirectUrl = event.data?.redirectUrl;
          if (redirectUrl) window.location.href = redirectUrl;
          break;
        }
        case "closeIframe":
          onClose();
          break;
        default:
          // contentLoaded and any other unrecognized message type: no-op.
          // Never treat an unrecognized message as success (research.md).
          if (process.env.NODE_ENV !== "production") {
            console.log("[CheckoutDialog] unhandled message:", event.data);
          }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onFailure, onClose]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      ref={dialogRef}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className="relative flex h-[85vh] max-h-[820px] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#171717]"
      >
        {/* No close button of our own here — Kashier's checkout renders its
            own, and posts "closeIframe" back to us when it's used (handled
            above). A second overlapping close control was confusing. */}
        <iframe
          src={url}
          title="Kashier checkout"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
