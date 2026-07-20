"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/actions";
import { TrashIcon, Spinner } from "@/components/ui/icons";

export function DeleteProductButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete “${name}”? This cannot be undone.`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer disabled:opacity-50"
      aria-label={`Delete ${name}`}
    >
      {pending ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
    </button>
  );
}
