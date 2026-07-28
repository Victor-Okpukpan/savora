import { EmptyState } from "@/components/main/EmptyState";
import { SettingsIcon } from "@/components/icons";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-savora-dark">Settings</h1>
      <p className="mt-1 text-sm text-savora-dark/60">
        Manage your account and wallet preferences.
      </p>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={SettingsIcon}
          title="Settings coming soon"
          description="Wallet connection, notifications, and account preferences will live here."
        />
      </div>
    </div>
  );
}
