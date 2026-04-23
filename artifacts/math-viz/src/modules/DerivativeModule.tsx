import { useState } from "react";
import { Plot, FunctionCurve, PointDot, VLine, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat } from "@/components/ModuleShell";

type FnKey = "poly" | "sin" | "exp" | "abs" | "cubic";

const FUNCTIONS: Record<FnKey, { label: string; fn: (x: number) => number; expr: string }> = {
  poly: { label: "Quadratic: x²", fn: (x) => x * x, expr: "f(x) = x²" },
  cubic: { label: "Cubic: x³ − 3x", fn: (x) => x * x * x - 3 * x, expr: "f(x) = x³ − 3x" },
  sin: { label: "Sinusoid: sin(x)", fn: (x) => Math.sin(x), expr: "f(x) = sin(x)" },
  exp: { label: "Exponential: eˣ⁄³", fn: (x) => Math.exp(x / 3), expr: "f(x) = e^(x/3)" },
  abs: { label: "Absolute: |x|", fn: (x) => Math.abs(x), expr: "f(x) = |x|" },
};

export function DerivativeModule() {
  const [fnKey, setFnKey] = useState<FnKey>("poly");
  const [x0, setX0] = useState(1);
  const [h, setH] = useState(0.5);

  const f = FUNCTIONS[fnKey].fn;
  const y0 = f(x0);
  // Numeric derivative using symmetric difference
  const slopeExact = (f(x0 + 1e-6) - f(x0 - 1e-6)) / 2e-6;
  // Secant using forward difference of step h
  const slopeSecant = (f(x0 + h) - f(x0)) / h;

  const tangent = (x: number) => slopeExact * (x - x0) + y0;
  const secant = (x: number) => slopeSecant * (x - x0) + y0;

  return (
    <ModuleShell
      title="Derivatives & Tangent Lines"
      description="A derivative is the instantaneous slope of a curve. Watch how the secant line (through two points) approaches the true tangent line as the step h shrinks toward zero."
      formula={<span>f′(x) = lim<sub>h→0</sub> (f(x+h) − f(x)) / h</span>}
      controls={
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Function</label>
            <select
              value={fnKey}
              onChange={(e) => setFnKey(e.target.value as FnKey)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            >
              {Object.entries(FUNCTIONS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <SliderControl label="Point" formula="x₀" value={x0} onChange={setX0} min={-6} max={6} step={0.05} color="hsl(var(--chart-2))" />
          <SliderControl label="Step" formula="h" value={h} onChange={setH} min={0.01} max={3} step={0.01} color="hsl(var(--chart-4))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Drag <span className="font-mono">h</span> toward 0 — the secant slope converges to the true derivative. The tangent line is the limit of all secants.
          </div>
        </>
      }
      plot={
        <Plot height={460}>
          <FunctionCurve fn={f} color="hsl(var(--chart-1))" strokeWidth={3} />
          <FunctionCurve fn={secant} color="hsl(var(--chart-4))" strokeWidth={2} dashed />
          <FunctionCurve fn={tangent} color="hsl(var(--chart-2))" strokeWidth={2.5} />
          <VLine x={x0} dashed />
          <VLine x={x0 + h} color="hsl(var(--chart-4))" dashed />
          <PointDot x={x0} y={y0} color="hsl(var(--chart-2))" label={`(${x0.toFixed(2)}, ${y0.toFixed(2)})`} />
          <PointDot x={x0 + h} y={f(x0 + h)} color="hsl(var(--chart-4))" />
          <Label x={-9} y={9} anchor="start">tangent</Label>
        </Plot>
      }
      insights={
        <InsightCard>
          <Stat label="Function" value={FUNCTIONS[fnKey].expr} accent="hsl(var(--chart-1))" />
          <Stat label="Point" value={`(${x0.toFixed(2)}, ${y0.toFixed(2)})`} accent="hsl(var(--chart-2))" />
          <Stat label="Tangent slope f′(x₀)" value={slopeExact.toFixed(4)} accent="hsl(var(--chart-2))" />
          <Stat label="Secant slope" value={slopeSecant.toFixed(4)} accent="hsl(var(--chart-4))" />
          <Stat label="Step h" value={h.toFixed(3)} />
          <Stat label="Approximation error" value={Math.abs(slopeExact - slopeSecant).toExponential(2)} />
        </InsightCard>
      }
    />
  );
}
