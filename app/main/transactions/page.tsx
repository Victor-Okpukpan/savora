import { EmptyState } from "@/components/main/EmptyState";
import { WalletIcon } from "@/components/icons";

export default function TransactionsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Every deposit and payout, recorded on-chain.
      </p>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={WalletIcon}
          title="No transactions yet"
          description="On-chain contributions and payouts will appear here as they happen."
        />
      </div>
    </div>
  );
}
