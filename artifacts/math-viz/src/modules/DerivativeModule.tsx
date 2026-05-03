import { useMemo, useState } from "react";
import { Plot, FunctionCurve, PointDot, VLine, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import {
  ModuleShell,
  InsightCard,
  Stat,
  EditableStat,
  SolutionSteps,
  VariableSolver,
  type SolutionStep,
} from "@/components/ModuleShell";

type FnKey = "poly" | "sin" | "exp" | "abs" | "cubic";

const FUNCTIONS: Record<FnKey, { label: string; fn: (x: number) => number; expr: string; deriv: string }> = {
  poly: { label: "Quadratic: x²", fn: (x) => x * x, expr: "f(x) = x²", deriv: "f′(x) = 2x" },
  cubic: { label: "Cubic: x³ − 3x", fn: (x) => x * x * x - 3 * x, expr: "f(x) = x³ − 3x", deriv: "f′(x) = 3x² − 3" },
  sin: { label: "Sinusoid: sin(x)", fn: (x) => Math.sin(x), expr: "f(x) = sin(x)", deriv: "f′(x) = cos(x)" },
  exp: { label: "Exponential: eˣ⁄³", fn: (x) => Math.exp(x / 3), expr: "f(x) = e^(x/3)", deriv: "f′(x) = (1/3)·e^(x/3)" },
  abs: { label: "Absolute: |x|", fn: (x) => Math.abs(x), expr: "f(x) = |x|", deriv: "f′(x) = sign(x), undefined at 0" },
};

export function DerivativeModule() {
  const [fnKey, setFnKey] = useState<FnKey>("poly");
  const [x0, setX0] = useState(1);
  const [h, setH] = useState(0.5);

  const f = FUNCTIONS[fnKey].fn;
  const y0 = f(x0);
  const slopeExact = (f(x0 + 1e-6) - f(x0 - 1e-6)) / 2e-6;
  const slopeSecant = (f(x0 + h) - f(x0)) / h;

  const tangent = (x: number) => slopeExact * (x - x0) + y0;
  const secant = (x: number) => slopeSecant * (x - x0) + y0;

  // Auto-scale range based on parameters
  const range = useMemo(() => {
    const margin = 3;
    const xSpan = Math.max(Math.abs(x0) + margin, 6);
    const ySpan = Math.max(Math.abs(y0) + margin, 6);
    return { xMin: -xSpan, xMax: xSpan, yMin: -ySpan, yMax: ySpan };
  }, [x0, y0]);

  const steps: SolutionStep[] = useMemo(
    () => [
      {
        text: "The derivative is defined as the limit of the secant slope as the step h shrinks toward zero.",
        formula: "f′(x) = limₕ→₀ (f(x+h) − f(x)) / h",
      },
      {
        text: `Pick the function to differentiate.`,
        formula: FUNCTIONS[fnKey].expr,
      },
      {
        text: `Apply the standard differentiation rule for this family.`,
        formula: FUNCTIONS[fnKey].deriv,
      },
      {
        text: `Compute the secant slope between x₀ and x₀+h with the chosen step.`,
        formula: "m_sec = (f(x+h) − f(x)) / h",
        substitution: `m_sec = (f(${(x0 + h).toFixed(2)}) − f(${x0.toFixed(2)})) / ${h.toFixed(3)}`,
        result: `m_sec = ${slopeSecant.toFixed(4)}`,
      },
      {
        text: `Compare to the true derivative at x₀ — the gap is the approximation error.`,
        substitution: `|${slopeExact.toFixed(4)} − ${slopeSecant.toFixed(4)}|`,
        result: `error = ${Math.abs(slopeExact - slopeSecant).toExponential(2)}`,
      },
      {
        text: `Write the equation of the tangent line through (x₀, f(x₀)).`,
        formula: "y = f(x₀) + f′(x₀)·(x − x₀)",
        substitution: `y = ${y0.toFixed(3)} + ${slopeExact.toFixed(3)}·(x − ${x0.toFixed(2)})`,
      },
    ],
    [fnKey, x0, h, y0, slopeExact, slopeSecant]
  );

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
          <SliderControl label="Point" formula="x₀" value={x0} onChange={setX0} min={-1000} max={1000} step={0.05} color="hsl(var(--chart-2))" />
          <SliderControl label="Step" formula="h" value={h} onChange={setH} min={0.001} max={1000} step={0.01} color="hsl(var(--chart-4))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Drag <span className="font-mono">h</span> toward 0 — the secant slope converges to the true derivative. The tangent line is the limit of all secants.
          </div>
        </>
      }
      plot={
        <Plot height={460} interactive range={range}>
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
          <Stat label="Derivative" value={FUNCTIONS[fnKey].deriv} accent="hsl(var(--chart-2))" />
          <EditableStat label="Point x₀" value={x0} onChange={setX0} min={-999999} max={999999} step={0.05} accent="hsl(var(--chart-2))" hint="Click to type · scroll to nudge" />
          <Stat label="f(x₀)" value={y0.toFixed(4)} accent="hsl(var(--chart-2))" />
          <Stat label="Tangent slope f′(x₀)" value={slopeExact.toFixed(4)} accent="hsl(var(--chart-2))" />
          <Stat label="Secant slope" value={slopeSecant.toFixed(4)} accent="hsl(var(--chart-4))" />
          <EditableStat label="Step h" value={h} onChange={setH} min={0.001} max={999999} step={0.01} format={(v) => v.toFixed(3)} hint="Click to type · scroll to nudge" />
          <Stat label="Approximation error" value={Math.abs(slopeExact - slopeSecant).toExponential(2)} />
        </InsightCard>
      }
      extras={
        <>
          <VariableSolver
            title="Tangent line: y = f(x₀) + m·(x − x₀) — solve for any variable"
            def={{
              vars: [
                { symbol: "m", label: "slope f′(x₀)", color: "hsl(var(--chart-2))" },
                { symbol: "x0", label: "anchor x₀", color: "hsl(var(--chart-3))" },
                { symbol: "y0", label: "anchor y₀", color: "hsl(var(--chart-3))" },
                { symbol: "x", label: "input", color: "hsl(var(--chart-1))" },
                { symbol: "y", label: "output", color: "hsl(var(--chart-4))" },
              ],
              solvers: {
                y: { formula: "y = y0 + m·(x − x0)", compute: (k) => k.y0 + k.m * (k.x - k.x0) },
                x: { formula: "x = (y − y0)/m + x0", compute: (k) => (k.y - k.y0) / k.m + k.x0 },
                m: { formula: "m = (y − y0) / (x − x0)", compute: (k) => (k.y - k.y0) / (k.x - k.x0) },
                y0: { formula: "y0 = y − m·(x − x0)", compute: (k) => k.y - k.m * (k.x - k.x0) },
                x0: { formula: "x0 = x − (y − y0)/m", compute: (k) => k.x - (k.y - k.y0) / k.m },
              },
            }}
            initial={{ m: slopeExact, x0, y0, x: x0 + 1, y: y0 + slopeExact }}
          />
          <SolutionSteps title="Building the tangent line" steps={steps} />
        </>
      }
    />
  );
}
