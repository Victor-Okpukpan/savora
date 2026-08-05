"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { walletStore } from "@/lib/wallet";
import {
  getMyCircles,
  hasContributedThisRound,
  isContractDeployed,
  CIRCLE_STATUS,
  type MyCircle,
} from "@/lib/contract";
import { toast } from "@/lib/toast";
import { CircleCard } from "@/components/main/CircleCard";
import { EmptyState } from "@/components/main/EmptyState";
import { ContributionsIcon } from "@/components/icons";

type ActiveCircle = MyCircle & { paidThisRound: boolean };

export default function ContributionsPanel() {
  const { address } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const [circles, setCircles] = useState<ActiveCircle[] | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setCircles(null);
    try {
      const myCircles = await getMyCircles(address);
      const active = myCircles.filter(
        ({ circle, info }) => circle.status === CIRCLE_STATUS.ACTIVE && !info.hasLeft
      );
      const withStatus = await Promise.all(
        active.map(async (mc) => ({
          ...mc,
          paidThisRound: await hasContributedThisRound(mc.circle.id, address, address),
        }))
      );
      // Circles you still owe a contribution to come first.
      withStatus.sort((a, b) => Number(a.paidThisRound) - Number(b.paidThisRound));
      setCircles(withStatus);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load your contributions.");
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
        icon={ContributionsIcon}
        title="Not deployed yet"
        description="The savings circle contract hasn't been deployed yet. Once it is, your contributions will show up here."
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
        icon={ContributionsIcon}
        title="Nothing due right now"
        description="Once you're in an active circle, what you owe each round will show up here."
      />
    );
  }

  const owed = circles.filter((c) => !c.paidThisRound).length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-sm text-foreground/60">
        {owed === 0
          ? "You're paid up on every active circle."
          : `You have ${owed} contribution${owed === 1 ? "" : "s"} due right now.`}
      </p>
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
    </div>
  );
}
