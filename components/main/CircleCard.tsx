"use client";

import { useEffect, useState } from "react";
import {
  contributeTx,
  leaveCircleTx,
  endCircleTx,
  hasContributedThisRound,
  getCurrentBurnBlockHeight,
  waitForTxConfirmation,
  CIRCLE_STATUS,
  type Circle,
  type MemberInfo,
  type TxResult,
} from "@/lib/contract";
import { toast } from "@/lib/toast";
import { LinkIcon } from "@/components/icons";

const BLOCKS_PER_DAY = 144;

function inviteLink(circleId: number) {
  return `${window.location.origin}${window.location.pathname}?join=${circleId}`;
}

function stx(amountUstx: number) {
  return (amountUstx / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function daysRemaining(blocksRemaining: number) {
  return Math.max(1, Math.ceil(blocksRemaining / BLOCKS_PER_DAY));
}

const STATUS_LABEL: Record<number, string> = {
  [CIRCLE_STATUS.OPEN]: "Waiting for members",
  [CIRCLE_STATUS.ACTIVE]: "Active",
  [CIRCLE_STATUS.ENDED]: "Ended",
};

type CircleCardProps = {
  circle: Circle;
  memberInfo: MemberInfo;
  address: string;
  onChanged: () => void;
};

export function CircleCard({ circle, memberInfo, address, onChanged }: CircleCardProps) {
  const [paidThisRound, setPaidThisRound] = useState<boolean | null>(null);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [action, setAction] = useState<"contribute" | "leave" | "end" | null>(null);
  const [phase, setPhase] = useState<"signing" | "confirming" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (circle.status === CIRCLE_STATUS.ACTIVE) {
      hasContributedThisRound(circle.id, address, address).then((paid) => {
        if (!cancelled) setPaidThisRound(paid);
      });
      if (circle.nextRoundAt > 0) {
        getCurrentBurnBlockHeight().then((height) => {
          if (!cancelled) setBlockHeight(height);
        });
      }
    }
    return () => {
      cancelled = true;
    };
  }, [circle.id, circle.status, circle.contributionsThisRound, circle.nextRoundAt, address]);

  const roundOpen = circle.nextRoundAt === 0 || (blockHeight !== null && blockHeight >= circle.nextRoundAt);

  const isCreator = circle.creator === address;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink(circle.id));
      setCopied(true);
      toast.success("Invite link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link — copy it manually from the address bar instead.");
    }
  }

  async function run(
    actionName: "contribute" | "leave" | "end",
    fn: () => Promise<TxResult>,
    successMessage: string
  ) {
    setAction(actionName);
    setPhase("signing");
    try {
      const { txid } = await fn();
      setPhase("confirming");
      await waitForTxConfirmation(txid);
      toast.success(successMessage);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setAction(null);
      setPhase(null);
    }
  }

  function label(forAction: "contribute" | "leave" | "end", idleLabel: string) {
    if (action !== forAction) return idleLabel;
    return phase === "confirming" ? "Confirming on-chain…" : "Confirm in wallet…";
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-foreground/10 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Circle #{circle.id}</p>
          <p className="text-xs text-foreground/50">
            {stx(circle.contributionAmount)} STX &middot; {circle.joinedCount}/{circle.memberCount}{" "}
            members
            {circle.multiPass ? " · multi-pass" : ""}
          </p>
        </div>
        <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-foreground/70">
          {STATUS_LABEL[circle.status]}
        </span>
      </div>

      {circle.status === CIRCLE_STATUS.ACTIVE && (
        <p className="text-xs text-foreground/60">
          Pass {circle.currentPass} &middot; {circle.contributionsThisRound}/{circle.memberCount}{" "}
          paid in this round
          {!roundOpen && blockHeight !== null && (
            <> &middot; next round opens in ~{daysRemaining(circle.nextRoundAt - blockHeight)}{" "}
            {daysRemaining(circle.nextRoundAt - blockHeight) === 1 ? "day" : "days"}</>
          )}
        </p>
      )}

      {circle.status !== CIRCLE_STATUS.OPEN && (
        <div className="flex gap-4 rounded-xl bg-foreground/3 px-3 py-2 text-xs">
          <span className="text-foreground/60">
            You&rsquo;ve paid in{" "}
            <span className="font-semibold text-foreground">{stx(memberInfo.totalContributed)} STX</span>
          </span>
          <span className="text-foreground/60">
            You&rsquo;ve received{" "}
            <span className="font-semibold text-savora-green">{stx(memberInfo.totalReceived)} STX</span>
          </span>
        </div>
      )}

      {circle.status === CIRCLE_STATUS.OPEN && (
        <button
          type="button"
          onClick={copyInvite}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/20 hover:text-foreground"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      )}

      {!memberInfo.hasLeft && circle.status === CIRCLE_STATUS.ACTIVE && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={action !== null || paidThisRound !== false || !roundOpen}
            onClick={() =>
              run(
                "contribute",
                () => contributeTx(circle.id, circle.contributionAmount, address),
                "Contribution sent."
              )
            }
            className="rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-savora-white disabled:opacity-60"
          >
            {label(
              "contribute",
              paidThisRound ? "Paid this round" : !roundOpen ? "Round not open yet" : "Contribute"
            )}
          </button>
          <button
            type="button"
            disabled={action !== null}
            onClick={() => run("leave", () => leaveCircleTx(circle.id), "You left the circle.")}
            className="rounded-full border border-foreground/10 px-4 py-2 text-xs font-medium text-foreground/70 disabled:opacity-60"
          >
            {label("leave", "Leave")}
          </button>
          {isCreator && circle.multiPass && circle.passComplete && (
            <button
              type="button"
              disabled={action !== null}
              onClick={() => run("end", () => endCircleTx(circle.id), "Circle ended.")}
              className="rounded-full border border-foreground/10 px-4 py-2 text-xs font-medium text-foreground/70 disabled:opacity-60"
            >
              {label("end", "End circle")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
