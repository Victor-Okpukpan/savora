import type { Metadata } from "next";
import { Sidebar } from "@/components/main/Sidebar";
import { MobileNav } from "@/components/main/MobileNav";

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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background sm:flex-row">
      <Sidebar />
      <MobileNav />
      <main className="flex flex-1 flex-col p-6 sm:p-10">{children}</main>
    </div>
  );
}
