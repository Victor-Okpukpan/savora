type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/10 px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-savora-blue/10 text-savora-blue">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-foreground/60">{description}</p>
    </div>
  );
}
