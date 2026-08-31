"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { CheckIcon, Spinner } from "@/components/ui/icons";

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: number;
  current: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function change(next: OrderStatus) {
    setStatus(next);
    setSaved(false);
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="status" className="sr-only">
        Order status
      </label>
      <select
        id="status"
        value={status}
        onChange={(e) => change(e.target.value as OrderStatus)}
        disabled={pending}
        className="kode-input max-w-48 cursor-pointer"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {pending ? (
        <Spinner className="h-5 w-5 text-ink-mute" />
      ) : saved ? (
        <span className="inline-flex items-center gap-1 text-sm text-success">
          <CheckIcon className="h-4 w-4" /> Saved
        </span>
      ) : null}
    </div>
  );
}
