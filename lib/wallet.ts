"use client";

import { request as satsRequest, AddressPurpose } from "sats-connect";
import { toast } from "@/lib/toast";

export type WalletState = {
  connected: boolean;
  address: string | null;
  connecting: boolean;
};

const STORAGE_KEY = "savora:wallet-address";
// Xverse exposes both `XverseProviders.StacksProvider` and
// `XverseProviders.BitcoinProvider`. Only BitcoinProvider's `.request()` is
// actually implemented — StacksProvider's throws "not implemented" — so that's
// the one to target even for Stacks-specific JSON-RPC methods.
const XVERSE_PROVIDER_ID = "XverseProviders.BitcoinProvider";

const INITIAL: WalletState = {
  connected: false,
  address: null,
  connecting: false,
};

let current: WalletState = INITIAL;
let listeners: Array<() => void> = [];

function setState(patch: Partial<WalletState>) {
  const next = { ...current, ...patch };
  const changed = (Object.keys(next) as (keyof WalletState)[]).some(
    (key) => next[key] !== current[key]
  );
  if (!changed) return;
  current = next;
  listeners.forEach((listener) => listener());
}

function readStoredAddress(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistAddress(address: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (address) window.localStorage.setItem(STORAGE_KEY, address);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors (e.g. private browsing with storage disabled).
  }
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  const address = readStoredAddress();
  setState({ connected: !!address, address });
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return INITIAL;
}

export const walletStore = { subscribe, getSnapshot, getServerSnapshot };

function hasXverse(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { XverseProviders?: { BitcoinProvider?: unknown } };
  return !!w.XverseProviders?.BitcoinProvider;
}

// We go straight through Xverse's own sats-connect SDK, targeting its provider
// by exact object path, rather than @stacks/connect's wallet-picker flow —
// that picker never actually triggers Xverse's approval popup with the
// currently installed extension version, even when a wallet is selected from it.
export async function connectWallet() {
  setState({ connecting: true });
  try {
    if (!hasXverse()) {
      throw new Error("No Xverse wallet found. Install the Xverse extension and try again.");
    }

    // `wallet_connect` is the actual permission-granting operation — unlike
    // `stx_getAddresses`, which just returns "Access denied" if the origin
    // hasn't already been granted access, `wallet_connect` is what's supposed
    // to prompt the user for approval in the first place.
    const response = await satsRequest(
      "wallet_connect",
      { addresses: [AddressPurpose.Stacks], message: "Connect your wallet to Savora" },
      XVERSE_PROVIDER_ID
    );

    if (response.status !== "success") {
      throw new Error(response.error?.message ?? "Wallet connection was rejected.");
    }

    if (response.result.network.stacks.name !== "testnet") {
      throw new Error("Your wallet is set to Mainnet. Switch Xverse to Testnet and try again.");
    }

    const address =
      response.result.addresses.find((a) => a.purpose === AddressPurpose.Stacks)?.address ??
      null;
    persistAddress(address);
    setState({ connected: !!address, address, connecting: false });
  } catch (err) {
    console.error("[savora] wallet connect failed:", err);
    toast.error(err instanceof Error ? err.message : "Failed to connect wallet.");
    setState({ connecting: false });
  }
}

export function disconnectWallet() {
  persistAddress(null);
  setState({ connected: false, address: null });
}
