"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { walletStore } from "@/lib/wallet";
import { getMyCircles, isContractDeployed, CIRCLE_STATUS, type MyCircle } from "@/lib/contract";
import { toast } from "@/lib/toast";
import { EmptyState } from "@/components/main/EmptyState";
import { AnalyticsIcon } from "@/components/icons";

function stx(amountUstx: number) {
  return (amountUstx / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function AnalyticsPanel() {
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
      toast.error(err instanceof Error ? err.message : "Failed to load your analytics.");
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
        icon={AnalyticsIcon}
        title="Not deployed yet"
        description="The savings circle contract hasn't been deployed to testnet yet. Once it is, your analytics will show up here."
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
        icon={AnalyticsIcon}
        title="Nothing to analyze yet"
        description="Your contribution and payout totals will show up here once you have some history."
      />
    );
  }

  const totalContributed = circles.reduce((sum, { info }) => sum + info.totalContributed, 0);
  const totalReceived = circles.reduce((sum, { info }) => sum + info.totalReceived, 0);
  const net = totalReceived - totalContributed;
  const completed = circles.filter(({ circle }) => circle.status === CIRCLE_STATUS.ENDED).length;

  const stats = [
    { label: "Total contributed", value: `${stx(totalContributed)} STX` },
    { label: "Total received", value: `${stx(totalReceived)} STX` },
    {
      label: "Net position",
      value: `${net >= 0 ? "+" : ""}${stx(net)} STX`,
      accent: net >= 0,
    },
    { label: "Circles completed", value: String(completed) },
  ];

  return (
    <div className="grid flex-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-foreground/5 p-5">
          <p className="text-xs text-foreground/50">{stat.label}</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              "accent" in stat ? (stat.accent ? "text-savora-green" : "text-foreground") : "text-foreground"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
