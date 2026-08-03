"use client";

import {
  Cl,
  cvToHex,
  cvToJSON,
  fetchCallReadOnlyFunction,
  Pc,
  postConditionToHex,
} from "@stacks/transactions";
import type { ClarityValue, PostCondition } from "@stacks/transactions";

// Set once the contract is deployed, e.g. "ST1ABC....savings-circle".
const CONTRACT_PRINCIPAL = process.env.NEXT_PUBLIC_SAVINGS_CIRCLE_CONTRACT ?? "";
const [CONTRACT_ADDRESS, CONTRACT_NAME] = CONTRACT_PRINCIPAL.split(".");

// Same provider id used for wallet connect (see lib/wallet.ts) -- Xverse's
// StacksProvider.request() is an unimplemented stub, BitcoinProvider is the
// one that actually dispatches Stacks JSON-RPC methods too.
const XVERSE_PROVIDER_ID = "XverseProviders.BitcoinProvider";

export function isContractDeployed() {
  return Boolean(CONTRACT_ADDRESS && CONTRACT_NAME);
}

function requireContract() {
  if (!isContractDeployed()) {
    throw new Error("The savings circle contract hasn't been deployed yet.");
  }
  return { address: CONTRACT_ADDRESS, name: CONTRACT_NAME };
}

export type TxResult = { txid: string };

async function callContract(
  functionName: string,
  functionArgs: ClarityValue[],
  postConditions: PostCondition[] = []
): Promise<TxResult> {
  const { address, name } = requireContract();
  // Dynamically imported for the same reason as lib/wallet.ts's
  // connectWallet(): a single call-site chunk instead of duplicating
  // sats-connect across every ssr:false boundary that pulls in this file.
  const { request: satsRequest } = await import("sats-connect");
  const response = await satsRequest(
    "stx_callContract",
    {
      contract: `${address}.${name}` as `${string}.${string}`,
      functionName,
      functionArgs: functionArgs.map((arg) => cvToHex(arg)),
      // Without an explicit mode, Xverse defaults to strict "deny" -- it
      // blocks *any* asset movement that isn't covered by a post-condition,
      // including the caller's own perfectly normal STX transfer. "allow"
      // lets the contract's (already-tested) logic run freely; the specific
      // post-conditions below still protect the caller from ever sending
      // more than they agreed to.
      postConditionMode: "allow",
      postConditions: postConditions.map((pc) => postConditionToHex(pc)),
    },
    XVERSE_PROVIDER_ID
  );
  if (response.status !== "success") {
    throw new Error(response.error?.message ?? `Failed to call ${functionName}.`);
  }
  return { txid: response.result.txid };
}

export function createCircleTx(
  contributionUstx: number,
  memberCount: number,
  multiPass: boolean,
  cycleLengthBlocks: number
) {
  return callContract("create-circle", [
    Cl.uint(contributionUstx),
    Cl.uint(memberCount),
    Cl.bool(multiPass),
    Cl.uint(cycleLengthBlocks),
  ]);
}

export function joinCircleTx(circleId: number) {
  return callContract("join-circle", [Cl.uint(circleId)]);
}

// `callerAddress` + `contributionUstx` build a post-condition guaranteeing
// the caller never sends more than the circle's agreed contribution amount.
export function contributeTx(circleId: number, contributionUstx: number, callerAddress: string) {
  return callContract("contribute", [Cl.uint(circleId)], [
    Pc.principal(callerAddress).willSendEq(contributionUstx).ustx(),
  ]);
}

export function leaveCircleTx(circleId: number) {
  return callContract("leave-circle", [Cl.uint(circleId)]);
}

export function endCircleTx(circleId: number) {
  return callContract("end-circle", [Cl.uint(circleId)]);
}

const TESTNET_API_BASE = "https://api.testnet.hiro.so";

// `stx_callContract` resolves as soon as the wallet *submits* the
// transaction, not once it's mined -- callers need to wait for actual
// confirmation before re-reading contract state, or they'll just see stale
// data (this is why the UI wasn't updating after create/join/contribute).
export async function waitForTxConfirmation(
  txid: string,
  { intervalMs = 3000, timeoutMs = 180000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${TESTNET_API_BASE}/extended/v1/tx/${txid}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tx_status === "success") return;
      if (typeof data.tx_status === "string" && data.tx_status.startsWith("abort_")) {
        throw new Error(`Transaction failed on-chain (${data.tx_status}).`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for the transaction to confirm. Check your wallet's activity tab.");
}

// Bitcoin block height as seen by the network -- the same clock the contract
// uses for `next-round-at`, so the UI can show "opens in ~N days" accurately.
export async function getCurrentBurnBlockHeight(): Promise<number> {
  const res = await fetch(`${TESTNET_API_BASE}/v2/info`);
  if (!res.ok) throw new Error("Failed to fetch current block height.");
  const data = await res.json();
  return Number(data.burn_block_height);
}

// ---- read-only queries ----

async function readOnly(functionName: string, functionArgs: ClarityValue[], senderAddress: string) {
  const { address, name } = requireContract();
  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName,
    functionArgs,
    senderAddress,
    network: "testnet",
  });
  return cvToJSON(result);
}

export const CIRCLE_STATUS = {
  OPEN: 0,
  ACTIVE: 1,
  ENDED: 2,
} as const;

export type Circle = {
  id: number;
  creator: string;
  contributionAmount: number;
  memberCount: number;
  joinedCount: number;
  multiPass: boolean;
  status: 0 | 1 | 2;
  currentPass: number;
  currentIndex: number;
  contributionsThisRound: number;
  passComplete: boolean;
  bonusPool: number;
  cycleLengthBlocks: number;
  nextRoundAt: number;
};

export async function getCircleCount(senderAddress: string): Promise<number> {
  const json = await readOnly("get-circle-count", [], senderAddress);
  return Number(json.value);
}

export async function getCircle(circleId: number, senderAddress: string): Promise<Circle | null> {
  const json = await readOnly("get-circle", [Cl.uint(circleId)], senderAddress);
  if (!json.value) return null;
  const f = json.value.value;
  return {
    id: circleId,
    creator: f.creator.value,
    contributionAmount: Number(f["contribution-amount"].value),
    memberCount: Number(f["member-count"].value),
    joinedCount: Number(f["joined-count"].value),
    multiPass: f["multi-pass"].value,
    status: Number(f.status.value) as 0 | 1 | 2,
    currentPass: Number(f["current-pass"].value),
    currentIndex: Number(f["current-index"].value),
    contributionsThisRound: Number(f["contributions-this-round"].value),
    passComplete: f["pass-complete"].value,
    bonusPool: Number(f["bonus-pool"].value),
    cycleLengthBlocks: Number(f["cycle-length-blocks"].value),
    nextRoundAt: Number(f["next-round-at"].value),
  };
}

export type MemberInfo = {
  index: number;
  totalContributed: number;
  totalReceived: number;
  hasLeft: boolean;
};

export async function getMemberInfo(
  circleId: number,
  member: string,
  senderAddress: string
): Promise<MemberInfo | null> {
  const json = await readOnly(
    "get-member-info",
    [Cl.uint(circleId), Cl.principal(member)],
    senderAddress
  );
  if (!json.value) return null;
  const f = json.value.value;
  return {
    index: Number(f.index.value),
    totalContributed: Number(f["total-contributed"].value),
    totalReceived: Number(f["total-received"].value),
    hasLeft: f["has-left"].value,
  };
}

export async function getCircleMember(
  circleId: number,
  index: number,
  senderAddress: string
): Promise<string | null> {
  const json = await readOnly(
    "get-circle-member",
    [Cl.uint(circleId), Cl.uint(index)],
    senderAddress
  );
  return json.value ? (json.value.value as string) : null;
}

export async function hasContributedThisRound(
  circleId: number,
  member: string,
  senderAddress: string
): Promise<boolean> {
  const json = await readOnly(
    "has-contributed-this-round",
    [Cl.uint(circleId), Cl.principal(member)],
    senderAddress
  );
  return Boolean(json.value);
}

export type MyCircle = { circle: Circle; info: MemberInfo };

// Circle ids are just 0..count-1 with no separate index, so "which circles is
// this address in" means probing every circle and keeping the ones with
// member-info. Fine at today's scale; would need a real index if this list
// ever gets large.
export async function getMyCircles(address: string): Promise<MyCircle[]> {
  const count = await getCircleCount(address);
  const found: MyCircle[] = [];
  for (let id = 0; id < count; id++) {
    const info = await getMemberInfo(id, address, address);
    if (!info) continue;
    const circle = await getCircle(id, address);
    if (circle) found.push({ circle, info });
  }
  return found;
}

// STX balance actually sitting in the connected wallet (not funds currently
// held in a circle's escrow -- those only move on payout).
export async function getWalletBalance(address: string): Promise<number> {
  const res = await fetch(`${TESTNET_API_BASE}/extended/v1/address/${address}/balances`);
  if (!res.ok) throw new Error("Failed to fetch wallet balance.");
  const data = await res.json();
  return Number(data.stx.balance);
}

export type ContractTransaction = {
  txid: string;
  functionName: string;
  circleId: number | null;
  status: string;
  blockTimeIso: string;
};

type RawFunctionArg = { name: string; repr: string };
type RawContractCallTx = {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_time_iso: string;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args?: RawFunctionArg[];
  };
};

// The address-transactions endpoint returns everything that address has ever
// sent, so this filters down to calls against our own contract.
export async function getContractTransactions(address: string): Promise<ContractTransaction[]> {
  const { address: contractAddress, name: contractName } = requireContract();
  const contractId = `${contractAddress}.${contractName}`;
  const res = await fetch(
    `${TESTNET_API_BASE}/extended/v1/address/${address}/transactions?limit=50`
  );
  if (!res.ok) throw new Error("Failed to fetch transaction history.");
  const data = await res.json();
  const results: RawContractCallTx[] = data.results ?? [];

  return results
    .filter((tx) => tx.tx_type === "contract_call" && tx.contract_call?.contract_id === contractId)
    .map((tx) => {
      const circleIdArg = tx.contract_call?.function_args?.find((arg) => arg.name === "circle-id");
      return {
        txid: tx.tx_id,
        functionName: tx.contract_call!.function_name,
        circleId: circleIdArg ? Number(circleIdArg.repr.replace("u", "")) : null,
        status: tx.tx_status,
        blockTimeIso: tx.block_time_iso,
      };
    });
}
