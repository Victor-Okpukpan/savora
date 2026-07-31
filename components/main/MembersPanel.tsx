"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { walletStore } from "@/lib/wallet";
import { getMyCircles, isContractDeployed, type MyCircle } from "@/lib/contract";
import { toast } from "@/lib/toast";
import { MemberRoster } from "@/components/main/MemberRoster";
import { EmptyState } from "@/components/main/EmptyState";
import { UserIcon } from "@/components/icons";

export default function MembersPanel() {
  const { address } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const [circles, setCircles] = useState<MyCircle[] | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setCircles(null);
    try {
      setCircles(await getMyCircles(address));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load your circles.");
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
        icon={UserIcon}
        title="Not deployed yet"
        description="The savings circle contract hasn't been deployed to testnet yet. Once it is, members will show up here."
      />
    );
  }

  if (!address) return null; // WalletGate already guards this, but stay safe

  if (circles === null) {
    return (
      <div className="min-h-[10rem] flex-1 animate-pulse rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02]" />
    );
  }

  if (circles.length === 0) {
    return (
      <EmptyState
        icon={UserIcon}
        title="No members yet"
        description="Once you create or join a circle, you'll see fellow members here."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {circles.map(({ circle }) => (
        <MemberRoster key={circle.id} circle={circle} myAddress={address} />
      ))}
    </div>
  );
}
