"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { walletStore } from "@/lib/wallet";
import {
  getContractTransactions,
  isContractDeployed,
  type ContractTransaction,
} from "@/lib/contract";
import { toast } from "@/lib/toast";
import { explorerTxUrl } from "@/lib/network";
import { EmptyState } from "@/components/main/EmptyState";
import { WalletIcon } from "@/components/icons";

const ACTION_LABEL: Record<string, string> = {
  "create-circle": "Created",
  "join-circle": "Joined",
  contribute: "Contributed to",
  "leave-circle": "Left",
  "end-circle": "Ended",
};

function describe(tx: ContractTransaction) {
  const action = ACTION_LABEL[tx.functionName] ?? tx.functionName;
  const circle = tx.circleId !== null ? `Circle #${tx.circleId}` : "the contract";
  return `${action} ${circle}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TransactionsPanel() {
  const { address } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const [transactions, setTransactions] = useState<ContractTransaction[] | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setTransactions(null);
    try {
      setTransactions(await getContractTransactions(address));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load your transactions.");
      setTransactions([]);
    }
  }, [address]);

  useEffect(() => {
    const id = setTimeout(refresh, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  if (!isContractDeployed()) {
    return (
      <EmptyState
        icon={WalletIcon}
        title="Not deployed yet"
        description="The savings circle contract hasn't been deployed yet. Once it is, your transactions will show up here."
      />
    );
  }

  if (!address) return null; // WalletGate already guards this, but stay safe

  if (transactions === null) {
    return (
      <div className="min-h-[10rem] flex-1 animate-pulse rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02]" />
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={WalletIcon}
        title="No transactions yet"
        description="On-chain contributions and payouts will appear here as they happen."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      {transactions.map((tx) => (
        <a
          key={tx.txid}
          href={explorerTxUrl(tx.txid)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl border border-foreground/10 px-5 py-3.5 text-sm transition-colors hover:border-foreground/20"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-savora-blue/10 text-savora-blue">
              <WalletIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">{describe(tx)}</p>
              <p className="text-xs text-foreground/50">{formatDate(tx.blockTimeIso)}</p>
            </div>
          </div>
          <span
            className={
              tx.status === "success"
                ? "text-xs font-medium text-savora-green"
                : "text-xs font-medium text-red-500"
            }
          >
            {tx.status === "success" ? "Confirmed" : "Failed"}
          </span>
        </a>
      ))}
    </div>
  );
}
