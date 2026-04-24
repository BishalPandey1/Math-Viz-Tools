import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pencil, ChevronDown, ChevronRight, BookOpen, Calculator, Sparkles } from "lucide-react";

export function ModuleShell({
  title,
  description,
  formula,
  controls,
  plot,
  insights,
  extras,
}: {
  title: string;
  description: string;
  formula?: ReactNode;
  controls: ReactNode;
  plot: ReactNode;
  insights?: ReactNode;
  extras?: ReactNode;
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
          {extras}
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
        <ol className="px-5 pb-5 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xs font-bold grid place-items-center mt-0.5 ring-1 ring-primary/20">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-1.5 pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                {s.text && <div className="text-sm text-foreground/90 leading-relaxed">{s.text}</div>}
                {s.formula && (
                  <div className="inline-flex items-center gap-2 max-w-full">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 shrink-0">formula</span>
                    <code className="font-mono text-sm bg-muted/70 rounded-md px-3 py-1.5 overflow-x-auto whitespace-nowrap min-w-0">
                      {s.formula}
                    </code>
                  </div>
                )}
                {s.substitution && (
                  <div className="inline-flex items-center gap-2 max-w-full">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 shrink-0">substitute</span>
                    <code className="font-mono text-sm bg-muted/30 rounded-md px-3 py-1.5 overflow-x-auto whitespace-nowrap min-w-0 text-muted-foreground">
                      {s.substitution}
                    </code>
                  </div>
                )}
                {s.result && (
                  <div className="inline-flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-primary/70 shrink-0">result</span>
                    <code className="font-mono text-sm font-bold tabular-nums text-primary bg-primary/10 ring-1 ring-primary/30 rounded-md px-3 py-1.5">
                      {s.result}
                    </code>
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

  function nudge(deltaSign: 1 | -1, big: boolean) {
    const s = step ?? 0.01;
    const delta = deltaSign * s * (big ? 10 : 1);
    let next = value + delta;
    if (typeof min === "number") next = Math.max(min, next);
    if (typeof max === "number") next = Math.min(max, next);
    onChange(next);
  }

  return (
    <div
      className={`group glass-stat rounded-lg px-3 py-2.5 transition-all ${
        editing ? "ring-2 ring-primary/50" : "cursor-pointer hover:brightness-110"
      }`}
      onClick={() => !editing && setEditing(true)}
      title={hint ?? "Click to edit · scroll wheel to nudge · Shift+wheel for ×10"}
      onWheel={(e) => {
        if (editing) return;
        e.preventDefault();
        nudge(e.deltaY < 0 ? 1 : -1, e.shiftKey);
      }}
      onKeyDown={(e) => {
        if (editing) return;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          nudge(1, e.shiftKey);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          nudge(-1, e.shiftKey);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditing(true);
        }
      }}
      tabIndex={0}
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

/**
 * Variable solver: pick which symbol to solve for, type the others, and the
 * missing one is computed using the supplied formulas. Optional `onApply`
 * pushes all variable values back to the parent module.
 */
export type SolverDef = {
  vars: { symbol: string; label?: string; color?: string }[];
  /** symbol -> { formula, compute(knowns) } — all OTHER symbols are passed as knowns */
  solvers: Record<string, { formula: string; compute: (knowns: Record<string, number>) => number }>;
};

export function VariableSolver({
  title = "Solve for a variable",
  def,
  initial,
  onApply,
}: {
  title?: string;
  def: SolverDef;
  initial?: Record<string, number>;
  onApply?: (values: Record<string, number>) => void;
}) {
  const firstSymbol = def.vars[0]!.symbol;
  const [target, setTarget] = useState<string>(firstSymbol);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const r: Record<string, string> = {};
    for (const v of def.vars) r[v.symbol] = initial?.[v.symbol] != null ? String(initial[v.symbol]) : "";
    return r;
  });

  // Sync external initial when it changes meaningfully
  useEffect(() => {
    if (!initial) return;
    setVals((prev) => {
      const next = { ...prev };
      for (const v of def.vars) {
        if (v.symbol === target) continue; // don't overwrite the target field
        if (initial[v.symbol] != null) next[v.symbol] = String(roundDisplay(initial[v.symbol]));
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial), target]);

  const solver = def.solvers[target];

  const { result, error } = useMemo(() => {
    if (!solver) return { result: null as number | null, error: "No solver for this variable" };
    const knowns: Record<string, number> = {};
    for (const v of def.vars) {
      if (v.symbol === target) continue;
      const raw = vals[v.symbol];
      if (raw == null || raw.trim() === "") return { result: null, error: `Enter ${v.symbol} to solve` };
      const n = parseFloat(raw);
      if (!Number.isFinite(n)) return { result: null, error: `${v.symbol} is not a number` };
      knowns[v.symbol] = n;
    }
    try {
      const r = solver.compute(knowns);
      if (!Number.isFinite(r)) return { result: null, error: "No real solution" };
      return { result: r, error: null as string | null };
    } catch (e) {
      return { result: null, error: (e as Error).message };
    }
  }, [vals, target, solver, def.vars]);

  function applyAll() {
    if (result == null) return;
    const out: Record<string, number> = { [target]: result };
    for (const v of def.vars) {
      if (v.symbol === target) continue;
      const n = parseFloat(vals[v.symbol] ?? "");
      if (Number.isFinite(n)) out[v.symbol] = n;
    }
    onApply?.(out);
  }

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">{title}</h4>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Solve for:</span>
        {def.vars.map((v) => {
          const active = target === v.symbol;
          return (
            <button
              key={v.symbol}
              type="button"
              onClick={() => setTarget(v.symbol)}
              className={`px-2.5 py-1 rounded-md border text-xs font-mono font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover-elevate"
              }`}
              style={!active && v.color ? { color: v.color } : undefined}
            >
              {v.symbol}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {def.vars.map((v) => {
          if (v.symbol === target) {
            return (
              <div key={v.symbol} className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary">
                  <Sparkles className="w-3 h-3" />
                  Result · {v.label ?? v.symbol}
                </div>
                <div className="font-mono text-base font-bold tabular-nums" style={{ color: v.color }}>
                  {v.symbol} = {result == null ? "—" : roundDisplay(result)}
                </div>
                {error && <div className="text-[11px] text-muted-foreground mt-1">{error}</div>}
              </div>
            );
          }
          return (
            <label key={v.symbol} className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                {v.symbol}
                {v.label ? ` · ${v.label}` : ""}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={vals[v.symbol] ?? ""}
                onChange={(e) => setVals({ ...vals, [v.symbol]: e.target.value })}
                onWheel={(e) => {
                  e.preventDefault();
                  const n = parseFloat(vals[v.symbol] ?? "0");
                  const cur = Number.isFinite(n) ? n : 0;
                  const big = e.shiftKey ? 1 : 0.1;
                  const next = cur + (e.deltaY < 0 ? big : -big);
                  setVals({ ...vals, [v.symbol]: String(roundDisplay(next)) });
                }}
                placeholder={`type ${v.symbol}…`}
                className="bg-transparent border-0 outline-none font-mono text-sm tabular-nums focus:ring-0 p-0"
                style={{ color: v.color }}
              />
            </label>
          );
        })}
      </div>

      {solver && (
        <div className="font-mono text-xs text-muted-foreground border-t pt-3">
          <span className="text-foreground/80">Formula:</span>{" "}
          <span className="text-foreground">{solver.formula}</span>
        </div>
      )}

      {onApply && (
        <button
          type="button"
          onClick={applyAll}
          disabled={result == null}
          className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover-elevate"
        >
          Apply these values to the diagram
        </button>
      )}
    </div>
  );
}

function roundDisplay(v: number) {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs > 0 && (abs < 1e-3 || abs >= 1e6)) return v.toExponential(3);
  return Math.round(v * 1e6) / 1e6;
}
