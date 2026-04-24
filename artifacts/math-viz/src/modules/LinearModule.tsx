import { useState } from "react";
import { Plot, FunctionCurve, PointDot, VLine, HLine, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat, EditableStat } from "@/components/ModuleShell";

export function LinearModule() {
  const [m, setM] = useState(1);
  const [b, setB] = useState(0);

  const fn = (x: number) => m * x + b;
  const xIntercept = m !== 0 ? -b / m : NaN;
  const angleDeg = (Math.atan(m) * 180) / Math.PI;

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
            Try setting <span className="font-mono">m = 0</span> for a horizontal line, or <span className="font-mono">b = 0</span> to make the line pass through the origin.
          </div>
        </>
      }
      plot={
        <Plot height={460}>
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
            format={(v) => v.toFixed(3)}
            hint="Click to type a new slope"
          />
          <EditableStat
            label="Angle with x-axis"
            value={angleDeg}
            onChange={(deg) => setM(Math.tan((deg * Math.PI) / 180))}
            min={-89}
            max={89}
            suffix="°"
            hint="Type an angle; the slope updates"
          />
          <EditableStat
            label="Y-Intercept (b)"
            value={b}
            onChange={setB}
            min={-100}
            max={100}
            accent="hsl(var(--accent))"
            hint="Click to type a new y-intercept"
          />
          <EditableStat
            label="X-Intercept"
            value={Number.isFinite(xIntercept) ? xIntercept : 0}
            onChange={(xi) => {
              if (m !== 0) setB(-m * xi);
            }}
            accent="hsl(var(--chart-3))"
            hint={m === 0 ? "Set a non-zero slope first" : "Type a new x-intercept; b updates"}
          />
          <Stat label="Δy / Δx" value={`${m.toFixed(2)} / 1`} />
        </InsightCard>
      }
    />
  );
}
