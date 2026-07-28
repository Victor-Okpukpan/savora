import { EmptyState } from "@/components/main/EmptyState";
import { GroupsIcon } from "@/components/icons";

export default function GroupsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-savora-dark">My Groups</h1>
      <p className="mt-1 text-sm text-savora-dark/60">
        Savings circles you&rsquo;ve created or joined.
      </p>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={GroupsIcon}
          title="No groups yet"
          description="Create a savings circle or join one with an invite once this feature is live."
        />
      </div>
    </div>
  );
}
