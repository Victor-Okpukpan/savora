import { defaultUrlFromNetwork } from "@stacks/network";

// Only "mainnet" ever opts in explicitly; anything else (unset, a typo,
// "Mainnet", etc.) falls back to testnet -- the safer failure mode for an
// app that moves real funds, since a misconfigured deploy should never
// silently start treating itself as mainnet.
export const STACKS_NETWORK: "mainnet" | "testnet" =
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const STACKS_API_BASE = defaultUrlFromNetwork(STACKS_NETWORK);

export const NETWORK_LABEL = STACKS_NETWORK === "mainnet" ? "Mainnet" : "Testnet";

// explorer.hiro.so defaults to mainnet; testnet needs the explicit query param.
export function explorerTxUrl(txid: string) {
  return `https://explorer.hiro.so/txid/${txid}${STACKS_NETWORK === "mainnet" ? "" : "?chain=testnet"}`;
}
