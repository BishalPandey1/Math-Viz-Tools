import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";

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

export function EditableStat({
  label,
  value,
  onChange,
  accent,
  min,
  max,
  step = 0.01,
  suffix = "",
  prefix = "",
  format = (v) => v.toFixed(2),
  hint,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  accent?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  format?: (v: number) => string;
  hint?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(format(value));
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value, format]);

  const commit = () => {
    const cleaned = draft.replace(/[^\d.\-eE]/g, "");
    const n = parseFloat(cleaned);
    if (Number.isFinite(n)) {
      let next = n;
      if (typeof min === "number") next = Math.max(min, next);
      if (typeof max === "number") next = Math.min(max, next);
      onChange(next);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return (
    <div
      className={`group rounded-lg bg-muted/50 px-3 py-2.5 transition-colors ${
        editing ? "ring-2 ring-primary/50 bg-card" : "cursor-pointer hover:bg-muted"
      }`}
      onClick={() => !editing && setEditing(true)}
      title={hint ?? "Click to edit"}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-70 transition-opacity" />
      </div>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape") cancel();
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent border-0 outline-none font-mono text-sm font-semibold tabular-nums p-0"
          style={{ color: accent }}
        />
      ) : (
        <div
          className="font-mono text-sm font-semibold tabular-nums truncate"
          style={{ color: accent }}
        >
          {prefix}
          {format(value)}
          {suffix}
        </div>
      )}
    </div>
  );
}
