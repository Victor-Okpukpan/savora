import { EmptyState } from "@/components/main/EmptyState";
import { WalletGate } from "@/components/main/WalletGate";
import { AnalyticsIcon } from "@/components/icons";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <p className="mt-1 text-sm text-foreground/60">
        See how your savings are growing over time.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see your savings growth over time."
        >
          <EmptyState
            icon={AnalyticsIcon}
            title="Nothing to analyze yet"
            description="Your savings growth chart will appear here once you have contribution history."
          />
        </WalletGate>
      </div>
    </div>
  );
}
