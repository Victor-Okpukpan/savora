"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/main/NavLinks";
import { NETWORK_LABEL, STACKS_NETWORK } from "@/lib/network";

// sats-connect touches browser globals at module scope, which breaks
// server-side prerendering — load it client-only.
const WalletConnect = dynamic(
  () => import("@/components/main/WalletConnect").then((m) => m.WalletConnect),
  { ssr: false, loading: () => <div className="h-8 w-full rounded-lg bg-foreground/5" /> }
);

type MobileNavProps = {
  basePath: string;
};

export function MobileNav({ basePath }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const homeHref = basePath || "/";

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-foreground/5 bg-background px-4 py-3 sm:hidden">
        <Link href={homeHref} className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Savora" width={26} height={26} />
          <span className="text-sm font-bold text-foreground">SAVORA</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-background px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between px-2">
              <Link
                href={homeHref}
                className="flex items-center gap-2.5"
                onClick={() => setOpen(false)}
              >
                <Image src="/logo.png" alt="Savora" width={30} height={30} />
                <span className="text-base font-bold text-foreground">SAVORA</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <NavLinks basePath={basePath} className="mt-8 flex-1" onNavigate={() => setOpen(false)} />

            <div className="flex flex-col gap-3 border-t border-foreground/5 px-2 pt-4">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    STACKS_NETWORK === "mainnet"
                      ? "bg-savora-blue/10 text-savora-blue"
                      : "bg-savora-green/10 text-savora-green"
                  }`}
                >
                  {NETWORK_LABEL}
                </span>
                <ThemeToggle />
              </div>
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
