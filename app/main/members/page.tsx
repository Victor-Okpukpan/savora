import { WalletGate } from "@/components/main/WalletGate";
import { MembersGate } from "@/components/main/MembersGate";

export default function MembersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Members</h1>
      <p className="mt-1 text-sm text-foreground/60">
        People in your savings circles.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see the members of your savings circles."
        >
          <MembersGate />
        </WalletGate>
      </div>
    </div>
  );
}
