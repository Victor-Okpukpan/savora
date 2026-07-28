"use client";

import { useSyncExternalStore } from "react";
import { toastStore, dismissToast, type Toast } from "@/lib/toast";

const VARIANT_STYLES: Record<Toast["variant"], string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-500",
  success: "border-savora-green/30 bg-savora-green/10 text-savora-green",
  info: "border-foreground/10 bg-background text-foreground",
};

export function Toaster() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot
  );

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-100 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${VARIANT_STYLES[t.variant]}`}
        >
          <p className="flex-1">{t.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="shrink-0 text-xs opacity-60 transition-opacity hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
