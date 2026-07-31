"use client";

import dynamic from "next/dynamic";

// lib/contract.ts pulls in sats-connect, which touches browser globals at
// module scope and breaks server-side prerendering -- load it client-only
// (same fix as WalletConnect / GroupsGate).
const TransactionsPanel = dynamic(() => import("@/components/main/TransactionsPanel"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[16rem] flex-1 animate-pulse rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02]" />
  ),
});

export function TransactionsGate() {
  return <TransactionsPanel />;
}
