import { useMemo, useState } from "react";
import { Plot, FunctionCurve, VLine, usePlotCtx } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat, EditableStat } from "@/components/ModuleShell";

type FnKey = "poly" | "sin" | "exp" | "quad";
const FUNCTIONS: Record<FnKey, { label: string; fn: (x: number) => number; expr: string }> = {
  poly: { label: "x² ⁄ 4", fn: (x) => (x * x) / 4, expr: "f(x) = x²/4" },
  quad: { label: "−x² + 9", fn: (x) => -x * x + 9, expr: "f(x) = −x² + 9" },
  sin: { label: "2·sin(x) + 3", fn: (x) => 2 * Math.sin(x) + 3, expr: "f(x) = 2·sin(x)+3" },
  exp: { label: "eˣ⁄³", fn: (x) => Math.exp(x / 3), expr: "f(x) = e^(x/3)" },
};

type Method = "left" | "right" | "midpoint" | "trapezoid";

function RiemannBars({
  fn, a, b, n, method, color = "hsl(var(--chart-2))",
}: { fn: (x: number) => number; a: number; b: number; n: number; method: Method; color?: string }) {
  const ctx = usePlotCtx();
  const dx = (b - a) / n;
  const bars: { x: number; w: number; h: number; y: number; signed: number; pts?: [number, number, number, number] }[] = [];
  for (let i = 0; i < n; i++) {
    const x1 = a + i * dx;
    const x2 = x1 + dx;
    let y: number;
    if (method === "left") y = fn(x1);
    else if (method === "right") y = fn(x2);
    else if (method === "midpoint") y = fn((x1 + x2) / 2);
    else y = (fn(x1) + fn(x2)) / 2; // trapezoid uses height = avg
    if (method === "trapezoid") {
      bars.push({ x: x1, w: dx, h: 0, y: 0, signed: ((fn(x1) + fn(x2)) / 2) * dx, pts: [x1, fn(x1), x2, fn(x2)] });
    } else {
      bars.push({ x: x1, w: dx, h: y, y: 0, signed: y * dx });
    }
  }
  return (
    <g>
      {bars.map((bar, i) => {
        if (method === "trapezoid" && bar.pts) {
          const [tx1, ty1, tx2, ty2] = bar.pts;
          const px1 = ctx.toX(tx1);
          const px2 = ctx.toX(tx2);
          const py1 = ctx.toY(ty1);
          const py2 = ctx.toY(ty2);
          const py0 = ctx.toY(0);
          return (
            <polygon key={i} points={`${px1},${py0} ${px1},${py1} ${px2},${py2} ${px2},${py0}`}
              fill={color} fillOpacity={0.28} stroke={color} strokeWidth={1} />
          );
        }
        const px = ctx.toX(bar.x);
        const pw = Math.abs(ctx.toX(bar.x + bar.w) - ctx.toX(bar.x));
        const py = ctx.toY(Math.max(0, bar.h));
        const ph = Math.abs(ctx.toY(bar.h) - ctx.toY(0));
        return (
          <rect key={i} x={px} y={py} width={Math.max(0.5, pw - 0.5)} height={ph}
            fill={color} fillOpacity={0.28} stroke={color} strokeWidth={1} />
        );
      })}
    </g>
  );
}

export function IntegralModule() {
  const [fnKey, setFnKey] = useState<FnKey>("quad");
  const [a, setA] = useState(-2);
  const [b, setB] = useState(2);
  const [n, setN] = useState(8);
  const [method, setMethod] = useState<Method>("midpoint");

  const f = FUNCTIONS[fnKey].fn;

  const { riemann, exact } = useMemo(() => {
    const dx = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x1 = a + i * dx;
      const x2 = x1 + dx;
      let y: number;
      if (method === "left") y = f(x1);
      else if (method === "right") y = f(x2);
      else if (method === "midpoint") y = f((x1 + x2) / 2);
      else y = (f(x1) + f(x2)) / 2;
      sum += y * dx;
    }
    // High-resolution reference (Simpson's-ish trapezoidal with many slices)
    const N = 5000;
    const dxx = (b - a) / N;
    let exactSum = 0;
    for (let i = 0; i < N; i++) {
      const x1 = a + i * dxx;
      const x2 = x1 + dxx;
      exactSum += ((f(x1) + f(x2)) / 2) * dxx;
    }
    return { riemann: sum, exact: exactSum };
  }, [f, a, b, n, method]);

  const error = riemann - exact;

  return (
    <ModuleShell
      title="Integrals & Riemann Sums"
      description="A definite integral measures the signed area between a curve and the x-axis. Add more rectangles or switch methods to watch the approximation converge to the true area."
      formula={<span>∫<sub>a</sub><sup>b</sup> f(x) dx ≈ Σ f(xᵢ)·Δx</span>}
      controls={
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Function</label>
            <select value={fnKey} onChange={(e) => setFnKey(e.target.value as FnKey)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono">
              {Object.entries(FUNCTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Method</label>
            <div className="grid grid-cols-2 gap-2">
              {(["left", "right", "midpoint", "trapezoid"] as Method[]).map((mtd) => (
                <button key={mtd} onClick={() => setMethod(mtd)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize ${
                    method === mtd
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover-elevate"
                  }`}>{mtd}</button>
              ))}
            </div>
          </div>
          <SliderControl label="Lower bound" formula="a" value={a} onChange={(v) => setA(Math.min(v, b - 0.1))} min={-9} max={9} step={0.1} color="hsl(var(--chart-3))" />
          <SliderControl label="Upper bound" formula="b" value={b} onChange={(v) => setB(Math.max(v, a + 0.1))} min={-9} max={9} step={0.1} color="hsl(var(--chart-4))" />
          <SliderControl label="Subdivisions" formula="n" value={n} onChange={(v) => setN(Math.round(v))} min={1} max={100} step={1} color="hsl(var(--chart-2))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Increase <span className="font-mono">n</span> and the error shrinks fast. The midpoint and trapezoid methods are usually more accurate than left/right sums.
          </div>
        </>
      }
      plot={
        <Plot height={460} range={{ xMin: -10, xMax: 10, yMin: -4, yMax: 12 }}>
          <RiemannBars fn={f} a={a} b={b} n={n} method={method} />
          <FunctionCurve fn={f} color="hsl(var(--chart-1))" strokeWidth={3} />
          <VLine x={a} color="hsl(var(--chart-3))" dashed={false} />
          <VLine x={b} color="hsl(var(--chart-4))" dashed={false} />
        </Plot>
      }
      insights={
        <InsightCard>
          <Stat label="Function" value={FUNCTIONS[fnKey].expr} accent="hsl(var(--chart-1))" />
          <EditableStat label="Lower bound (a)" value={a} onChange={(v) => setA(Math.min(v, b - 0.01))} accent="hsl(var(--chart-3))" hint="Click to type a new lower bound" />
          <EditableStat label="Upper bound (b)" value={b} onChange={(v) => setB(Math.max(v, a + 0.01))} accent="hsl(var(--chart-4))" hint="Click to type a new upper bound" />
          <EditableStat label="Subdivisions (n)" value={n} onChange={(v) => setN(Math.max(1, Math.round(v)))} min={1} max={1000} format={(v) => `${Math.round(v)}`} accent="hsl(var(--chart-2))" hint="Click to type a new n" />
          <Stat label="Method" value={method} accent="hsl(var(--chart-2))" />
          <Stat label="Riemann sum" value={riemann.toFixed(4)} accent="hsl(var(--chart-2))" />
          <Stat label="True area (≈)" value={exact.toFixed(4)} accent="hsl(var(--chart-1))" />
          <Stat label="Error" value={error.toExponential(2)} accent="hsl(var(--destructive))" />
          <Stat label="Δx" value={((b - a) / n).toFixed(4)} />
          <Stat label="|error| / true" value={`${exact !== 0 ? ((Math.abs(error) / Math.abs(exact)) * 100).toFixed(3) : "—"}%`} />
        </InsightCard>
      }
    />
  );
}
