import { EmptyState } from "@/components/main/EmptyState";
import { ContributionsIcon } from "@/components/icons";

export default function ContributionsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-foreground">Contributions</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Track what you&rsquo;ve contributed to each circle.
      </p>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={ContributionsIcon}
          title="No contributions yet"
          description="Your monthly contributions will show up here once you join a circle."
        />
      </div>
    </div>
  );
}
