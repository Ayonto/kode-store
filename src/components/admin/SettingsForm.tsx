"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import { Spinner, CheckIcon } from "@/components/ui/icons";
import type { StoreSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [inside, setInside] = useState(String(settings.deliveryInsideDhaka));
  const [outside, setOutside] = useState(String(settings.deliveryOutsideDhaka));
  const [threshold, setThreshold] = useState(
    settings.freeDeliveryThreshold ? String(settings.freeDeliveryThreshold) : ""
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveSettings({
          storeName: settings.storeName,
          deliveryInsideDhaka: Number(inside) || 0,
          deliveryOutsideDhaka: Number(outside) || 0,
          freeDeliveryThreshold: threshold ? Number(threshold) : null,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        setError("Could not save settings.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-6">
      <div className="rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-2xl">Delivery charges</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Set the standard delivery charge by zone. Products marked “free
          delivery” always ship free.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Inside Dhaka (৳)
            </span>
            <input
              value={inside}
              onChange={(e) => setInside(e.target.value)}
              inputMode="numeric"
              className="kode-input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Outside Dhaka (৳)
            </span>
            <input
              value={outside}
              onChange={(e) => setOutside(e.target.value)}
              inputMode="numeric"
              className="kode-input"
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">
            Free delivery over (৳) — optional
          </span>
          <input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            inputMode="numeric"
            className="kode-input"
            placeholder="Leave empty to disable"
          />
          <span className="mt-1.5 block text-xs text-ink-mute">
            Orders at or above this subtotal get free delivery automatically.
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-70 cursor-pointer"
        >
          {pending ? (
            <>
              <Spinner className="h-5 w-5" /> Saving…
            </>
          ) : (
            "Save settings"
          )}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <CheckIcon className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
