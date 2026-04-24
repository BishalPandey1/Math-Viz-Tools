import { Slider } from "@/components/ui/slider";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  formula?: string;
  color?: string;
};

export function SliderControl({ label, value, onChange, min, max, step = 0.01, formula, color }: Props) {
  const isInt = Number.isInteger(step);
  function clamp(v: number) {
    return Math.min(max, Math.max(min, v));
  }
  function nudge(sign: 1 | -1, big: boolean) {
    onChange(clamp(value + sign * step * (big ? 10 : 1)));
  }
  return (
    <div
      className="space-y-2"
      onWheel={(e) => {
        e.preventDefault();
        nudge(e.deltaY < 0 ? 1 : -1, e.shiftKey);
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          {color && <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
          <label className="text-sm font-medium">{label}</label>
          {formula && <span className="text-xs text-muted-foreground font-mono">{formula}</span>}
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={isInt ? value.toFixed(0) : value.toFixed(2)}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^\d.\-eE]/g, "");
            const n = parseFloat(cleaned);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              nudge(1, e.shiftKey);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              nudge(-1, e.shiftKey);
            }
          }}
          title="Type a number · ↑/↓ or scroll to nudge · Shift for ×10"
          className="w-20 font-mono text-sm tabular-nums text-foreground bg-muted px-2 py-0.5 rounded-md text-right outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? 0)}
      />
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}
