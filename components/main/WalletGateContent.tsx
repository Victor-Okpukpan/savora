"use client";

import { useState, useSyncExternalStore } from "react";
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
  const { connected } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const [pending, setPending] = useState(false);

  if (connected) {
    return <>{children}</>;
  }

  async function handleConnect() {
    setPending(true);
    try {
      await connectWallet();
    } finally {
      setPending(false);
    }
  }

  return (
    <EmptyState
      icon={WalletIcon}
      title={title}
      description={description}
      action={{
        label: pending ? "Connecting…" : "Connect Wallet",
        onClick: handleConnect,
        pending,
      }}
    />
  );
}
