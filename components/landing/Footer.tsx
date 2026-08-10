import Image from "next/image";
import { XIcon } from "@/components/icons";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Why Savora", href: "#why-savora" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-savora-dark text-savora-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Savora" width={32} height={32} />
              <span className="text-lg font-bold">SAVORA</span>
            </div>
            <p className="mt-3 text-sm text-white/50">
              Save together. Grow together. Decentralized community savings,
              powered by smart contracts on Stacks.
            </p>
            <a
              href="https://x.com/Savora_HQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Savora on X"
              className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/20 hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </a>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-white/80">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Savora. All rights reserved.</p>
          <p>Built for communities. Powered by blockchain. Designed for trust.</p>
        </div>
      </div>
    </footer>
  );
}
