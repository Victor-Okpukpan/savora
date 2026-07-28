import { EmptyState } from "@/components/main/EmptyState";
import { AnalyticsIcon } from "@/components/icons";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold text-savora-dark">Analytics</h1>
      <p className="mt-1 text-sm text-savora-dark/60">
        See how your savings are growing over time.
      </p>

      <div className="mt-6 flex flex-1">
        <EmptyState
          icon={AnalyticsIcon}
          title="Nothing to analyze yet"
          description="Your savings growth chart will appear here once you have contribution history."
        />
      </div>
    </div>
  );
}
