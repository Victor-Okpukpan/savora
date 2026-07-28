"use client";

import { useState, useSyncExternalStore } from "react";
import { walletStore, connectWallet, disconnectWallet } from "@/lib/wallet";
import { WalletIcon } from "@/components/icons";

function truncate(address: string) {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export function WalletConnect() {
  const { connected, address } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const [pending, setPending] = useState(false);

  async function handleConnect() {
    setPending(true);
    try {
      await connectWallet();
    } finally {
      setPending(false);
    }
  }

  if (connected && address) {
    return (
      <button
        type="button"
        onClick={disconnectWallet}
        title="Disconnect wallet"
        className="flex w-full items-center gap-2 rounded-lg border border-foreground/10 px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/20 hover:text-foreground"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-savora-green" />
        {truncate(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-savora-white transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      <WalletIcon className="h-4 w-4" />
      {pending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
