"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { walletStore } from "@/lib/wallet";
import {
  getMyCircles,
  getWalletBalance,
  isContractDeployed,
  CIRCLE_STATUS,
  type MyCircle,
} from "@/lib/contract";
import { toast } from "@/lib/toast";
import { CircleCard } from "@/components/main/CircleCard";
import { EmptyState } from "@/components/main/EmptyState";
import { GroupsIcon } from "@/components/icons";

function stx(amountUstx: number) {
  return (amountUstx / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function DashboardPanel() {
  const { address } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const [balance, setBalance] = useState<number | null>(null);
  const [circles, setCircles] = useState<MyCircle[] | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setBalance(null);
    setCircles(null);
    try {
      const [bal, myCircles] = await Promise.all([
        getWalletBalance(address),
        getMyCircles(address),
      ]);
      setBalance(bal);
      setCircles(myCircles);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load your dashboard.");
      setCircles([]);
    }
  }, [address]);

  useEffect(() => {
    const id = setTimeout(refresh, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  if (!isContractDeployed()) {
    return (
      <EmptyState
        icon={GroupsIcon}
        title="Not deployed yet"
        description="The savings circle contract hasn't been deployed to testnet yet. Once it is, your dashboard will show up here."
      />
    );
  }

  if (!address) return null; // WalletGate already guards this, but stay safe

  const activeCount = (circles ?? []).filter(
    ({ circle, info }) => circle.status === CIRCLE_STATUS.ACTIVE && !info.hasLeft
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-foreground/5 p-5">
          <p className="text-xs text-foreground/50">Wallet Balance</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {balance === null ? "…" : `${stx(balance)} STX`}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/5 p-5">
          <p className="text-xs text-foreground/50">Active Groups</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {circles === null ? "…" : activeCount}
          </p>
        </div>
      </div>

      {circles === null ? (
        <div className="min-h-[10rem] flex-1 animate-pulse rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02]" />
      ) : circles.length === 0 ? (
        <EmptyState
          icon={GroupsIcon}
          title="No savings circles yet"
          description="Create or join an Ajo-style savings circle from My Groups."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {circles.map(({ circle, info }) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              memberInfo={info}
              address={address}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
