import { WalletGate } from "@/components/main/WalletGate";
import { AnalyticsGate } from "@/components/main/AnalyticsGate";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Your contribution and payout totals across every circle.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see your savings totals."
        >
          <AnalyticsGate />
        </WalletGate>
      </div>
    </div>
  );
}
