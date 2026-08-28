"use client";

import { useState, useTransition } from "react";
import { setOrderVerified } from "@/app/admin/actions";
import { CheckIcon, Spinner } from "@/components/ui/icons";

export function OrderVerifiedToggle({
  orderId,
  initial,
  size = "sm",
}: {
  orderId: number;
  initial: boolean;
  size?: "sm" | "md";
}) {
  const [verified, setVerified] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !verified;
    setVerified(next);
    startTransition(() => setOrderVerified(orderId, next));
  }

  const pad = size === "md" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={verified}
      title="Click to toggle — set once you've called the customer to confirm"
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition cursor-pointer disabled:opacity-60 ${pad} ${
        verified
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
      }`}
    >
      {pending ? (
        <Spinner className="h-3.5 w-3.5" />
      ) : verified ? (
        <CheckIcon className="h-3.5 w-3.5" />
      ) : null}
      {verified ? "Verified" : "Unverified"}
    </button>
  );
}
