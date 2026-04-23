import { useState } from "react";
import { Plot, FunctionCurve, PointDot, VLine, HLine, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat } from "@/components/ModuleShell";

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
        <Plot height={460}>
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
          <Stat label="Opens" value={opens} />
          <Stat label="Vertex" value={`(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`} accent="hsl(var(--chart-2))" />
          <Stat label="Axis of symmetry" value={`x = ${vertexX.toFixed(2)}`} />
          <Stat label="Discriminant b²−4ac" value={discriminant.toFixed(2)} />
          <Stat label="Nature of roots" value={nature} accent="hsl(var(--chart-3))" />
          <Stat label="Root 1" value={Number.isFinite(root1) ? root1.toFixed(3) : "—"} />
          <Stat label="Root 2" value={Number.isFinite(root2) ? root2.toFixed(3) : "—"} />
          <Stat label="Y-Intercept" value={`(0, ${c.toFixed(2)})`} accent="hsl(var(--accent))" />
        </InsightCard>
      }
    />
  );
}
