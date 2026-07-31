"use client";

import { useState } from "react";
import { createCircleTx, waitForTxConfirmation } from "@/lib/contract";
import { toast } from "@/lib/toast";

type Phase = "idle" | "signing" | "confirming";

// ~144 Bitcoin blocks/day at 10 min each -- matches the contract's own cap
// comment (MAX_CYCLE_LENGTH_BLOCKS).
const BLOCKS_PER_DAY = 144;

export function CreateCircleForm({ onCreated }: { onCreated: () => void }) {
  const [amount, setAmount] = useState("10");
  const [members, setMembers] = useState("5");
  const [cycleDays, setCycleDays] = useState("30");
  const [multiPass, setMultiPass] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const stx = Number(amount);
    const memberCount = Number(members);
    const days = Number(cycleDays);
    if (!Number.isFinite(stx) || stx <= 0) {
      toast.error("Enter a valid contribution amount.");
      return;
    }
    if (!Number.isInteger(memberCount) || memberCount < 2) {
      toast.error("A circle needs at least 2 members.");
      return;
    }
    if (!Number.isFinite(days) || days < 0) {
      toast.error("Enter a valid number of days between rounds (0 for no minimum).");
      return;
    }

    setPhase("signing");
    try {
      const { txid } = await createCircleTx(
        Math.round(stx * 1_000_000),
        memberCount,
        multiPass,
        Math.round(days * BLOCKS_PER_DAY)
      );
      setPhase("confirming");
      await waitForTxConfirmation(txid);
      toast.success("Circle created.");
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create circle.");
    } finally {
      setPhase("idle");
    }
  }

  const buttonLabel =
    phase === "signing"
      ? "Confirm in wallet…"
      : phase === "confirming"
        ? "Confirming on-chain…"
        : "Create Circle";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-foreground/10 p-5"
    >
      <h3 className="text-sm font-semibold text-foreground">Create a savings circle</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground/60">Contribution per round (STX)</span>
          <input
            type="number"
            min="0"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground/60">Number of members</span>
          <input
            type="number"
            min="2"
            step="1"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-foreground"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-foreground/60">
          Minimum days between rounds (0 = no wait, rounds can happen back-to-back)
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={cycleDays}
          onChange={(e) => setCycleDays(e.target.value)}
          className="w-32 rounded-lg border border-foreground/10 bg-background px-3 py-2 text-foreground"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          checked={multiPass}
          onChange={(e) => setMultiPass(e.target.checked)}
        />
        Keep running after everyone&rsquo;s been paid once (multi-pass)
      </label>
      <button
        type="submit"
        disabled={phase !== "idle"}
        className="self-start rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-savora-white transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
