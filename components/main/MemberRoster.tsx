"use client";

import { useEffect, useState } from "react";
import { getCircleMember, hasContributedThisRound, CIRCLE_STATUS, type Circle } from "@/lib/contract";

type RosterMember = {
  index: number;
  address: string;
  paidThisRound: boolean | null;
};

function truncate(address: string) {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export function MemberRoster({ circle, myAddress }: { circle: Circle; myAddress: string }) {
  const [members, setMembers] = useState<RosterMember[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const entries: RosterMember[] = [];
      for (let i = 0; i < circle.joinedCount; i++) {
        const memberAddress = await getCircleMember(circle.id, i, myAddress);
        if (!memberAddress) continue;
        const paidThisRound =
          circle.status === CIRCLE_STATUS.ACTIVE
            ? await hasContributedThisRound(circle.id, memberAddress, myAddress)
            : null;
        entries.push({ index: i, address: memberAddress, paidThisRound });
      }
      if (!cancelled) setMembers(entries);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [circle.id, circle.joinedCount, circle.status, circle.contributionsThisRound, myAddress]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-foreground/10 p-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Circle #{circle.id}</p>
        <p className="text-xs text-foreground/50">
          {circle.joinedCount}/{circle.memberCount} members
        </p>
      </div>

      {members === null ? (
        <div className="h-16 animate-pulse rounded-xl bg-foreground/3" />
      ) : (
        <div className="flex flex-col gap-1.5">
          {members.map((member) => (
            <div
              key={member.index}
              className="flex items-center justify-between rounded-lg bg-foreground/3 px-3 py-2 text-xs"
            >
              <span className="flex items-center gap-2 text-foreground/80">
                {truncate(member.address)}
                {member.address === myAddress && (
                  <span className="text-foreground/40">(you)</span>
                )}
                {circle.status !== CIRCLE_STATUS.OPEN && member.index === circle.currentIndex && (
                  <span className="rounded-full bg-savora-blue/10 px-2 py-0.5 text-[10px] font-medium text-savora-blue">
                    Next payout
                  </span>
                )}
              </span>
              {member.paidThisRound !== null && (
                <span
                  className={
                    member.paidThisRound
                      ? "font-medium text-savora-green"
                      : "font-medium text-foreground/40"
                  }
                >
                  {member.paidThisRound ? "Paid" : "Not paid yet"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
