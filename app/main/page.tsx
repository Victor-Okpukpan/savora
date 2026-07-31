import type { Metadata } from "next";
import { WalletGate } from "@/components/main/WalletGate";
import { DashboardGate } from "@/components/main/DashboardGate";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Here&rsquo;s what&rsquo;s happening with your savings.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see your balance, groups, and savings activity."
        >
          <DashboardGate />
        </WalletGate>
      </div>
    </div>
  );
}
