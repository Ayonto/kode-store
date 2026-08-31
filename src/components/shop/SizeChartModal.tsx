"use client";

import { useEffect } from "react";
import { CloseIcon, RulerIcon } from "@/components/ui/icons";
import type { SizeChart } from "@/lib/types";

export function SizeChartModal({
  chart,
  title,
  onClose,
}: {
  chart: SizeChart;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Size chart"
    >
      <div
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />
      <div className="animate-scale-in relative w-full max-w-lg overflow-hidden rounded-2xl bg-cream shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <RulerIcon className="h-5 w-5 text-gold-deep" />
            <div>
              <h3 className="font-display text-xl leading-none">Size Chart</h3>
              <p className="mt-1 text-xs text-ink-mute">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand cursor-pointer"
            aria-label="Close size chart"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-5">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {chart.columns.map((col, i) => (
                  <th
                    key={i}
                    className="border-b border-line bg-sand px-3 py-2.5 text-left font-semibold text-ink first:rounded-l-lg last:rounded-r-lg"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row, ri) => (
                <tr key={ri} className="even:bg-paper/60">
                  {chart.columns.map((_, ci) => (
                    <td
                      key={ci}
                      className="border-b border-line px-3 py-2.5 text-ink-soft first:font-medium first:text-ink"
                    >
                      {row[ci] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-ink-mute">
            Measurements are in inches and may vary by ±0.5&quot;. When between
            sizes, we suggest sizing up.
          </p>
        </div>
      </div>
    </div>
  );
}
