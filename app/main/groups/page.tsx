import { WalletGate } from "@/components/main/WalletGate";
import { GroupsGate } from "@/components/main/GroupsGate";

export default function GroupsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">My Groups</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Savings circles you&rsquo;ve created or joined.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to see the savings circles you've created or joined."
        >
          <GroupsGate />
        </WalletGate>
      </div>
    </div>
  );
}
