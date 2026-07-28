import { EmptyState } from "@/components/main/EmptyState";
import { GroupsIcon } from "@/components/icons";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-savora-dark">Dashboard</h1>
      <p className="mt-1 text-sm text-savora-dark/60">
        Here&rsquo;s what&rsquo;s happening with your savings.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 p-5">
          <p className="text-xs text-savora-dark/50">Total Balance</p>
          <p className="mt-1 text-2xl font-bold text-savora-dark">₦0.00</p>
        </div>
        <div className="rounded-2xl border border-black/5 p-5">
          <p className="text-xs text-savora-dark/50">Active Groups</p>
          <p className="mt-1 text-2xl font-bold text-savora-dark">0</p>
        </div>
      </div>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={GroupsIcon}
          title="No savings circles yet"
          description="Once wallet connection is live, you'll be able to create or join an Ajo-style savings circle here."
        />
      </div>
    </div>
  );
}
