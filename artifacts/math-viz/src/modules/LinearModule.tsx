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

export function LinearModule() {
  const [m, setM] = useState(1);
  const [b, setB] = useState(0);

  const fn = (x: number) => m * x + b;
  const xIntercept = m !== 0 ? -b / m : NaN;
  const angleDeg = (Math.atan(m) * 180) / Math.PI;

  const steps: SolutionStep[] = useMemo(() => {
    const arr: SolutionStep[] = [
      {
        text: "Start from the slope-intercept form of a line.",
        formula: "y = m·x + b",
      },
      {
        text: "Substitute the current slope and intercept.",
        substitution: `y = ${m.toFixed(2)}·x + (${b.toFixed(2)})`,
      },
      {
        text: "The y-intercept is the value of y when x = 0.",
        formula: "y(0) = b",
        substitution: `y(0) = ${b.toFixed(3)}`,
        result: `b = ${b.toFixed(3)}`,
      },
    ];
    if (m !== 0) {
      arr.push({
        text: "The x-intercept is the value of x where y = 0. Set 0 = m·x + b and solve.",
        formula: "x = −b / m",
        substitution: `x = −(${b.toFixed(2)}) / ${m.toFixed(2)}`,
        result: `x = ${xIntercept.toFixed(3)}`,
      });
    } else {
      arr.push({
        text: "When the slope is zero the line is horizontal — it never crosses the x-axis (unless b is also 0).",
      });
    }
    arr.push({
      text: "The slope is the tangent of the angle the line makes with the x-axis.",
      formula: "θ = arctan(m)",
      substitution: `θ = arctan(${m.toFixed(3)})`,
      result: `θ ≈ ${angleDeg.toFixed(2)}°`,
    });
    return arr;
  }, [m, b, xIntercept, angleDeg]);

  return (
    <ModuleShell
      title="Linear Functions"
      description="Move the sliders for slope (m) and y-intercept (b) and watch the line transform in real time. The slope controls how steep the line is, while the intercept slides it up and down."
      formula={<span>y = <span className="text-[hsl(var(--chart-1))]">m</span>x + <span className="text-[hsl(var(--accent))]">b</span></span>}
      controls={
        <>
          <SliderControl label="Slope" formula="m" value={m} onChange={setM} min={-5} max={5} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Y-Intercept" formula="b" value={b} onChange={setB} min={-8} max={8} step={0.1} color="hsl(var(--accent))" />
          <div className="text-xs text-muted-foreground pt-3 border-t">
            Try setting <span className="font-mono">m = 0</span> for a horizontal line, or <span className="font-mono">b = 0</span> to make the line pass through the origin. Hover any number and scroll to nudge.
          </div>
        </>
      }
      plot={
        <Plot height={460} interactive>
          <FunctionCurve fn={fn} color="hsl(var(--chart-1))" strokeWidth={3} />
          <PointDot x={0} y={b} color="hsl(var(--accent))" label={`y-int (0, ${b.toFixed(2)})`} />
          {Number.isFinite(xIntercept) && Math.abs(xIntercept) <= 10 && (
            <PointDot x={xIntercept} y={0} color="hsl(var(--chart-3))" label={`x-int (${xIntercept.toFixed(2)}, 0)`} />
          )}
          <VLine x={0} dashed />
          <HLine y={0} dashed />
          <Label x={9} y={fn(9)} dy={-8} anchor="end">y = mx + b</Label>
        </Plot>
      }
      insights={
        <InsightCard>
          <Stat label="Equation" value={`y = ${m.toFixed(2)}x + ${b.toFixed(2)}`} accent="hsl(var(--chart-1))" />
          <EditableStat
            label="Slope (m)"
            value={m}
            onChange={setM}
            min={-50}
            max={50}
            step={0.1}
            format={(v) => v.toFixed(3)}
            hint="Click to type · scroll to nudge"
          />
          <EditableStat
            label="Angle with x-axis"
            value={angleDeg}
            onChange={(deg) => setM(Math.tan((deg * Math.PI) / 180))}
            min={-89}
            max={89}
            step={1}
            suffix="°"
            hint="Type an angle; the slope updates"
          />
          <EditableStat
            label="Y-Intercept (b)"
            value={b}
            onChange={setB}
            min={-100}
            max={100}
            step={0.1}
            accent="hsl(var(--accent))"
            hint="Click to type · scroll to nudge"
          />
          <EditableStat
            label="X-Intercept"
            value={Number.isFinite(xIntercept) ? xIntercept : 0}
            onChange={(xi) => {
              if (m !== 0) setB(-m * xi);
            }}
            step={0.1}
            accent="hsl(var(--chart-3))"
            hint={m === 0 ? "Set a non-zero slope first" : "Type a new x-intercept; b updates"}
          />
          <Stat label="Δy / Δx" value={`${m.toFixed(2)} / 1`} />
        </InsightCard>
      }
      extras={
        <>
          <VariableSolver
            title="Solve y = m·x + b for any variable"
            def={{
              vars: [
                { symbol: "m", label: "slope", color: "hsl(var(--chart-1))" },
                { symbol: "b", label: "y-intercept", color: "hsl(var(--accent))" },
                { symbol: "x", label: "input", color: "hsl(var(--chart-3))" },
                { symbol: "y", label: "output", color: "hsl(var(--chart-2))" },
              ],
              solvers: {
                y: { formula: "y = m·x + b", compute: (k) => k.m * k.x + k.b },
                x: { formula: "x = (y − b) / m", compute: (k) => (k.y - k.b) / k.m },
                m: { formula: "m = (y − b) / x", compute: (k) => (k.y - k.b) / k.x },
                b: { formula: "b = y − m·x", compute: (k) => k.y - k.m * k.x },
              },
            }}
            initial={{ m, b, x: 1, y: m * 1 + b }}
            onApply={(out) => {
              if (Number.isFinite(out.m)) setM(out.m);
              if (Number.isFinite(out.b)) setB(out.b);
            }}
          />
          <SolutionSteps title="Step-by-step solution" steps={steps} />
        </>
      }
    />
  );
}
