import { useState } from "react";
import { Plot, FunctionCurve, HLine, VLine, Label } from "@/lib/plot";
import { SliderControl } from "@/components/SliderControl";
import { ModuleShell, InsightCard, Stat } from "@/components/ModuleShell";

export function TrigModule() {
  const [A, setA] = useState(2);
  const [B, setB] = useState(1);
  const [C, setC] = useState(0);
  const [D, setD] = useState(0);

  const fn = (x: number) => A * Math.sin(B * x + C) + D;
  const period = (2 * Math.PI) / Math.abs(B || 0.0001);
  const phaseShift = -C / (B || 0.0001);

  return (
    <ModuleShell
      title="Sinusoidal Functions"
      description="The four parameters of a sine wave each shape it differently. Adjust them to see amplitude stretch the wave vertically, frequency squeeze it horizontally, phase slide it sideways, and the offset shift it up and down."
      formula={
        <span>
          y = <span className="text-[hsl(var(--chart-1))]">A</span>·sin(<span className="text-[hsl(var(--accent))]">B</span>x + <span className="text-[hsl(var(--chart-3))]">C</span>) + <span className="text-[hsl(var(--chart-4))]">D</span>
        </span>
      }
      controls={
        <>
          <SliderControl label="Amplitude" formula="A" value={A} onChange={setA} min={-5} max={5} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Frequency" formula="B" value={B} onChange={setB} min={-4} max={4} step={0.05} color="hsl(var(--accent))" />
          <SliderControl label="Phase" formula="C" value={C} onChange={setC} min={-Math.PI * 2} max={Math.PI * 2} step={0.05} color="hsl(var(--chart-3))" />
          <SliderControl label="Vertical shift" formula="D" value={D} onChange={setD} min={-5} max={5} step={0.1} color="hsl(var(--chart-4))" />
        </>
      }
      plot={
        <Plot height={460} range={{ xMin: -10, xMax: 10, yMin: -8, yMax: 8 }}>
          <HLine y={D} color="hsl(var(--chart-4))" />
          <HLine y={D + Math.abs(A)} color="hsl(var(--chart-1))" />
          <HLine y={D - Math.abs(A)} color="hsl(var(--chart-1))" />
          <FunctionCurve fn={fn} color="hsl(var(--chart-1))" strokeWidth={3} samples={1000} />
          <VLine x={phaseShift} color="hsl(var(--chart-3))" />
          <Label x={-9} y={D + 0.4} anchor="start">midline</Label>
        </Plot>
      }
      insights={
        <InsightCard>
          <Stat label="Equation" value={`${A.toFixed(2)}·sin(${B.toFixed(2)}x + ${C.toFixed(2)}) + ${D.toFixed(2)}`} accent="hsl(var(--chart-1))" />
          <Stat label="Amplitude" value={Math.abs(A).toFixed(2)} accent="hsl(var(--chart-1))" />
          <Stat label="Period" value={period.toFixed(3)} accent="hsl(var(--accent))" />
          <Stat label="Frequency" value={(1 / period).toFixed(3)} />
          <Stat label="Phase shift" value={phaseShift.toFixed(3)} accent="hsl(var(--chart-3))" />
          <Stat label="Midline" value={`y = ${D.toFixed(2)}`} accent="hsl(var(--chart-4))" />
        </InsightCard>
      }
    />
  );
}
