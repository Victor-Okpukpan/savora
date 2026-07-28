import { Sidebar } from "@/components/main/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col p-6 sm:p-10">{children}</main>
    </div>
  );
}
