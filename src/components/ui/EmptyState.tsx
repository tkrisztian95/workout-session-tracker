interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
      <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mb-5">
        {icon}
      </div>
      <p className="text-secondary text-base font-medium">{title}</p>
      {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
