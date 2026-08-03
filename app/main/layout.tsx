import type { Metadata } from "next";
import { headers } from "next/headers";
import { Sidebar } from "@/components/main/Sidebar";
import { MobileNav } from "@/components/main/MobileNav";
import { mainBasePath } from "@/lib/urls";

export const metadata: Metadata = {
  title: {
    template: "%s | Savora App",
    default: "Savora App",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hostname = (await headers()).get("host")?.split(":")[0] ?? "";
  const basePath = mainBasePath(hostname);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background sm:flex-row">
      <Sidebar basePath={basePath} />
      <MobileNav basePath={basePath} />
      <main className="flex flex-1 flex-col p-6 sm:p-10">{children}</main>
    </div>
  );
}
