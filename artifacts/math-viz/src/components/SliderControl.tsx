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
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          {color && <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
          <label className="text-sm font-medium">{label}</label>
          {formula && <span className="text-xs text-muted-foreground font-mono">{formula}</span>}
        </div>
        <span className="font-mono text-sm tabular-nums text-foreground bg-muted px-2 py-0.5 rounded-md">
          {Number.isInteger(step) ? value.toFixed(0) : value.toFixed(2)}
        </span>
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
