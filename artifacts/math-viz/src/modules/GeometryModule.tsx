import { useState } from "react";
import { Plot, Circle2D, Polygon, Line2D, PointDot, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat } from "@/components/ModuleShell";

type Shape = "circle" | "triangle" | "polygon";

export function GeometryModule() {
  const [shape, setShape] = useState<Shape>("circle");

  // Circle
  const [cr, setCr] = useState(4);
  const [cx, setCx] = useState(0);
  const [cy, setCy] = useState(0);

  // Triangle
  const [ax, setAx] = useState(-3);
  const [ay, setAy] = useState(-2);
  const [bx, setBx] = useState(4);
  const [by, setBy] = useState(-2);
  const [tx, setTx] = useState(1);
  const [ty, setTy] = useState(4);

  // Regular polygon
  const [sides, setSides] = useState(6);
  const [pr, setPr] = useState(4);
  const [rot, setRot] = useState(0);

  function renderCircle() {
    const area = Math.PI * cr * cr;
    const circ = 2 * Math.PI * cr;
    return {
      plot: (
        <>
          <Circle2D cx={cx} cy={cy} r={cr} fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" opacity={0.18} strokeWidth={2.5} />
          <Line2D x1={cx} y1={cy} x2={cx + cr} y2={cy} color="hsl(var(--chart-2))" width={2} />
          <PointDot x={cx} y={cy} color="hsl(var(--chart-2))" label="center" />
          <Label x={cx + cr / 2} y={cy} dy={-6} anchor="middle">{`r = ${cr.toFixed(2)}`}</Label>
        </>
      ),
      insights: (
        <>
          <Stat label="Center" value={`(${cx.toFixed(2)}, ${cy.toFixed(2)})`} accent="hsl(var(--chart-2))" />
          <Stat label="Radius" value={cr.toFixed(2)} accent="hsl(var(--chart-1))" />
          <Stat label="Diameter" value={(cr * 2).toFixed(2)} />
          <Stat label="Circumference" value={`${circ.toFixed(3)} = 2πr`} />
          <Stat label="Area" value={`${area.toFixed(3)} = πr²`} accent="hsl(var(--chart-1))" />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Radius" formula="r" value={cr} onChange={setCr} min={0.5} max={9} step={0.05} color="hsl(var(--chart-1))" />
          <SliderControl label="Center x" formula="cx" value={cx} onChange={setCx} min={-9} max={9} step={0.1} />
          <SliderControl label="Center y" formula="cy" value={cy} onChange={setCy} min={-9} max={9} step={0.1} />
        </>
      ),
    };
  }

  function renderTriangle() {
    const sideAB = Math.hypot(bx - ax, by - ay);
    const sideBC = Math.hypot(tx - bx, ty - by);
    const sideCA = Math.hypot(ax - tx, ay - ty);
    const perim = sideAB + sideBC + sideCA;
    const area = Math.abs((ax * (by - ty) + bx * (ty - ay) + tx * (ay - by)) / 2);
    // angle at A using law of cosines
    const angA = Math.acos((sideAB ** 2 + sideCA ** 2 - sideBC ** 2) / (2 * sideAB * sideCA));
    const angB = Math.acos((sideAB ** 2 + sideBC ** 2 - sideCA ** 2) / (2 * sideAB * sideBC));
    const angC = Math.PI - angA - angB;
    const toDeg = (r: number) => (r * 180) / Math.PI;
    return {
      plot: (
        <>
          <Polygon points={[[ax, ay], [bx, by], [tx, ty]]} fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" strokeWidth={2.5} opacity={0.22} />
          <PointDot x={ax} y={ay} color="hsl(var(--chart-1))" label="A" />
          <PointDot x={bx} y={by} color="hsl(var(--chart-3))" label="B" />
          <PointDot x={tx} y={ty} color="hsl(var(--chart-4))" label="C" />
        </>
      ),
      insights: (
        <>
          <Stat label="Perimeter" value={perim.toFixed(3)} accent="hsl(var(--chart-2))" />
          <Stat label="Area (Shoelace)" value={area.toFixed(3)} accent="hsl(var(--chart-1))" />
          <Stat label="Side AB" value={sideAB.toFixed(3)} />
          <Stat label="Side BC" value={sideBC.toFixed(3)} />
          <Stat label="Side CA" value={sideCA.toFixed(3)} />
          <Stat label="Angle A" value={`${toDeg(angA).toFixed(2)}°`} />
          <Stat label="Angle B" value={`${toDeg(angB).toFixed(2)}°`} />
          <Stat label="Angle C" value={`${toDeg(angC).toFixed(2)}°`} />
          <Stat label="Sum of angles" value={`${(toDeg(angA) + toDeg(angB) + toDeg(angC)).toFixed(2)}°`} />
        </>
      ),
      controls: (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Vertex A</div>
          <SliderControl label="Ax" value={ax} onChange={setAx} min={-9} max={9} step={0.1} />
          <SliderControl label="Ay" value={ay} onChange={setAy} min={-9} max={9} step={0.1} />
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pt-2">Vertex B</div>
          <SliderControl label="Bx" value={bx} onChange={setBx} min={-9} max={9} step={0.1} />
          <SliderControl label="By" value={by} onChange={setBy} min={-9} max={9} step={0.1} />
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pt-2">Vertex C</div>
          <SliderControl label="Cx" value={tx} onChange={setTx} min={-9} max={9} step={0.1} />
          <SliderControl label="Cy" value={ty} onChange={setTy} min={-9} max={9} step={0.1} />
        </>
      ),
    };
  }

  function renderPolygon() {
    const n = Math.max(3, Math.round(sides));
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rot * Math.PI) / 180;
      pts.push([pr * Math.cos(a), pr * Math.sin(a)]);
    }
    const apothem = pr * Math.cos(Math.PI / n);
    const sideLen = 2 * pr * Math.sin(Math.PI / n);
    const perim = n * sideLen;
    const area = (1 / 2) * perim * apothem;
    const interiorAngle = ((n - 2) * 180) / n;
    return {
      plot: (
        <>
          <Circle2D cx={0} cy={0} r={pr} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.5} />
          <Polygon points={pts} fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" strokeWidth={2.5} opacity={0.22} />
          <PointDot x={0} y={0} color="hsl(var(--chart-2))" />
          <Line2D x1={0} y1={0} x2={pts[0]![0]} y2={pts[0]![1]} color="hsl(var(--chart-2))" />
        </>
      ),
      insights: (
        <>
          <Stat label="Sides" value={`${n}`} accent="hsl(var(--chart-3))" />
          <Stat label="Side length" value={sideLen.toFixed(3)} />
          <Stat label="Perimeter" value={perim.toFixed(3)} />
          <Stat label="Apothem" value={apothem.toFixed(3)} />
          <Stat label="Area" value={area.toFixed(3)} accent="hsl(var(--chart-3))" />
          <Stat label="Interior angle" value={`${interiorAngle.toFixed(2)}°`} />
          <Stat label="Exterior angle" value={`${(180 - interiorAngle).toFixed(2)}°`} />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Sides" formula="n" value={sides} onChange={(v) => setSides(Math.round(v))} min={3} max={20} step={1} color="hsl(var(--chart-3))" />
          <SliderControl label="Radius" formula="r" value={pr} onChange={setPr} min={1} max={9} step={0.1} />
          <SliderControl label="Rotation" formula="θ°" value={rot} onChange={setRot} min={0} max={360} step={1} />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            As <span className="font-mono">n</span> grows, the regular polygon converges toward a circle of the same radius.
          </div>
        </>
      ),
    };
  }

  const cur = shape === "circle" ? renderCircle() : shape === "triangle" ? renderTriangle() : renderPolygon();

  return (
    <ModuleShell
      title="Geometry"
      description="Manipulate geometric figures and watch their measurements update live. Perfect for building intuition about radius vs area, angles in triangles, and the way regular polygons approximate circles."
      formula={<span>Live formulas update with every change</span>}
      controls={
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {(["circle", "triangle", "polygon"] as Shape[]).map((s) => (
                <button key={s} onClick={() => setShape(s)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize ${
                    shape === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover-elevate"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t space-y-5">{cur.controls}</div>
        </>
      }
      plot={
        <Plot height={520} range={{ xMin: -10, xMax: 10, yMin: -10, yMax: 10 }}>
          {cur.plot}
        </Plot>
      }
      insights={<InsightCard>{cur.insights}</InsightCard>}
    />
  );
}
