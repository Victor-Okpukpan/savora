type EmptyStateAction = {
  label: string;
  onClick: () => void;
  pending?: boolean;
};

type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: EmptyStateAction;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/10 px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-savora-blue/10 text-savora-blue">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-foreground/60">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.pending}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-savora-white transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
