"use client";

export type Toast = {
  id: number;
  message: string;
  variant: "error" | "success" | "info";
};

const EMPTY: Toast[] = [];

let toasts: Toast[] = EMPTY;
let listeners: Array<() => void> = [];
let nextId = 0;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return toasts;
}

function getServerSnapshot() {
  return EMPTY;
}

export const toastStore = { subscribe, getSnapshot, getServerSnapshot };

export function dismissToast(id: number) {
  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  notify();
}

function push(message: string, variant: Toast["variant"], duration: number) {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  notify();
  setTimeout(() => dismissToast(id), duration);
}

export const toast = {
  error: (message: string) => push(message, "error", 7000),
  success: (message: string) => push(message, "success", 4000),
  info: (message: string) => push(message, "info", 4000),
};
