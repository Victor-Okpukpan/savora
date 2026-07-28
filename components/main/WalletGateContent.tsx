"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { walletStore, connectWallet } from "@/lib/wallet";
import { WalletIcon } from "@/components/icons";
import { EmptyState } from "@/components/main/EmptyState";

type WalletGateContentProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function WalletGateContent({
  title,
  description,
  children,
}: WalletGateContentProps) {
  const { connected, connecting } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );

  if (connected) {
    return <>{children}</>;
  }

  return (
    <EmptyState
      icon={WalletIcon}
      title={title}
      description={description}
      action={{
        label: connecting ? "Connecting…" : "Connect Wallet",
        onClick: connectWallet,
        pending: connecting,
      }}
    />
  );
}
