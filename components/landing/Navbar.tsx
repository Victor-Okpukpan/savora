import Image from "next/image";
import Link from "next/link";
import { appUrl } from "@/lib/urls";

const links = [
  { href: "#why-savora", label: "Why Savora" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-savora-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="#" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Savora" width={36} height={36} priority />
          <span className="text-lg font-bold tracking-tight text-savora-dark">
            SAVORA
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-savora-dark/70 transition-colors hover:text-savora-dark"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href={appUrl()}
          className="rounded-full bg-savora-dark px-5 py-2.5 text-sm font-semibold text-savora-white transition-transform hover:scale-[1.03]"
        >
          Get Started
        </a>
      </nav>
    </header>
  );
}
