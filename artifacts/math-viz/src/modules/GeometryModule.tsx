import { useMemo, useState } from "react";
import {
  Plot,
  Circle2D,
  Polygon,
  Line2D,
  PointDot,
  Label,
  Ellipse2D,
  Sector2D,
  AngleArc,
} from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import {
  ModuleShell,
  InsightCard,
  Stat,
  EditableStat,
  SolutionSteps,
  type SolutionStep,
} from "@/components/ModuleShell";

type Shape =
  | "circle"
  | "ellipse"
  | "square"
  | "rectangle"
  | "triangle"
  | "rightTriangle"
  | "parallelogram"
  | "trapezoid"
  | "rhombus"
  | "sector"
  | "polygon";

const SHAPE_LABELS: Record<Shape, string> = {
  circle: "Circle",
  ellipse: "Ellipse",
  square: "Square",
  rectangle: "Rectangle",
  triangle: "Triangle",
  rightTriangle: "Right Triangle",
  parallelogram: "Parallelogram",
  trapezoid: "Trapezoid",
  rhombus: "Rhombus",
  sector: "Sector",
  polygon: "Polygon",
};

const fmt = (v: number, d = 3) => {
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(d);
};

export function GeometryModule() {
  const [shape, setShape] = useState<Shape>("circle");

  // Circle
  const [cr, setCr] = useState(4);
  const [cx, setCx] = useState(0);
  const [cy, setCy] = useState(0);

  // Ellipse
  const [erx, setErx] = useState(5);
  const [ery, setEry] = useState(3);

  // Square
  const [sLen, setSLen] = useState(5);

  // Rectangle
  const [rW, setRW] = useState(7);
  const [rH, setRH] = useState(4);

  // Triangle (free vertices)
  const [ax, setAx] = useState(-3);
  const [ay, setAy] = useState(-2);
  const [bx, setBx] = useState(4);
  const [by, setBy] = useState(-2);
  const [tx, setTx] = useState(1);
  const [ty, setTy] = useState(4);

  // Right triangle (legs)
  const [legA, setLegA] = useState(4);
  const [legB, setLegB] = useState(3);

  // Parallelogram (base, side, angle deg)
  const [pBase, setPBase] = useState(6);
  const [pSide, setPSide] = useState(4);
  const [pAng, setPAng] = useState(70);

  // Trapezoid (a, b, h)
  const [trA, setTrA] = useState(8);
  const [trB, setTrB] = useState(4);
  const [trH, setTrH] = useState(4);

  // Rhombus (diagonals p, q)
  const [rhP, setRhP] = useState(8);
  const [rhQ, setRhQ] = useState(5);

  // Sector (radius, angle deg)
  const [secR, setSecR] = useState(5);
  const [secA, setSecA] = useState(110);

  // Regular polygon
  const [sides, setSides] = useState(6);
  const [pr, setPr] = useState(4);
  const [rot, setRot] = useState(0);

  // ─── Renderers ──────────────────────────────────────────────────────────
  function renderCircle() {
    const d = 2 * cr;
    const area = Math.PI * cr * cr;
    const circ = 2 * Math.PI * cr;
    const steps: SolutionStep[] = [
      {
        text: "Diameter is twice the radius.",
        formula: "d = 2r",
        substitution: `d = 2 × ${fmt(cr)}`,
        result: fmt(d),
      },
      {
        text: "Circumference uses C = 2πr.",
        formula: "C = 2πr",
        substitution: `C = 2 × π × ${fmt(cr)}`,
        result: fmt(circ),
      },
      {
        text: "Area uses A = πr².",
        formula: "A = π·r²",
        substitution: `A = π × ${fmt(cr)}²`,
        result: fmt(area),
      },
    ];
    return {
      plot: (
        <>
          <Circle2D cx={cx} cy={cy} r={cr} fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" opacity={0.18} strokeWidth={2.5} />
          <Line2D x1={cx} y1={cy} x2={cx + cr} y2={cy} color="hsl(var(--chart-2))" width={2} />
          <PointDot x={cx} y={cy} color="hsl(var(--chart-2))" label="O" />
          <PointDot x={cx + cr} y={cy} color="hsl(var(--chart-1))" />
          <Label x={cx + cr / 2} y={cy} dy={-6} anchor="middle">{`r = ${fmt(cr, 2)}`}</Label>
        </>
      ),
      insights: (
        <>
          <EditableStat label="Center x" value={cx} onChange={setCx} min={-999999} max={999999} step={0.1} accent="hsl(var(--chart-2))" />
          <EditableStat label="Center y" value={cy} onChange={setCy} min={-999999} max={999999} step={0.1} accent="hsl(var(--chart-2))" />
          <EditableStat label="Radius" value={cr} onChange={setCr} min={0.01} max={999999} step={0.05} accent="hsl(var(--chart-1))" />
          <EditableStat label="Diameter" value={d} onChange={(v) => setCr(v / 2)} min={0.02} max={999999} step={0.05} />
          <EditableStat label="Circumference" value={circ} onChange={(c) => setCr(c / (2 * Math.PI))} min={0.01} max={999999} step={0.1} />
          <EditableStat label="Area" value={area} onChange={(A) => A > 0 && setCr(Math.sqrt(A / Math.PI))} min={0.001} max={999999999} step={1} accent="hsl(var(--chart-1))" />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Radius" formula="r" value={cr} onChange={setCr} min={0.5} max={1000} step={0.05} color="hsl(var(--chart-1))" />
          <SliderControl label="Center x" formula="cx" value={cx} onChange={setCx} min={-1000} max={1000} step={0.1} />
          <SliderControl label="Center y" formula="cy" value={cy} onChange={setCy} min={-1000} max={1000} step={0.1} />
        </>
      ),
      steps,
    };
  }

  function renderEllipse() {
    const a = Math.max(erx, ery);
    const b = Math.min(erx, ery);
    const area = Math.PI * erx * ery;
    // Ramanujan's approximation for the perimeter
    const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
    const perim = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
    const c = Math.sqrt(Math.abs(a * a - b * b));
    const ecc = a > 0 ? c / a : 0;
    const steps: SolutionStep[] = [
      {
        text: "Identify the semi-major and semi-minor axes.",
        formula: "a = max(rx, ry),  b = min(rx, ry)",
        substitution: `a = ${fmt(a)},  b = ${fmt(b)}`,
      },
      {
        text: "Area of an ellipse.",
        formula: "A = π·a·b",
        substitution: `A = π × ${fmt(erx)} × ${fmt(ery)}`,
        result: fmt(area),
      },
      {
        text: "Perimeter (Ramanujan approximation).",
        formula: "P ≈ π(a+b)·(1 + 3h / (10 + √(4-3h))),  h = (a-b)²/(a+b)²",
        substitution: `h = ${fmt(h, 4)}`,
        result: fmt(perim),
      },
      {
        text: "Eccentricity measures how stretched the ellipse is (0 = circle).",
        formula: "e = √(a² - b²) / a",
        substitution: `e = √(${fmt(a * a)} - ${fmt(b * b)}) / ${fmt(a)}`,
        result: fmt(ecc, 4),
      },
    ];
    return {
      plot: (
        <>
          <Ellipse2D cx={0} cy={0} rx={erx} ry={ery} fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" opacity={0.2} strokeWidth={2.5} />
          <Line2D x1={-erx} y1={0} x2={erx} y2={0} color="hsl(var(--chart-1))" dashed />
          <Line2D x1={0} y1={-ery} x2={0} y2={ery} color="hsl(var(--chart-3))" dashed />
          <PointDot x={0} y={0} color="hsl(var(--foreground))" label="O" />
          <Label x={erx / 2} y={0} dy={-6}>{`a=${fmt(erx, 2)}`}</Label>
          <Label x={0} y={ery / 2} dy={-6} anchor="start">{`b=${fmt(ery, 2)}`}</Label>
          {a > b && (
            <>
              <PointDot x={c * (erx >= ery ? 1 : 0)} y={c * (erx >= ery ? 0 : 1)} color="hsl(var(--chart-4))" label="F₁" r={4} />
              <PointDot x={-c * (erx >= ery ? 1 : 0)} y={-c * (erx >= ery ? 0 : 1)} color="hsl(var(--chart-4))" label="F₂" r={4} />
            </>
          )}
        </>
      ),
      insights: (
        <>
          <EditableStat label="Semi-axis rx" value={erx} onChange={setErx} min={0.1} max={50} accent="hsl(var(--chart-1))" />
          <EditableStat label="Semi-axis ry" value={ery} onChange={setEry} min={0.1} max={50} accent="hsl(var(--chart-3))" />
          <Stat label="Area" value={fmt(area)} accent="hsl(var(--chart-2))" />
          <Stat label="Perimeter ≈" value={fmt(perim)} />
          <Stat label="Focal dist c" value={fmt(c)} />
          <Stat label="Eccentricity" value={fmt(ecc, 4)} />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Semi-axis rx" formula="rx" value={erx} onChange={setErx} min={0.5} max={9} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Semi-axis ry" formula="ry" value={ery} onChange={setEry} min={0.5} max={9} step={0.1} color="hsl(var(--chart-3))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            When <span className="font-mono">rx = ry</span>, the ellipse becomes a circle and eccentricity is 0.
          </div>
        </>
      ),
      steps,
    };
  }

  function renderSquare() {
    const s = sLen;
    const area = s * s;
    const perim = 4 * s;
    const diag = s * Math.SQRT2;
    const steps: SolutionStep[] = [
      { text: "Perimeter is the sum of all four equal sides.", formula: "P = 4s", substitution: `P = 4 × ${fmt(s)}`, result: fmt(perim) },
      { text: "Area is side squared.", formula: "A = s²", substitution: `A = ${fmt(s)}²`, result: fmt(area) },
      { text: "The diagonal uses the Pythagorean theorem on two equal legs.", formula: "d = s√2", substitution: `d = ${fmt(s)} × √2`, result: fmt(diag) },
    ];
    const half = s / 2;
    return {
      plot: (
        <>
          <Polygon points={[[-half, -half], [half, -half], [half, half], [-half, half]]}
            fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" strokeWidth={2.5} opacity={0.22} />
          <Line2D x1={-half} y1={-half} x2={half} y2={half} color="hsl(var(--chart-4))" dashed />
          <PointDot x={-half} y={-half} color="hsl(var(--chart-1))" label="A" />
          <PointDot x={half} y={-half} color="hsl(var(--chart-1))" label="B" />
          <PointDot x={half} y={half} color="hsl(var(--chart-1))" label="C" />
          <PointDot x={-half} y={half} color="hsl(var(--chart-1))" label="D" />
          <Label x={0} y={-half} dy={16}>{`s = ${fmt(s, 2)}`}</Label>
          <AngleArc vx={-half} vy={-half} ax={half} ay={-half} bx={-half} by={half} rightAngle />
        </>
      ),
      insights: (
        <>
          <EditableStat label="Side length" value={s} onChange={setSLen} min={0.1} max={50} accent="hsl(var(--chart-2))" />
          <EditableStat label="Perimeter" value={perim} onChange={(P) => setSLen(P / 4)} min={0.4} max={500} />
          <EditableStat label="Area" value={area} onChange={(A) => A > 0 && setSLen(Math.sqrt(A))} min={0.01} max={2500} accent="hsl(var(--chart-2))" />
          <Stat label="Diagonal" value={fmt(diag)} />
          <Stat label="Each angle" value="90°" />
        </>
      ),
      controls: (
        <SliderControl label="Side length" formula="s" value={s} onChange={setSLen} min={0.5} max={9} step={0.1} color="hsl(var(--chart-2))" />
      ),
      steps,
    };
  }

  function renderRectangle() {
    const w = rW, h = rH;
    const area = w * h;
    const perim = 2 * (w + h);
    const diag = Math.hypot(w, h);
    const steps: SolutionStep[] = [
      { text: "Perimeter is twice the sum of length and width.", formula: "P = 2(L + W)", substitution: `P = 2 × (${fmt(w)} + ${fmt(h)})`, result: fmt(perim) },
      { text: "Area is length times width.", formula: "A = L × W", substitution: `A = ${fmt(w)} × ${fmt(h)}`, result: fmt(area) },
      { text: "Diagonal uses the Pythagorean theorem.", formula: "d = √(L² + W²)", substitution: `d = √(${fmt(w * w)} + ${fmt(h * h)})`, result: fmt(diag) },
    ];
    const hw = w / 2, hh = h / 2;
    return {
      plot: (
        <>
          <Polygon points={[[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]}
            fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" strokeWidth={2.5} opacity={0.22} />
          <Line2D x1={-hw} y1={-hh} x2={hw} y2={hh} color="hsl(var(--chart-4))" dashed />
          <PointDot x={-hw} y={-hh} color="hsl(var(--chart-2))" label="A" />
          <PointDot x={hw} y={-hh} color="hsl(var(--chart-2))" label="B" />
          <PointDot x={hw} y={hh} color="hsl(var(--chart-2))" label="C" />
          <PointDot x={-hw} y={hh} color="hsl(var(--chart-2))" label="D" />
          <Label x={0} y={-hh} dy={16}>{`L = ${fmt(w, 2)}`}</Label>
          <Label x={hw} y={0} dy={-4} anchor="start">{` W = ${fmt(h, 2)}`}</Label>
          <AngleArc vx={-hw} vy={-hh} ax={hw} ay={-hh} bx={-hw} by={hh} rightAngle />
        </>
      ),
      insights: (
        <>
          <EditableStat label="Length L" value={w} onChange={setRW} min={0.1} max={50} accent="hsl(var(--chart-1))" />
          <EditableStat label="Width W" value={h} onChange={setRH} min={0.1} max={50} accent="hsl(var(--chart-3))" />
          <EditableStat label="Perimeter" value={perim} onChange={(P) => setRW(Math.max(0.1, P / 2 - h))} min={0.4} max={500} hint="Adjusts L while keeping W" />
          <EditableStat label="Area" value={area} onChange={(A) => A > 0 && setRW(A / h)} min={0.01} max={2500} accent="hsl(var(--chart-1))" hint="Adjusts L while keeping W" />
          <Stat label="Diagonal" value={fmt(diag)} />
          <Stat label="Each angle" value="90°" />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Length" formula="L" value={w} onChange={setRW} min={0.5} max={9} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Width" formula="W" value={h} onChange={setRH} min={0.5} max={9} step={0.1} color="hsl(var(--chart-3))" />
        </>
      ),
      steps,
    };
  }

  function renderTriangle() {
    const sideAB = Math.hypot(bx - ax, by - ay);
    const sideBC = Math.hypot(tx - bx, ty - by);
    const sideCA = Math.hypot(ax - tx, ay - ty);
    const perim = sideAB + sideBC + sideCA;
    const area = Math.abs((ax * (by - ty) + bx * (ty - ay) + tx * (ay - by)) / 2);
    const angA = Math.acos(
      Math.min(1, Math.max(-1, (sideAB ** 2 + sideCA ** 2 - sideBC ** 2) / (2 * sideAB * sideCA)))
    );
    const angB = Math.acos(
      Math.min(1, Math.max(-1, (sideAB ** 2 + sideBC ** 2 - sideCA ** 2) / (2 * sideAB * sideBC)))
    );
    const angC = Math.PI - angA - angB;
    const toDeg = (r: number) => (r * 180) / Math.PI;
    const s = perim / 2;
    const heron = Math.sqrt(Math.max(0, s * (s - sideAB) * (s - sideBC) * (s - sideCA)));
    const steps: SolutionStep[] = [
      {
        text: "Find the lengths of all three sides with the distance formula.",
        formula: "|PQ| = √((x₂-x₁)² + (y₂-y₁)²)",
        substitution: `AB=${fmt(sideAB)},  BC=${fmt(sideBC)},  CA=${fmt(sideCA)}`,
      },
      {
        text: "Add them up to get the perimeter.",
        formula: "P = AB + BC + CA",
        result: fmt(perim),
      },
      {
        text: "Use Heron's formula with semi-perimeter s = P/2.",
        formula: "A = √(s(s-a)(s-b)(s-c))",
        substitution: `s = ${fmt(s)}`,
        result: fmt(heron),
      },
      {
        text: "Cross-check using the shoelace (coordinate) formula.",
        formula: "A = ½|x_A(y_B - y_C) + x_B(y_C - y_A) + x_C(y_A - y_B)|",
        result: fmt(area),
      },
      {
        text: "Find each angle from the Law of Cosines.",
        formula: "cos A = (b² + c² - a²) / (2bc)",
        substitution: `A = ${fmt(toDeg(angA), 2)}°,  B = ${fmt(toDeg(angB), 2)}°,  C = ${fmt(toDeg(angC), 2)}°`,
        result: `${fmt(toDeg(angA) + toDeg(angB) + toDeg(angC), 2)}° (always 180°)`,
      },
    ];
    return {
      plot: (
        <>
          <Polygon points={[[ax, ay], [bx, by], [tx, ty]]} fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" strokeWidth={2.5} opacity={0.22} />
          <AngleArc vx={ax} vy={ay} ax={bx} ay={by} bx={tx} by={ty} label={`${fmt(toDeg(angA), 1)}°`} />
          <AngleArc vx={bx} vy={by} ax={tx} ay={ty} bx={ax} by={ay} label={`${fmt(toDeg(angB), 1)}°`} />
          <AngleArc vx={tx} vy={ty} ax={ax} ay={ay} bx={bx} by={by} label={`${fmt(toDeg(angC), 1)}°`} />
          <PointDot x={ax} y={ay} color="hsl(var(--chart-1))" label="A" />
          <PointDot x={bx} y={by} color="hsl(var(--chart-3))" label="B" />
          <PointDot x={tx} y={ty} color="hsl(var(--chart-4))" label="C" />
        </>
      ),
      insights: (
        <>
          <EditableStat label="Ax" value={ax} onChange={setAx} min={-100} max={100} accent="hsl(var(--chart-1))" />
          <EditableStat label="Ay" value={ay} onChange={setAy} min={-100} max={100} accent="hsl(var(--chart-1))" />
          <EditableStat label="Bx" value={bx} onChange={setBx} min={-100} max={100} accent="hsl(var(--chart-3))" />
          <EditableStat label="By" value={by} onChange={setBy} min={-100} max={100} accent="hsl(var(--chart-3))" />
          <EditableStat label="Cx" value={tx} onChange={setTx} min={-100} max={100} accent="hsl(var(--chart-4))" />
          <EditableStat label="Cy" value={ty} onChange={setTy} min={-100} max={100} accent="hsl(var(--chart-4))" />
          <Stat label="Side AB (c)" value={fmt(sideAB)} />
          <Stat label="Side BC (a)" value={fmt(sideBC)} />
          <Stat label="Side CA (b)" value={fmt(sideCA)} />
          <Stat label="Perimeter" value={fmt(perim)} accent="hsl(var(--chart-2))" />
          <Stat label="Area (Shoelace)" value={fmt(area)} accent="hsl(var(--chart-1))" />
          <Stat label="Area (Heron)" value={fmt(heron)} />
          <Stat label="Angle A" value={`${fmt(toDeg(angA), 2)}°`} />
          <Stat label="Angle B" value={`${fmt(toDeg(angB), 2)}°`} />
          <Stat label="Angle C" value={`${fmt(toDeg(angC), 2)}°`} />
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
      steps,
    };
  }

  function renderRightTriangle() {
    const a = legA, b = legB;
    const hyp = Math.hypot(a, b);
    const area = (a * b) / 2;
    const perim = a + b + hyp;
    const angA = Math.atan2(b, a); // angle at vertex (a,0): opposite leg b
    const angB = Math.atan2(a, b);
    const toDeg = (r: number) => (r * 180) / Math.PI;
    const steps: SolutionStep[] = [
      { text: "The hypotenuse uses the Pythagorean theorem.", formula: "c = √(a² + b²)", substitution: `c = √(${fmt(a)}² + ${fmt(b)}²)`, result: fmt(hyp) },
      { text: "Area is half the product of the legs.", formula: "A = ½·a·b", substitution: `A = ½ × ${fmt(a)} × ${fmt(b)}`, result: fmt(area) },
      { text: "Perimeter sums all three sides.", formula: "P = a + b + c", result: fmt(perim) },
      { text: "Acute angles are found using basic trig.", formula: "tan(α) = opposite / adjacent", substitution: `α = atan(${fmt(b)}/${fmt(a)}),  β = atan(${fmt(a)}/${fmt(b)})`, result: `${fmt(toDeg(angA), 2)}° + ${fmt(toDeg(angB), 2)}° + 90° = 180°` },
    ];
    return {
      plot: (
        <>
          <Polygon points={[[0, 0], [a, 0], [0, b]]} fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" strokeWidth={2.5} opacity={0.22} />
          <AngleArc vx={0} vy={0} ax={a} ay={0} bx={0} by={b} rightAngle />
          <AngleArc vx={a} vy={0} ax={0} ay={0} bx={0} by={b} label={`${fmt(toDeg(angA), 1)}°`} />
          <AngleArc vx={0} vy={b} ax={0} ay={0} bx={a} by={0} label={`${fmt(toDeg(angB), 1)}°`} />
          <PointDot x={0} y={0} color="hsl(var(--chart-1))" label="C" />
          <PointDot x={a} y={0} color="hsl(var(--chart-2))" label="A" />
          <PointDot x={0} y={b} color="hsl(var(--chart-4))" label="B" />
          <Label x={a / 2} y={0} dy={16}>{`a = ${fmt(a, 2)}`}</Label>
          <Label x={0} y={b / 2} dy={-4} anchor="end">{`b = ${fmt(b, 2)} `}</Label>
          <Label x={a / 2} y={b / 2} dy={-6}>{`c = ${fmt(hyp, 2)}`}</Label>
        </>
      ),
      insights: (
        <>
          <EditableStat label="Leg a" value={a} onChange={setLegA} min={0.1} max={50} accent="hsl(var(--chart-2))" />
          <EditableStat label="Leg b" value={b} onChange={setLegB} min={0.1} max={50} accent="hsl(var(--chart-4))" />
          <EditableStat label="Hypotenuse c" value={hyp} onChange={(c) => c > a && setLegB(Math.sqrt(c * c - a * a))} min={0.1} max={500} hint="Adjusts leg b" />
          <Stat label="Area" value={fmt(area)} accent="hsl(var(--chart-3))" />
          <Stat label="Perimeter" value={fmt(perim)} />
          <Stat label="Angle α" value={`${fmt(toDeg(angA), 2)}°`} />
          <Stat label="Angle β" value={`${fmt(toDeg(angB), 2)}°`} />
          <Stat label="Right angle" value="90°" />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Leg a" formula="a" value={a} onChange={setLegA} min={0.5} max={9} step={0.1} color="hsl(var(--chart-2))" />
          <SliderControl label="Leg b" formula="b" value={b} onChange={setLegB} min={0.5} max={9} step={0.1} color="hsl(var(--chart-4))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Try <span className="font-mono">a=3, b=4</span> to see the classic 3-4-5 triple.
          </div>
        </>
      ),
      steps,
    };
  }

  function renderParallelogram() {
    const base = pBase, side = pSide;
    const θ = (pAng * Math.PI) / 180;
    const height = side * Math.sin(θ);
    const area = base * height;
    const perim = 2 * (base + side);
    // Diagonals via law of cosines
    const d1 = Math.sqrt(base * base + side * side - 2 * base * side * Math.cos(Math.PI - θ));
    const d2 = Math.sqrt(base * base + side * side - 2 * base * side * Math.cos(θ));
    const steps: SolutionStep[] = [
      { text: "Find the perpendicular height from the slanted side.", formula: "h = a·sin(θ)", substitution: `h = ${fmt(side)} × sin(${fmt(pAng, 1)}°)`, result: fmt(height) },
      { text: "Area is base times height.", formula: "A = b·h", substitution: `A = ${fmt(base)} × ${fmt(height)}`, result: fmt(area) },
      { text: "Perimeter sums all four sides (two pairs).", formula: "P = 2(b + a)", substitution: `P = 2 × (${fmt(base)} + ${fmt(side)})`, result: fmt(perim) },
      { text: "Diagonals via the Law of Cosines.", formula: "d² = a² + b² − 2ab·cos(angle)", substitution: `d₁ = ${fmt(d1)},  d₂ = ${fmt(d2)}` },
      { text: "Adjacent angles in a parallelogram are supplementary.", formula: "θ + φ = 180°", substitution: `${fmt(pAng, 1)}° + ${fmt(180 - pAng, 1)}° = 180°` },
    ];
    const dx = side * Math.cos(θ);
    const dy = side * Math.sin(θ);
    const A: [number, number] = [-base / 2, -dy / 2];
    const B: [number, number] = [base / 2, -dy / 2];
    const C: [number, number] = [base / 2 + dx, dy / 2];
    const D: [number, number] = [-base / 2 + dx, dy / 2];
    return {
      plot: (
        <>
          <Polygon points={[A, B, C, D]} fill="hsl(var(--chart-4))" stroke="hsl(var(--chart-4))" strokeWidth={2.5} opacity={0.22} />
          <Line2D x1={A[0]} y1={A[1]} x2={A[0]} y2={A[1] + height} color="hsl(var(--muted-foreground))" dashed width={1.5} />
          <AngleArc vx={A[0]} vy={A[1]} ax={B[0]} ay={B[1]} bx={D[0]} by={D[1]} label={`${fmt(pAng, 1)}°`} />
          <AngleArc vx={B[0]} vy={B[1]} ax={A[0]} ay={A[1]} bx={C[0]} by={C[1]} label={`${fmt(180 - pAng, 1)}°`} />
          <PointDot x={A[0]} y={A[1]} color="hsl(var(--chart-1))" label="A" />
          <PointDot x={B[0]} y={B[1]} color="hsl(var(--chart-2))" label="B" />
          <PointDot x={C[0]} y={C[1]} color="hsl(var(--chart-3))" label="C" />
          <PointDot x={D[0]} y={D[1]} color="hsl(var(--chart-1))" label="D" />
          <Label x={0} y={A[1]} dy={16}>{`b = ${fmt(base, 2)}`}</Label>
          <Label x={(A[0] + D[0]) / 2 - 0.3} y={(A[1] + D[1]) / 2} anchor="end">{`a = ${fmt(side, 2)} `}</Label>
        </>
      ),
      insights: (
        <>
          <EditableStat label="Base b" value={base} onChange={setPBase} min={0.1} max={50} accent="hsl(var(--chart-1))" />
          <EditableStat label="Side a" value={side} onChange={setPSide} min={0.1} max={50} accent="hsl(var(--chart-3))" />
          <EditableStat label="Angle θ" value={pAng} onChange={(v) => setPAng(Math.min(179, Math.max(1, v)))} min={1} max={179} suffix="°" accent="hsl(var(--chart-4))" />
          <Stat label="Height" value={fmt(height)} />
          <Stat label="Area" value={fmt(area)} accent="hsl(var(--chart-4))" />
          <Stat label="Perimeter" value={fmt(perim)} />
          <Stat label="Diagonal d₁" value={fmt(d1)} />
          <Stat label="Diagonal d₂" value={fmt(d2)} />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Base" formula="b" value={base} onChange={setPBase} min={1} max={9} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Side" formula="a" value={side} onChange={setPSide} min={0.5} max={6} step={0.1} color="hsl(var(--chart-3))" />
          <SliderControl label="Angle" formula="θ°" value={pAng} onChange={setPAng} min={20} max={160} step={1} color="hsl(var(--chart-4))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Set <span className="font-mono">θ = 90°</span> to recover a rectangle.
          </div>
        </>
      ),
      steps,
    };
  }

  function renderTrapezoid() {
    const a = trA, b = trB, h = trH;
    const area = ((a + b) / 2) * h;
    // assume isosceles for the diagram & legs
    const leg = Math.sqrt(((a - b) / 2) ** 2 + h * h);
    const perim = a + b + 2 * leg;
    const median = (a + b) / 2;
    const steps: SolutionStep[] = [
      { text: "The midsegment is the average of the two bases.", formula: "m = (a + b) / 2", substitution: `m = (${fmt(a)} + ${fmt(b)}) / 2`, result: fmt(median) },
      { text: "Area equals the midsegment times the height.", formula: "A = ½·(a + b)·h", substitution: `A = ½ × (${fmt(a)} + ${fmt(b)}) × ${fmt(h)}`, result: fmt(area) },
      { text: "For an isosceles trapezoid, each leg uses Pythagoras on the half-base difference.", formula: "ℓ = √( ((a-b)/2)² + h² )", substitution: `ℓ = √(${fmt(((a - b) / 2) ** 2)} + ${fmt(h * h)})`, result: fmt(leg) },
      { text: "Perimeter sums all four sides.", formula: "P = a + b + 2ℓ", result: fmt(perim) },
    ];
    const A: [number, number] = [-a / 2, -h / 2];
    const B: [number, number] = [a / 2, -h / 2];
    const C: [number, number] = [b / 2, h / 2];
    const D: [number, number] = [-b / 2, h / 2];
    const angA = Math.atan2(C[1] - B[1], C[0] - B[0]);
    return {
      plot: (
        <>
          <Polygon points={[A, B, C, D]} fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" strokeWidth={2.5} opacity={0.22} />
          <Line2D x1={A[0]} y1={A[1]} x2={A[0]} y2={A[1] + h} color="hsl(var(--muted-foreground))" dashed width={1.5} />
          <Line2D x1={-Math.max(a, b) / 2} y1={0} x2={Math.max(a, b) / 2} y2={0} color="hsl(var(--chart-2))" dashed />
          <AngleArc vx={B[0]} vy={B[1]} ax={A[0]} ay={A[1]} bx={C[0]} by={C[1]} label={`${fmt(((Math.PI - angA) * 180) / Math.PI, 1)}°`} />
          <AngleArc vx={A[0]} vy={A[1]} ax={D[0]} ay={D[1]} bx={B[0]} by={B[1]} label={`${fmt(((Math.PI - angA) * 180) / Math.PI, 1)}°`} />
          <PointDot x={A[0]} y={A[1]} color="hsl(var(--chart-3))" label="A" />
          <PointDot x={B[0]} y={B[1]} color="hsl(var(--chart-3))" label="B" />
          <PointDot x={C[0]} y={C[1]} color="hsl(var(--chart-4))" label="C" />
          <PointDot x={D[0]} y={D[1]} color="hsl(var(--chart-4))" label="D" />
          <Label x={0} y={A[1]} dy={16}>{`a = ${fmt(a, 2)}`}</Label>
          <Label x={0} y={C[1]} dy={-6}>{`b = ${fmt(b, 2)}`}</Label>
          <Label x={A[0]} y={0} dy={4} anchor="end">{`h = ${fmt(h, 2)} `}</Label>
        </>
      ),
      insights: (
        <>
          <EditableStat label="Base a" value={a} onChange={setTrA} min={0.1} max={50} accent="hsl(var(--chart-3))" />
          <EditableStat label="Base b" value={b} onChange={setTrB} min={0.1} max={50} accent="hsl(var(--chart-4))" />
          <EditableStat label="Height h" value={h} onChange={setTrH} min={0.1} max={50} />
          <Stat label="Midsegment" value={fmt(median)} />
          <Stat label="Area" value={fmt(area)} accent="hsl(var(--chart-1))" />
          <Stat label="Leg" value={fmt(leg)} />
          <Stat label="Perimeter" value={fmt(perim)} />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Base a" formula="a" value={a} onChange={setTrA} min={1} max={9} step={0.1} color="hsl(var(--chart-3))" />
          <SliderControl label="Base b" formula="b" value={b} onChange={setTrB} min={0.5} max={9} step={0.1} color="hsl(var(--chart-4))" />
          <SliderControl label="Height" formula="h" value={h} onChange={setTrH} min={0.5} max={8} step={0.1} />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            The diagram shows an isosceles trapezoid (the area formula works for any trapezoid).
          </div>
        </>
      ),
      steps,
    };
  }

  function renderRhombus() {
    const p = rhP, q = rhQ;
    const side = Math.hypot(p / 2, q / 2);
    const area = (p * q) / 2;
    const perim = 4 * side;
    const θ1 = 2 * Math.atan2(q / 2, p / 2);
    const θ2 = Math.PI - θ1;
    const toDeg = (r: number) => (r * 180) / Math.PI;
    const steps: SolutionStep[] = [
      { text: "All four sides are equal. Use Pythagoras on the diagonal halves.", formula: "s = √( (p/2)² + (q/2)² )", substitution: `s = √(${fmt((p / 2) ** 2)} + ${fmt((q / 2) ** 2)})`, result: fmt(side) },
      { text: "Perimeter is 4 × side.", formula: "P = 4s", result: fmt(perim) },
      { text: "Area uses the diagonals — they meet at right angles.", formula: "A = ½·p·q", substitution: `A = ½ × ${fmt(p)} × ${fmt(q)}`, result: fmt(area) },
      { text: "Each angle is found from the diagonal arms.", formula: "θ = 2·atan(q/p)", substitution: `θ₁ = ${fmt(toDeg(θ1), 2)}°,  θ₂ = ${fmt(toDeg(θ2), 2)}°`, result: `${fmt(toDeg(θ1) + toDeg(θ2), 2)}° (supplementary)` },
    ];
    const A: [number, number] = [-p / 2, 0];
    const B: [number, number] = [0, -q / 2];
    const C: [number, number] = [p / 2, 0];
    const D: [number, number] = [0, q / 2];
    return {
      plot: (
        <>
          <Polygon points={[A, B, C, D]} fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" strokeWidth={2.5} opacity={0.22} />
          <Line2D x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} color="hsl(var(--chart-1))" dashed />
          <Line2D x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} color="hsl(var(--chart-2))" dashed />
          <AngleArc vx={0} vy={0} ax={p / 2} ay={0} bx={0} by={q / 2} rightAngle />
          <AngleArc vx={A[0]} vy={A[1]} ax={B[0]} ay={B[1]} bx={D[0]} by={D[1]} label={`${fmt(toDeg(θ1), 1)}°`} />
          <AngleArc vx={B[0]} vy={B[1]} ax={C[0]} ay={C[1]} bx={A[0]} by={A[1]} label={`${fmt(toDeg(θ2), 1)}°`} />
          <PointDot x={A[0]} y={A[1]} color="hsl(var(--chart-1))" label="A" />
          <PointDot x={B[0]} y={B[1]} color="hsl(var(--chart-2))" label="B" />
          <PointDot x={C[0]} y={C[1]} color="hsl(var(--chart-1))" label="C" />
          <PointDot x={D[0]} y={D[1]} color="hsl(var(--chart-2))" label="D" />
          <Label x={p / 4} y={0} dy={-6}>{`p = ${fmt(p, 2)}`}</Label>
          <Label x={0} y={q / 4} anchor="start">{` q = ${fmt(q, 2)}`}</Label>
        </>
      ),
      insights: (
        <>
          <EditableStat label="Diagonal p" value={p} onChange={setRhP} min={0.1} max={50} accent="hsl(var(--chart-1))" />
          <EditableStat label="Diagonal q" value={q} onChange={setRhQ} min={0.1} max={50} accent="hsl(var(--chart-2))" />
          <Stat label="Side length" value={fmt(side)} />
          <Stat label="Perimeter" value={fmt(perim)} />
          <Stat label="Area" value={fmt(area)} accent="hsl(var(--chart-3))" />
          <Stat label="Angle θ₁" value={`${fmt(toDeg(θ1), 2)}°`} />
          <Stat label="Angle θ₂" value={`${fmt(toDeg(θ2), 2)}°`} />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Diagonal p" formula="p" value={p} onChange={setRhP} min={1} max={9} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Diagonal q" formula="q" value={q} onChange={setRhQ} min={1} max={9} step={0.1} color="hsl(var(--chart-2))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Equal diagonals → square. Diagonals always meet at 90°.
          </div>
        </>
      ),
      steps,
    };
  }

  function renderSector() {
    const r = secR;
    const θdeg = secA;
    const θ = (θdeg * Math.PI) / 180;
    const arcLen = r * θ;
    const area = 0.5 * r * r * θ;
    const chord = 2 * r * Math.sin(θ / 2);
    const perim = 2 * r + arcLen;
    const steps: SolutionStep[] = [
      { text: "Convert the central angle to radians.", formula: "θ_rad = θ° × π / 180", substitution: `θ = ${fmt(θdeg, 1)}° × π / 180`, result: `${fmt(θ, 4)} rad` },
      { text: "Arc length is radius times angle (in radians).", formula: "L = r·θ", substitution: `L = ${fmt(r)} × ${fmt(θ, 4)}`, result: fmt(arcLen) },
      { text: "Sector area scales with the angle.", formula: "A = ½·r²·θ", substitution: `A = ½ × ${fmt(r)}² × ${fmt(θ, 4)}`, result: fmt(area) },
      { text: "Chord uses the isosceles-triangle identity.", formula: "c = 2r·sin(θ/2)", substitution: `c = 2 × ${fmt(r)} × sin(${fmt(θdeg / 2, 1)}°)`, result: fmt(chord) },
      { text: "Sector perimeter = arc + 2 radii.", formula: "P = 2r + L", result: fmt(perim) },
    ];
    return {
      plot: (
        <>
          <Circle2D cx={0} cy={0} r={r} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.45} />
          <Sector2D cx={0} cy={0} r={r} startAngle={-θdeg / 2} endAngle={θdeg / 2}
            fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" strokeWidth={2.5} opacity={0.25} />
          <AngleArc
            vx={0} vy={0}
            ax={Math.cos((-θ) / 2)} ay={Math.sin((-θ) / 2)}
            bx={Math.cos(θ / 2)} by={Math.sin(θ / 2)}
            label={`${fmt(θdeg, 1)}°`} radiusPx={28}
          />
          <PointDot x={0} y={0} color="hsl(var(--foreground))" label="O" />
          <Label x={r * Math.cos(θ / 2) * 0.5} y={r * Math.sin(θ / 2) * 0.5} dy={-4}>{`r=${fmt(r, 2)}`}</Label>
        </>
      ),
      insights: (
        <>
          <EditableStat label="Radius r" value={r} onChange={setSecR} min={0.1} max={50} accent="hsl(var(--chart-2))" />
          <EditableStat label="Angle θ" value={θdeg} onChange={(v) => setSecA(Math.min(360, Math.max(1, v)))} min={1} max={360} suffix="°" accent="hsl(var(--chart-4))" />
          <Stat label="Arc length" value={fmt(arcLen)} />
          <Stat label="Chord" value={fmt(chord)} />
          <Stat label="Sector area" value={fmt(area)} accent="hsl(var(--chart-2))" />
          <Stat label="Perimeter" value={fmt(perim)} />
          <Stat label="Fraction of circle" value={`${fmt((θdeg / 360) * 100, 2)}%`} />
        </>
      ),
      controls: (
        <>
          <SliderControl label="Radius" formula="r" value={r} onChange={setSecR} min={0.5} max={9} step={0.1} color="hsl(var(--chart-2))" />
          <SliderControl label="Angle" formula="θ°" value={θdeg} onChange={setSecA} min={5} max={355} step={1} color="hsl(var(--chart-4))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            θ = 360° gives the whole disk; θ = 180° gives a semicircle.
          </div>
        </>
      ),
      steps,
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
    const exteriorAngle = 180 - interiorAngle;
    const steps: SolutionStep[] = [
      { text: "Find the side length from the circumscribed radius.", formula: "s = 2r·sin(π/n)", substitution: `s = 2 × ${fmt(pr)} × sin(π/${n})`, result: fmt(sideLen) },
      { text: "Apothem is the perpendicular distance from center to a side.", formula: "a = r·cos(π/n)", substitution: `a = ${fmt(pr)} × cos(π/${n})`, result: fmt(apothem) },
      { text: "Perimeter is n times the side length.", formula: "P = n·s", substitution: `P = ${n} × ${fmt(sideLen)}`, result: fmt(perim) },
      { text: "Area uses ½·perimeter·apothem.", formula: "A = ½·P·a", substitution: `A = ½ × ${fmt(perim)} × ${fmt(apothem)}`, result: fmt(area) },
      { text: "Interior angle from the (n−2)·180° rule.", formula: "θ_int = (n−2)·180° / n", substitution: `θ_int = (${n}−2) × 180 / ${n}`, result: `${fmt(interiorAngle, 2)}°` },
    ];
    // Pick a couple of vertices to mark the interior angle
    const v0 = pts[0]!, vPrev = pts[n - 1]!, vNext = pts[1]!;
    return {
      plot: (
        <>
          <Circle2D cx={0} cy={0} r={pr} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.5} />
          <Polygon points={pts} fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" strokeWidth={2.5} opacity={0.22} />
          <PointDot x={0} y={0} color="hsl(var(--chart-2))" label="O" />
          <Line2D x1={0} y1={0} x2={pts[0]![0]} y2={pts[0]![1]} color="hsl(var(--chart-2))" />
          <AngleArc vx={v0[0]} vy={v0[1]} ax={vPrev[0]} ay={vPrev[1]} bx={vNext[0]} by={vNext[1]} label={`${fmt(interiorAngle, 1)}°`} />
        </>
      ),
      insights: (
        <>
          <EditableStat label="Sides (n)" value={sides} onChange={(v) => setSides(Math.max(3, Math.min(200, Math.round(v))))} min={3} max={200} format={(v) => `${Math.round(v)}`} accent="hsl(var(--chart-3))" />
          <EditableStat label="Radius (r)" value={pr} onChange={setPr} min={0.01} max={100} />
          <EditableStat label="Rotation (θ)" value={rot} onChange={setRot} min={-360} max={360} suffix="°" />
          <Stat label="Side length" value={fmt(sideLen)} />
          <Stat label="Perimeter" value={fmt(perim)} />
          <Stat label="Apothem" value={fmt(apothem)} />
          <Stat label="Area" value={fmt(area)} accent="hsl(var(--chart-3))" />
          <Stat label="Interior angle" value={`${fmt(interiorAngle, 2)}°`} />
          <Stat label="Exterior angle" value={`${fmt(exteriorAngle, 2)}°`} />
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
      steps,
    };
  }

  const cur = useMemo(() => {
    switch (shape) {
      case "circle": return renderCircle();
      case "ellipse": return renderEllipse();
      case "square": return renderSquare();
      case "rectangle": return renderRectangle();
      case "triangle": return renderTriangle();
      case "rightTriangle": return renderRightTriangle();
      case "parallelogram": return renderParallelogram();
      case "trapezoid": return renderTrapezoid();
      case "rhombus": return renderRhombus();
      case "sector": return renderSector();
      case "polygon": return renderPolygon();
      default: return renderCircle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shape, cr, cx, cy, erx, ery, sLen, rW, rH,
    ax, ay, bx, by, tx, ty, legA, legB,
    pBase, pSide, pAng, trA, trB, trH, rhP, rhQ, secR, secA, sides, pr, rot,
  ]);

  const shapeKeys = Object.keys(SHAPE_LABELS) as Shape[];

  // Fixed range for all geometry shapes
  const range = useMemo(() => {
    return { xMin: -15, xMax: 15, yMin: -15, yMax: 15 };
  }, []);

  return (
    <ModuleShell
      title="Geometry"
      description="Manipulate eleven different geometric figures and watch every measurement, angle, and formula update live. Each shape comes with a textbook-style step-by-step derivation, drag-pan + scroll-zoom, and a fullscreen view of the diagram."
      formula={<span>Live formulas update with every change</span>}
      controls={
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shape</label>
            <div className="grid grid-cols-2 gap-2">
              {shapeKeys.map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors text-left ${
                    shape === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover-elevate"
                  }`}
                >
                  {SHAPE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t space-y-5">{cur.controls}</div>
        </>
      }
      plot={
        <Plot
          height={520}
          range={range}
          interactive
        >
          {cur.plot}
        </Plot>
      }
      insights={
        <>
          <InsightCard>{cur.insights}</InsightCard>
          <SolutionSteps steps={cur.steps} />
        </>
      }
    />
  );
}
