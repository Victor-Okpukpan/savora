import { WalletGate } from "@/components/main/WalletGate";
import { TransactionsGate } from "@/components/main/TransactionsGate";

export default function TransactionsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Every deposit and payout, recorded on-chain.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see your on-chain deposits and payouts."
        >
          <TransactionsGate />
        </WalletGate>
      </div>
    </div>
  );
}
