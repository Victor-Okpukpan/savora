import { WalletGate } from "@/components/main/WalletGate";
import { ContributionsGate } from "@/components/main/ContributionsGate";

export default function ContributionsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Contributions</h1>
      <p className="mt-1 text-sm text-foreground/60">
        What you owe right now, across every active circle.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see what you owe across your circles."
        >
          <ContributionsGate />
        </WalletGate>
      </div>
    </div>
  );
}
