"use client";

import Image from "next/image";
import Link from "next/link";
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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-savora-white px-4 py-6 sm:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Image src="/logo.png" alt="Savora" width={30} height={30} />
        <span className="text-base font-bold text-savora-dark">SAVORA</span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
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
                  : "text-savora-dark/60 hover:bg-black/5 hover:text-savora-dark"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
