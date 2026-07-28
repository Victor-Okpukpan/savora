import { EmptyState } from "@/components/main/EmptyState";
import { WalletGate } from "@/components/main/WalletGate";
import { SettingsIcon } from "@/components/icons";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Manage your account and wallet preferences.
      </p>

      <div className="mt-6 flex flex-1">
        <WalletGate
          title="Connect your wallet"
          description="Connect your wallet to manage your account settings."
        >
          <EmptyState
            icon={SettingsIcon}
            title="More settings coming soon"
            description="Notifications and other account preferences will live here."
          />
        </WalletGate>
      </div>
    </div>
  );
}
