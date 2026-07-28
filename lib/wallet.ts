"use client";

import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

export type WalletState = {
  connected: boolean;
  address: string | null;
};

const DISCONNECTED: WalletState = { connected: false, address: null };

let current: WalletState = DISCONNECTED;
let listeners: Array<() => void> = [];

function computeState(): WalletState {
  if (typeof window === "undefined" || !isConnected()) return DISCONNECTED;
  const data = getLocalStorage();
  const address = data?.addresses?.stx?.[0]?.address ?? null;
  return address ? { connected: true, address } : DISCONNECTED;
}

function sync() {
  const next = computeState();
  if (next.connected !== current.connected || next.address !== current.address) {
    current = next;
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  sync();
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return DISCONNECTED;
}

export const walletStore = { subscribe, getSnapshot, getServerSnapshot };

export async function connectWallet() {
  await connect({ network: "testnet" });
  sync();
}

export function disconnectWallet() {
  disconnect();
  sync();
}
