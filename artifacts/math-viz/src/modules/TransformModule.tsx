import { useMemo, useState } from "react";
import { Plot, Polygon, PointDot, Line2D, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat, EditableStat } from "@/components/ModuleShell";

export function TransformModule() {
  // Linear transformation [[a,b],[c,d]]
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1);

  const original: [number, number][] = useMemo(
    () => [
      [1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [1, 2],
    ],
    []
  );

  const transformed = original.map(([x, y]): [number, number] => [
    a * x + b * y,
    c * x + d * y,
  ]);

  const det = a * d - b * c;
  const i_hat: [number, number] = [a, c];
  const j_hat: [number, number] = [b, d];

  return (
    <ModuleShell
      title="Linear Transformations"
      description="A 2×2 matrix transforms every point in the plane. Watch the basis vectors î and ĵ move — and the shape with them. The determinant tells you how much area is scaled (negative means flipped)."
      formula={
        <span>
          M = [[<span className="text-[hsl(var(--chart-1))]">a</span>,{" "}
          <span className="text-[hsl(var(--accent))]">b</span>], [
          <span className="text-[hsl(var(--chart-3))]">c</span>,{" "}
          <span className="text-[hsl(var(--chart-4))]">d</span>]]
        </span>
      }
      controls={
        <>
          <SliderControl label="a" value={a} onChange={setA} min={-1000} max={1000} step={0.05} color="hsl(var(--chart-1))" />
          <SliderControl label="b" value={b} onChange={setB} min={-1000} max={1000} step={0.05} color="hsl(var(--accent))" />
          <SliderControl label="c" value={c} onChange={setC} min={-1000} max={1000} step={0.05} color="hsl(var(--chart-3))" />
          <SliderControl label="d" value={d} onChange={setD} min={-1000} max={1000} step={0.05} color="hsl(var(--chart-4))" />
          <div className="grid grid-cols-2 gap-2 pt-3 border-t">
            <button onClick={() => { setA(1); setB(0); setC(0); setD(1); }} className="px-2 py-1.5 text-xs rounded-md border border-border bg-card hover-elevate">Identity</button>
            <button onClick={() => { setA(0); setB(-1); setC(1); setD(0); }} className="px-2 py-1.5 text-xs rounded-md border border-border bg-card hover-elevate">Rotate 90°</button>
            <button onClick={() => { setA(2); setB(0); setC(0); setD(2); }} className="px-2 py-1.5 text-xs rounded-md border border-border bg-card hover-elevate">Scale ×2</button>
            <button onClick={() => { setA(1); setB(1); setC(0); setD(1); }} className="px-2 py-1.5 text-xs rounded-md border border-border bg-card hover-elevate">Shear</button>
            <button onClick={() => { setA(-1); setB(0); setC(0); setD(1); }} className="px-2 py-1.5 text-xs rounded-md border border-border bg-card hover-elevate">Flip x</button>
            <button onClick={() => { setA(1); setB(0); setC(0); setD(-1); }} className="px-2 py-1.5 text-xs rounded-md border border-border bg-card hover-elevate">Flip y</button>
          </div>
        </>
      }
      plot={
        <Plot height={520} interactive range={{ xMin: -10, xMax: 10, yMin: -10, yMax: 10 }}>
          {/* Original shape */}
          <Polygon points={original} fill="hsl(var(--muted-foreground))" stroke="hsl(var(--muted-foreground))" opacity={0.15} strokeWidth={1.5} />
          {/* Transformed shape */}
          <Polygon points={transformed} fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" opacity={0.3} strokeWidth={2.5} />
          {/* Basis vectors */}
          <Line2D x1={0} y1={0} x2={i_hat[0]} y2={i_hat[1]} color="hsl(var(--chart-3))" width={3} />
          <Line2D x1={0} y1={0} x2={j_hat[0]} y2={j_hat[1]} color="hsl(var(--chart-4))" width={3} />
          <PointDot x={i_hat[0]} y={i_hat[1]} color="hsl(var(--chart-3))" label="î" />
          <PointDot x={j_hat[0]} y={j_hat[1]} color="hsl(var(--chart-4))" label="ĵ" />
          <Label x={-9} y={-9} anchor="start">grey = original</Label>
        </Plot>
      }
      insights={
        <InsightCard>
          <Stat label="Matrix" value={`[[${a.toFixed(2)}, ${b.toFixed(2)}], [${c.toFixed(2)}, ${d.toFixed(2)}]]`} accent="hsl(var(--chart-1))" />
          <EditableStat label="a (M₁₁)" value={a} onChange={setA} min={-999999} max={999999} step={0.05} accent="hsl(var(--chart-1))" />
          <EditableStat label="b (M₁₂)" value={b} onChange={setB} min={-999999} max={999999} step={0.05} accent="hsl(var(--accent))" />
          <EditableStat label="c (M₂₁)" value={c} onChange={setC} min={-999999} max={999999} step={0.05} accent="hsl(var(--chart-3))" />
          <EditableStat label="d (M₂₂)" value={d} onChange={setD} min={-999999} max={999999} step={0.05} accent="hsl(var(--chart-4))" />
          <Stat label="Determinant" value={det.toFixed(3)} accent={det < 0 ? "hsl(var(--destructive))" : "hsl(var(--chart-1))"} />
          <Stat label="Area scale" value={`×${Math.abs(det).toFixed(3)}`} />
          <Stat label="Orientation" value={det >= 0 ? "preserved" : "flipped"} />
          <Stat label="î maps to" value={`(${i_hat[0].toFixed(2)}, ${i_hat[1].toFixed(2)})`} accent="hsl(var(--chart-3))" />
          <Stat label="ĵ maps to" value={`(${j_hat[0].toFixed(2)}, ${j_hat[1].toFixed(2)})`} accent="hsl(var(--chart-4))" />
          <Stat label="Singular?" value={Math.abs(det) < 1e-6 ? "yes — collapses to a line" : "no"} />
        </InsightCard>
      }
    />
  );
}
