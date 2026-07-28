"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  GroupsIcon,
  ContributionsIcon,
  WalletIcon,
  UserIcon,
  AnalyticsIcon,
  SettingsIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

// sats-connect touches browser globals at module scope, which breaks
// server-side prerendering — load it client-only.
const WalletConnect = dynamic(
  () => import("@/components/main/WalletConnect").then((m) => m.WalletConnect),
  { ssr: false, loading: () => <div className="h-8 w-full rounded-lg bg-foreground/5" /> }
);

const navItems = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/groups", label: "My Groups", icon: GroupsIcon },
  { href: "/contributions", label: "Contributions", icon: ContributionsIcon },
  { href: "/transactions", label: "Transactions", icon: WalletIcon },
  { href: "/members", label: "Members", icon: UserIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-foreground/5 bg-background px-4 py-6 sm:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Image src="/logo.png" alt="Savora" width={30} height={30} />
        <span className="text-base font-bold text-foreground">SAVORA</span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-brand text-savora-white"
                  : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

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
