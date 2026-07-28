"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/main/NavLinks";

// sats-connect touches browser globals at module scope, which breaks
// server-side prerendering — load it client-only.
const WalletConnect = dynamic(
  () => import("@/components/main/WalletConnect").then((m) => m.WalletConnect),
  { ssr: false, loading: () => <div className="h-8 w-full rounded-lg bg-foreground/5" /> }
);

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-foreground/5 bg-background px-4 py-6 sm:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Image src="/logo.png" alt="Savora" width={30} height={30} />
        <span className="text-base font-bold text-foreground">SAVORA</span>
      </Link>

      <NavLinks className="mt-8 flex-1" />

      <div className="flex flex-col gap-3 border-t border-foreground/5 px-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-savora-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-savora-green">
            Testnet
          </span>
          <ThemeToggle />
        </div>
        <WalletConnect />
      </div>
    </aside>
  );
}
