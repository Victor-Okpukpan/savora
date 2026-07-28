import { EmptyState } from "@/components/main/EmptyState";
import { UserIcon } from "@/components/icons";

export default function MembersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-savora-dark">Members</h1>
      <p className="mt-1 text-sm text-savora-dark/60">
        People in your savings circles.
      </p>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={UserIcon}
          title="No members yet"
          description="Once you create or join a circle, you'll see fellow members here."
        />
      </div>
    </div>
  );
}
