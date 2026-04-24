import { useMemo, useState } from "react";
import { Plot, FunctionCurve, PointDot, VLine, HLine, Label } from "@/lib/plot";
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

export function QuadraticModule() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const fn = (x: number) => a * x * x + b * x + c;
  const vertexX = a !== 0 ? -b / (2 * a) : 0;
  const vertexY = fn(vertexX);
  const discriminant = b * b - 4 * a * c;
  const root1 = a !== 0 && discriminant >= 0 ? (-b - Math.sqrt(discriminant)) / (2 * a) : NaN;
  const root2 = a !== 0 && discriminant >= 0 ? (-b + Math.sqrt(discriminant)) / (2 * a) : NaN;
  const opens = a > 0 ? "upward (∪)" : a < 0 ? "downward (∩)" : "—";
  const nature =
    discriminant > 0 ? "Two real roots" : discriminant === 0 ? "One repeated root" : "No real roots";

  const steps: SolutionStep[] = useMemo(() => {
    const s: SolutionStep[] = [
      { text: "Start from the standard form of a parabola.", formula: "y = a·x² + b·x + c" },
      {
        text: "Substitute the current coefficients.",
        substitution: `y = ${a.toFixed(2)}·x² + ${b.toFixed(2)}·x + ${c.toFixed(2)}`,
      },
      {
        text: "The vertex sits where the slope is zero — that is at x = −b/(2a).",
        formula: "x_v = −b / (2a)",
        substitution: `x_v = −(${b.toFixed(2)}) / (2·${a.toFixed(2)})`,
        result: `x_v = ${vertexX.toFixed(3)}`,
      },
      {
        text: "Plug x_v back into y to get the vertex y-value.",
        formula: "y_v = a·x_v² + b·x_v + c",
        result: `y_v = ${vertexY.toFixed(3)}`,
      },
      {
        text: "The discriminant decides how many real x-intercepts exist.",
        formula: "Δ = b² − 4·a·c",
        substitution: `Δ = ${b.toFixed(2)}² − 4·${a.toFixed(2)}·${c.toFixed(2)}`,
        result: `Δ = ${discriminant.toFixed(3)}  (${nature.toLowerCase()})`,
      },
    ];
    if (Number.isFinite(root1)) {
      s.push({
        text: "Use the quadratic formula to find the roots.",
        formula: "x = (−b ± √Δ) / (2a)",
        substitution: `x = (−${b.toFixed(2)} ± √${discriminant.toFixed(3)}) / (2·${a.toFixed(2)})`,
        result: `x₁ = ${root1.toFixed(3)},  x₂ = ${root2.toFixed(3)}`,
      });
    }
    return s;
  }, [a, b, c, vertexX, vertexY, discriminant, root1, root2, nature]);

  return (
    <ModuleShell
      title="Quadratic Functions"
      description="Watch the parabola morph as you change a, b, and c. The coefficient a controls width and direction, while the discriminant tells you how many times it crosses the x-axis."
      formula={
        <span>
          y = <span className="text-[hsl(var(--chart-1))]">a</span>x² +{" "}
          <span className="text-[hsl(var(--accent))]">b</span>x +{" "}
          <span className="text-[hsl(var(--chart-3))]">c</span>
        </span>
      }
      controls={
        <>
          <SliderControl label="Coefficient" formula="a" value={a} onChange={setA} min={-3} max={3} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Coefficient" formula="b" value={b} onChange={setB} min={-8} max={8} step={0.1} color="hsl(var(--accent))" />
          <SliderControl label="Constant" formula="c" value={c} onChange={setC} min={-8} max={8} step={0.1} color="hsl(var(--chart-3))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            The vertex is at <span className="font-mono">(-b/2a, f(-b/2a))</span>. Roots exist when the discriminant <span className="font-mono">b²-4ac ≥ 0</span>.
          </div>
        </>
      }
      plot={
        <Plot height={460} interactive>
          <FunctionCurve fn={fn} color="hsl(var(--chart-1))" strokeWidth={3} />
          <VLine x={vertexX} color="hsl(var(--chart-2))" />
          <PointDot x={vertexX} y={vertexY} color="hsl(var(--chart-2))" label={`vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`} />
          {Number.isFinite(root1) && Math.abs(root1) <= 10 && <PointDot x={root1} y={0} color="hsl(var(--chart-3))" />}
          {Number.isFinite(root2) && Math.abs(root2) <= 10 && root2 !== root1 && <PointDot x={root2} y={0} color="hsl(var(--chart-3))" />}
          <PointDot x={0} y={c} color="hsl(var(--accent))" />
          <HLine y={0} dashed />
          <Label x={9} y={fn(9)} dy={-8} anchor="end">y = ax² + bx + c</Label>
        </Plot>
      }
      insights={
        <InsightCard>
          <Stat label="Equation" value={`${a.toFixed(2)}x² + ${b.toFixed(2)}x + ${c.toFixed(2)}`} accent="hsl(var(--chart-1))" />
          <EditableStat label="a (curvature)" value={a} onChange={setA} min={-50} max={50} step={0.1} accent="hsl(var(--chart-1))" hint="Click to type · scroll to nudge" />
          <EditableStat label="b (linear term)" value={b} onChange={setB} min={-100} max={100} step={0.1} accent="hsl(var(--accent))" hint="Click to type · scroll to nudge" />
          <EditableStat label="c (Y-Intercept)" value={c} onChange={setC} min={-100} max={100} step={0.1} accent="hsl(var(--accent))" hint="Click to type · scroll to nudge" />
          <Stat label="Opens" value={opens} />
          <Stat label="Vertex" value={`(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`} accent="hsl(var(--chart-2))" />
          <EditableStat
            label="Axis of symmetry (x)"
            value={vertexX}
            onChange={(x) => {
              if (a !== 0) setB(-2 * a * x);
            }}
            step={0.1}
            hint={a === 0 ? "Set a non-zero a first" : "Type a new axis x; b is recomputed"}
          />
          <Stat label="Discriminant b²−4ac" value={discriminant.toFixed(2)} />
          <Stat label="Nature of roots" value={nature} accent="hsl(var(--chart-3))" />
          <Stat label="Root 1" value={Number.isFinite(root1) ? root1.toFixed(3) : "—"} />
          <Stat label="Root 2" value={Number.isFinite(root2) ? root2.toFixed(3) : "—"} />
        </InsightCard>
      }
      extras={
        <>
          <VariableSolver
            title="Solve y = a·x² + b·x + c for any variable"
            def={{
              vars: [
                { symbol: "a", color: "hsl(var(--chart-1))" },
                { symbol: "b", color: "hsl(var(--accent))" },
                { symbol: "c", color: "hsl(var(--chart-3))" },
                { symbol: "x", label: "input", color: "hsl(var(--chart-2))" },
                { symbol: "y", label: "output", color: "hsl(var(--chart-4))" },
              ],
              solvers: {
                y: { formula: "y = a·x² + b·x + c", compute: (k) => k.a * k.x * k.x + k.b * k.x + k.c },
                a: { formula: "a = (y − b·x − c) / x²", compute: (k) => (k.y - k.b * k.x - k.c) / (k.x * k.x) },
                b: { formula: "b = (y − a·x² − c) / x", compute: (k) => (k.y - k.a * k.x * k.x - k.c) / k.x },
                c: { formula: "c = y − a·x² − b·x", compute: (k) => k.y - k.a * k.x * k.x - k.b * k.x },
                x: {
                  formula: "x = (−b ± √(b² − 4a(c−y))) / (2a)",
                  compute: (k) => {
                    const A = k.a;
                    const B = k.b;
                    const C = k.c - k.y;
                    if (A === 0) return -C / B;
                    const D = B * B - 4 * A * C;
                    if (D < 0) return NaN;
                    const r1 = (-B - Math.sqrt(D)) / (2 * A);
                    const r2 = (-B + Math.sqrt(D)) / (2 * A);
                    return Math.abs(r1) <= Math.abs(r2) ? r1 : r2;
                  },
                },
              },
            }}
            initial={{ a, b, c, x: 1, y: a + b + c }}
            onApply={(out) => {
              if (Number.isFinite(out.a)) setA(out.a);
              if (Number.isFinite(out.b)) setB(out.b);
              if (Number.isFinite(out.c)) setC(out.c);
            }}
          />
          <SolutionSteps title="Step-by-step derivation" steps={steps} />
        </>
      }
    />
  );
}
