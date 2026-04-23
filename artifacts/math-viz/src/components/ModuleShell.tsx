import type { ReactNode } from "react";

export function ModuleShell({
  title,
  description,
  formula,
  controls,
  plot,
  insights,
}: {
  title: string;
  description: string;
  formula?: ReactNode;
  controls: ReactNode;
  plot: ReactNode;
  insights?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm max-w-3xl">{description}</p>
        {formula && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted font-mono text-sm">
            {formula}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-5 rounded-xl bg-card border border-card-border p-5 shadow-sm h-fit lg:sticky lg:top-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</h3>
          {controls}
        </aside>

        <div className="space-y-4 min-w-0">
          {plot}
          {insights}
        </div>
      </div>
    </div>
  );
}

export function InsightCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-card border border-card-border p-5 shadow-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Live insights</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        {children}
      </div>
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums" style={{ color: accent }}>{value}</div>
    </div>
  );
}
