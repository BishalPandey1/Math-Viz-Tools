import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pencil, ChevronDown, ChevronRight, BookOpen } from "lucide-react";

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
        <aside className="glass space-y-5 rounded-xl p-5 h-fit lg:sticky lg:top-24">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</h3>
          {controls}
        </aside>

        <div className="space-y-4 min-w-0">
          <div className="glass-soft rounded-xl p-2">{plot}</div>
          {insights}
        </div>
      </div>
    </div>
  );
}

export function InsightCard({ children }: { children: ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Live insights</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        {children}
      </div>
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass-stat rounded-lg px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums" style={{ color: accent }}>{value}</div>
    </div>
  );
}

/** Render a textbook-style step-by-step solution panel. */
export function SolutionSteps({
  title = "Step-by-step solution",
  steps,
  defaultOpen = true,
}: {
  title?: string;
  steps: SolutionStep[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-5 py-3 text-left hover-elevate"
      >
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">
          {title}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <ol className="px-5 pb-5 space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-semibold grid place-items-center mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-1.5">
                {s.text && <div className="text-sm text-foreground/90">{s.text}</div>}
                {s.formula && (
                  <div className="font-mono text-sm bg-muted/60 rounded-md px-3 py-2 overflow-x-auto whitespace-nowrap">
                    {s.formula}
                  </div>
                )}
                {s.substitution && (
                  <div className="font-mono text-sm bg-muted/40 rounded-md px-3 py-2 overflow-x-auto whitespace-nowrap text-muted-foreground">
                    {s.substitution}
                  </div>
                )}
                {s.result && (
                  <div className="font-mono text-sm font-semibold tabular-nums text-primary">
                    = {s.result}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export type SolutionStep = {
  text?: ReactNode;
  formula?: ReactNode;
  substitution?: ReactNode;
  result?: ReactNode;
};

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
      className={`group glass-stat rounded-lg px-3 py-2.5 transition-all ${
        editing ? "ring-2 ring-primary/50" : "cursor-pointer hover:brightness-110"
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
