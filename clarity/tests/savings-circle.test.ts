import { describe, expect, it } from "vitest";
import { Cl, ClarityValue, cvToJSON } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const carol = accounts.get("wallet_3")!;
const outsider = accounts.get("wallet_8")!;

const CONTRACT = "savings-circle-v2";
const CONTRIBUTION = 10_000_000; // 10 STX

const STATUS_OPEN = 0;
const STATUS_ACTIVE = 1;
const STATUS_ENDED = 2;

function stxBalance(address: string) {
  const { result } = simnet.execute(`(stx-get-balance '${address})`);
  return (result as any).value as bigint;
}

function createCircle(
  creator: string,
  memberCount: number,
  multiPass: boolean,
  cycleLengthBlocks = 0
) {
  return simnet.callPublicFn(
    CONTRACT,
    "create-circle",
    [Cl.uint(CONTRIBUTION), Cl.uint(memberCount), Cl.bool(multiPass), Cl.uint(cycleLengthBlocks)],
    creator
  );
}

function joinCircle(circleId: number, member: string) {
  return simnet.callPublicFn(CONTRACT, "join-circle", [Cl.uint(circleId)], member);
}

function contribute(circleId: number, member: string) {
  return simnet.callPublicFn(CONTRACT, "contribute", [Cl.uint(circleId)], member);
}

// Runs one full round: every member in `members` contributes once, in order.
function runRound(circleId: number, members: string[]) {
  return members.map((m) => contribute(circleId, m));
}

// Runs a full pass for a circle: `members.length` rounds, each of
// `members.length` contributions, paying out to each member exactly once.
function runFullPass(circleId: number, members: string[]) {
  for (let round = 0; round < members.length; round++) {
    runRound(circleId, members);
  }
}

function circleField(circleId: number, field: string): ClarityValue {
  const { result } = simnet.callReadOnlyFn(
    CONTRACT,
    "get-circle",
    [Cl.uint(circleId)],
    deployer
  );
  const json = cvToJSON(result);
  if (!json.value) throw new Error(`circle ${circleId} not found`);
  return json.value.value[field];
}

function memberField(circleId: number, member: string, field: string) {
  const { result } = simnet.callReadOnlyFn(
    CONTRACT,
    "get-member-info",
    [Cl.uint(circleId), Cl.principal(member)],
    deployer
  );
  const json = cvToJSON(result);
  if (!json.value) throw new Error(`member ${member} not found in circle ${circleId}`);
  return json.value.value[field].value;
}

describe("create-circle", () => {
  it("creator automatically joins as member #0", () => {
    const { result } = createCircle(alice, 3, false);
    expect(result).toBeOk(Cl.uint(0));

    const slot0 = simnet.callReadOnlyFn(
      CONTRACT,
      "get-circle-member",
      [Cl.uint(0), Cl.uint(0)],
      deployer
    ).result;
    expect(slot0).toBeSome(Cl.principal(alice));

    expect(circleField(0, "joined-count").value).toBe("1");
    expect(circleField(0, "status").value).toBe(String(STATUS_OPEN));
  });

  it("rejects a zero contribution amount, fewer than 2 members, or a cycle length over the sanity cap", () => {
    const zeroAmount = simnet.callPublicFn(
      CONTRACT,
      "create-circle",
      [Cl.uint(0), Cl.uint(3), Cl.bool(false), Cl.uint(0)],
      alice
    );
    expect(zeroAmount.result).toBeErr(Cl.uint(111));

    const tooFewMembers = simnet.callPublicFn(
      CONTRACT,
      "create-circle",
      [Cl.uint(CONTRIBUTION), Cl.uint(1), Cl.bool(false), Cl.uint(0)],
      alice
    );
    expect(tooFewMembers.result).toBeErr(Cl.uint(111));

    const cycleTooLong = simnet.callPublicFn(
      CONTRACT,
      "create-circle",
      [Cl.uint(CONTRIBUTION), Cl.uint(3), Cl.bool(false), Cl.uint(105_121)],
      alice
    );
    expect(cycleTooLong.result).toBeErr(Cl.uint(111));
  });
});

describe("join-circle", () => {
  it("fills remaining slots and flips the circle to active once full", () => {
    createCircle(alice, 3, false); // circle 0, alice already slot 0

    joinCircle(0, bob);
    expect(circleField(0, "status").value).toBe(String(STATUS_OPEN));

    joinCircle(0, carol);
    expect(circleField(0, "status").value).toBe(String(STATUS_ACTIVE));
  });

  it("rejects joining a circle you're already in, while it's still open", () => {
    createCircle(alice, 3, false); // circle 0, still open (needs 2 more)

    const rejoin = simnet.callPublicFn(CONTRACT, "join-circle", [Cl.uint(0)], alice);
    expect(rejoin.result).toBeErr(Cl.uint(104)); // ERR_ALREADY_MEMBER
  });

  it("rejects joining a circle that's already full", () => {
    createCircle(alice, 2, false); // circle 0
    joinCircle(0, bob); // fills it -> ACTIVE

    const outsiderJoin = joinCircle(0, carol);
    expect(outsiderJoin.result).toBeErr(Cl.uint(103)); // ERR_CIRCLE_NOT_OPEN
  });
});

describe("contribute + payout", () => {
  it("pays the round recipient minus the protocol fee once everyone has paid in", () => {
    createCircle(alice, 3, false); // circle 0: alice, then bob, carol join
    joinCircle(0, bob);
    joinCircle(0, carol);

    const treasuryBefore = stxBalance(deployer); // deployer is the default treasury
    const aliceBefore = stxBalance(alice);

    contribute(0, alice);
    contribute(0, bob);
    const final = contribute(0, carol);

    const pot = CONTRIBUTION * 3;
    const fee = Math.floor((pot * 3) / 100); // default 3% round fee
    const payout = pot - fee;

    expect(final.result).toBeOk(Cl.bool(true));
    expect(stxBalance(deployer)).toBe(treasuryBefore + BigInt(fee));
    // alice paid CONTRIBUTION in, then received `payout` back as round 1 recipient
    expect(stxBalance(alice)).toBe(aliceBefore - BigInt(CONTRIBUTION) + BigInt(payout));
    expect(memberField(0, alice, "total-received")).toBe(String(payout));
  });

  it("advances to the next member's turn after a round completes", () => {
    createCircle(alice, 3, false); // circle 0
    joinCircle(0, bob);
    joinCircle(0, carol);

    contribute(0, alice);
    contribute(0, bob);
    contribute(0, carol); // round 1 complete, pays alice (index 0)

    expect(circleField(0, "current-index").value).toBe("1");
  });

  it("ends a single-pass circle automatically once every member has been paid once", () => {
    createCircle(alice, 2, false); // circle 0, single-pass
    joinCircle(0, bob);

    runFullPass(0, [alice, bob]); // 2 rounds: pays alice, then bob

    expect(circleField(0, "status").value).toBe(String(STATUS_ENDED));

    // no further round can start
    const blocked = contribute(0, alice);
    expect(blocked.result).toBeErr(Cl.uint(106)); // ERR_CIRCLE_NOT_ACTIVE
  });

  it("loops back to a fresh pass instead of ending when multi-pass", () => {
    createCircle(alice, 2, true); // circle 0, multi-pass
    joinCircle(0, bob);

    runFullPass(0, [alice, bob]); // pass 1 complete: paid alice, then bob

    expect(circleField(0, "status").value).toBe(String(STATUS_ACTIVE));
    expect(circleField(0, "current-pass").value).toBe("2");
    expect(circleField(0, "current-index").value).toBe("0");
    expect(circleField(0, "pass-complete").value).toBe(true);

    // pass 2 collects fine
    const round2 = contribute(0, alice);
    expect(round2.result).toBeOk(Cl.bool(true));
    expect(circleField(0, "pass-complete").value).toBe(false);
  });

  it("rejects a second contribution to the same round and contributions from non-members", () => {
    createCircle(alice, 2, false);
    joinCircle(0, bob);

    contribute(0, alice);
    const doublePay = contribute(0, alice);
    expect(doublePay.result).toBeErr(Cl.uint(107)); // ERR_ALREADY_CONTRIBUTED

    const notMember = contribute(0, carol);
    expect(notMember.result).toBeErr(Cl.uint(105)); // ERR_NOT_MEMBER
  });
});

describe("cycle-length cadence gate", () => {
  it("leaves round 1 open immediately even with a long cycle length", () => {
    createCircle(alice, 2, true, 1000); // circle 0
    joinCircle(0, bob);

    const firstContribution = contribute(0, alice);
    expect(firstContribution.result).toBeOk(Cl.bool(true));
  });

  it("blocks the next round until cycle-length-blocks have passed, then allows it", () => {
    createCircle(alice, 2, true, 10); // circle 0, multi-pass, 10-block cadence
    joinCircle(0, bob);

    runRound(0, [alice, bob]); // round 1 completes, pays alice

    const tooSoon = contribute(0, bob);
    expect(tooSoon.result).toBeErr(Cl.uint(113)); // ERR_ROUND_NOT_OPEN_YET

    simnet.mineEmptyBlocks(10);

    const nowOpen = contribute(0, bob);
    expect(nowOpen.result).toBeOk(Cl.bool(true));
  });
});

describe("leave-circle", () => {
  it("splits the 20% penalty 15/5 between the pot and treasury, refunding the rest", () => {
    createCircle(alice, 3, true); // circle 0, multi-pass
    joinCircle(0, bob);
    joinCircle(0, carol);

    // carol (index 2, never yet paid out) contributes once, then leaves before
    // ever receiving a payout -> net-contributed == CONTRIBUTION.
    contribute(0, carol);

    const treasuryBefore = stxBalance(deployer);
    const carolBefore = stxBalance(carol);

    const leave = simnet.callPublicFn(CONTRACT, "leave-circle", [Cl.uint(0)], carol);
    expect(leave.result).toBeOk(Cl.bool(true));

    const potPenalty = Math.floor((CONTRIBUTION * 15) / 100);
    const treasuryPenalty = Math.floor((CONTRIBUTION * 5) / 100);
    const refund = CONTRIBUTION - potPenalty - treasuryPenalty;

    expect(stxBalance(deployer)).toBe(treasuryBefore + BigInt(treasuryPenalty));
    expect(stxBalance(carol)).toBe(carolBefore + BigInt(refund));
    expect(circleField(0, "bonus-pool").value).toBe(String(potPenalty));
  });

  it("forfeits nothing when a member has already received at least as much as they contributed", () => {
    createCircle(alice, 2, true); // circle 0, multi-pass
    joinCircle(0, bob);

    contribute(0, alice);
    contribute(0, bob); // pays out alice: alice received > alice contributed

    const aliceBefore = stxBalance(alice);
    const leave = simnet.callPublicFn(CONTRACT, "leave-circle", [Cl.uint(0)], alice);
    expect(leave.result).toBeOk(Cl.bool(true));

    // net-contributed is 0, so nothing is forfeited and nothing is refunded
    expect(stxBalance(alice)).toBe(aliceBefore);
  });

  it("rejects leaving twice", () => {
    createCircle(alice, 2, false);
    joinCircle(0, bob);

    simnet.callPublicFn(CONTRACT, "leave-circle", [Cl.uint(0)], bob);
    const again = simnet.callPublicFn(CONTRACT, "leave-circle", [Cl.uint(0)], bob);
    expect(again.result).toBeErr(Cl.uint(108)); // ERR_ALREADY_LEFT
  });
});

describe("end-circle", () => {
  it("only the creator can end a circle, and only once a full pass has completed", () => {
    createCircle(alice, 2, true);
    joinCircle(0, bob);

    contribute(0, alice); // mid-round, pass not complete yet
    const midPass = simnet.callPublicFn(CONTRACT, "end-circle", [Cl.uint(0)], alice);
    expect(midPass.result).toBeErr(Cl.uint(109)); // ERR_CANNOT_END_MID_PASS

    contribute(0, bob); // completes round 1 (pays alice), pass still not done (bob unpaid)
    const stillMidPass = simnet.callPublicFn(CONTRACT, "end-circle", [Cl.uint(0)], alice);
    expect(stillMidPass.result).toBeErr(Cl.uint(109));

    runRound(0, [alice, bob]); // round 2: pays bob, pass 1 now fully complete

    const notCreator = simnet.callPublicFn(CONTRACT, "end-circle", [Cl.uint(0)], bob);
    expect(notCreator.result).toBeErr(Cl.uint(101)); // ERR_NOT_CREATOR

    const afterPass = simnet.callPublicFn(CONTRACT, "end-circle", [Cl.uint(0)], alice);
    expect(afterPass.result).toBeOk(Cl.bool(true));
    expect(circleField(0, "status").value).toBe(String(STATUS_ENDED));
  });
});

describe("admin functions", () => {
  it("rejects fee/treasury changes from anyone but the current admin", () => {
    const setFee = simnet.callPublicFn(CONTRACT, "set-round-fee-percent", [Cl.uint(5)], outsider);
    expect(setFee.result).toBeErr(Cl.uint(100)); // ERR_NOT_ADMIN

    const setTreasury = simnet.callPublicFn(
      CONTRACT,
      "set-treasury",
      [Cl.principal(outsider)],
      outsider
    );
    expect(setTreasury.result).toBeErr(Cl.uint(100));
  });

  it("lets the admin update the round fee, and future payouts use the new rate", () => {
    const setFee = simnet.callPublicFn(CONTRACT, "set-round-fee-percent", [Cl.uint(5)], deployer);
    expect(setFee.result).toBeOk(Cl.uint(5));

    createCircle(alice, 2, false);
    joinCircle(0, bob);

    const treasuryBefore = stxBalance(deployer);
    contribute(0, alice);
    contribute(0, bob);

    const pot = CONTRIBUTION * 2;
    const fee = Math.floor((pot * 5) / 100);
    expect(stxBalance(deployer)).toBe(treasuryBefore + BigInt(fee));
  });
});
