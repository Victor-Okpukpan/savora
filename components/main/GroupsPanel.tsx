"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { walletStore } from "@/lib/wallet";
import {
  getMyCircles,
  isContractDeployed,
  joinCircleTx,
  waitForTxConfirmation,
  type MyCircle,
} from "@/lib/contract";
import { toast } from "@/lib/toast";
import { CreateCircleForm } from "@/components/main/CreateCircleForm";
import { CircleCard } from "@/components/main/CircleCard";
import { EmptyState } from "@/components/main/EmptyState";
import { GroupsIcon } from "@/components/icons";

export default function GroupsPanel() {
  const { address } = useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getSnapshot,
    walletStore.getServerSnapshot
  );
  const searchParams = useSearchParams();
  const invitedId = searchParams.get("join");

  const [circles, setCircles] = useState<MyCircle[] | null>(null);
  const [joinId, setJoinId] = useState(invitedId ?? "");
  const [joinPhase, setJoinPhase] = useState<"idle" | "signing" | "confirming">("idle");

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
    // Scheduled via setTimeout, not called directly, so the initial load
    // isn't a synchronous setState call from within the effect body.
    const id = setTimeout(refresh, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(joinId);
    if (!Number.isInteger(id) || id < 0) {
      toast.error("Enter a valid circle ID.");
      return;
    }
    setJoinPhase("signing");
    try {
      const { txid } = await joinCircleTx(id);
      setJoinPhase("confirming");
      await waitForTxConfirmation(txid);
      toast.success("Joined the circle.");
      setJoinId("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join circle.");
    } finally {
      setJoinPhase("idle");
    }
  }

  const joinButtonLabel =
    joinPhase === "signing"
      ? "Confirm in wallet…"
      : joinPhase === "confirming"
        ? "Confirming on-chain…"
        : "Join Circle";

  if (!isContractDeployed()) {
    return (
      <EmptyState
        icon={GroupsIcon}
        title="Not deployed yet"
        description="The savings circle contract hasn't been deployed to testnet yet. Once it is, groups will show up here."
      />
    );
  }

  if (!address) return null; // WalletGate already guards this, but stay safe

  return (
    <div className="flex flex-1 flex-col gap-6">
      {invitedId && (
        <div className="rounded-2xl bg-gradient-brand px-5 py-3 text-sm font-medium text-savora-white">
          You&rsquo;ve been invited to join Circle #{invitedId} — confirm below.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CreateCircleForm onCreated={refresh} />
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4 rounded-2xl border border-foreground/10 p-5"
        >
          <h3 className="text-sm font-semibold text-foreground">Join a circle</h3>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-foreground/60">Circle ID (ask whoever created it)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={joinPhase !== "idle"}
            className="self-start rounded-full border border-foreground/10 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/20 disabled:opacity-60"
          >
            {joinButtonLabel}
          </button>
        </form>
      </div>

      {circles === null ? (
        <div className="min-h-[10rem] flex-1 animate-pulse rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02]" />
      ) : circles.length === 0 ? (
        <EmptyState
          icon={GroupsIcon}
          title="No groups yet"
          description="Create a savings circle above, or join one with its ID."
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
