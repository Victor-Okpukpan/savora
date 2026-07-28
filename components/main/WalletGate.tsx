"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// @stacks/connect touches browser globals at module scope, which breaks
// server-side prerendering — load it client-only (same fix as WalletConnect).
const WalletGateContent = dynamic(() => import("./WalletGateContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[16rem] flex-1 animate-pulse rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02]" />
  ),
});

type WalletGateProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function WalletGate({ title, description, children }: WalletGateProps) {
  return (
    <WalletGateContent title={title} description={description}>
      {children}
    </WalletGateContent>
  );
}
