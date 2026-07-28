"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/main/nav-items";

type NavLinksProps = {
  className?: string;
  onNavigate?: () => void;
};

export function NavLinks({ className = "", onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
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
  );
}
