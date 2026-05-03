import { useMemo, useState } from "react";
import { Plot, FunctionCurve, HLine, VLine, Label } from "@/lib/plot";
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

export function TrigModule() {
  const [A, setA] = useState(2);
  const [B, setB] = useState(1);
  const [C, setC] = useState(0);
  const [D, setD] = useState(0);

  const fn = (x: number) => A * Math.sin(B * x + C) + D;
  const period = (2 * Math.PI) / Math.abs(B || 0.0001);
  const phaseShift = -C / (B || 0.0001);

  const steps: SolutionStep[] = useMemo(
    () => [
      { text: "Begin from the general sinusoid in the form y = A·sin(Bx + C) + D.", formula: "y = A·sin(B·x + C) + D" },
      {
        text: "Plug in the four parameters from the sliders.",
        substitution: `y = ${A.toFixed(2)}·sin(${B.toFixed(2)}·x + ${C.toFixed(2)}) + ${D.toFixed(2)}`,
      },
      {
        text: "Amplitude is the absolute value of A — it tells you how far the wave reaches above and below the midline.",
        formula: "amplitude = |A|",
        result: `amplitude = ${Math.abs(A).toFixed(3)}`,
      },
      {
        text: "Period is one full cycle of the sine; for sin(B·x) it is 2π divided by |B|.",
        formula: "T = 2π / |B|",
        substitution: `T = 2π / |${B.toFixed(2)}|`,
        result: `T ≈ ${period.toFixed(3)}`,
      },
      {
        text: "Phase shift moves the wave horizontally; it is −C/B (positive = right, negative = left).",
        formula: "shift = −C / B",
        substitution: `shift = −(${C.toFixed(2)}) / (${B.toFixed(2)})`,
        result: `shift ≈ ${phaseShift.toFixed(3)}`,
      },
      {
        text: "D is the vertical shift — the midline of the wave.",
        result: `midline y = ${D.toFixed(3)}`,
      },
    ],
    [A, B, C, D, period, phaseShift]
  );

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
          <SliderControl label="Amplitude" formula="A" value={A} onChange={setA} min={-1000} max={1000} step={0.1} color="hsl(var(--chart-1))" />
          <SliderControl label="Frequency" formula="B" value={B} onChange={setB} min={-1000} max={1000} step={0.05} color="hsl(var(--accent))" />
          <SliderControl label="Phase" formula="C" value={C} onChange={setC} min={-Math.PI * 1000} max={Math.PI * 1000} step={0.05} color="hsl(var(--chart-3))" />
          <SliderControl label="Vertical shift" formula="D" value={D} onChange={setD} min={-1000} max={1000} step={0.1} color="hsl(var(--chart-4))" />
        </>
      }
      plot={
        <Plot height={460} interactive range={{ xMin: -10, xMax: 10, yMin: -8, yMax: 8 }}>
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
          <EditableStat label="Amplitude (A)" value={A} onChange={setA} min={-999999} max={999999} step={0.1} accent="hsl(var(--chart-1))" hint="Click to type · scroll to nudge" />
          <EditableStat label="Frequency (B)" value={B} onChange={setB} min={-999999} max={999999} step={0.05} accent="hsl(var(--accent))" hint="Click to type · scroll to nudge" />
          <EditableStat label="Phase (C)" value={C} onChange={setC} min={-999999} max={999999} step={0.05} accent="hsl(var(--chart-3))" hint="Click to type · scroll to nudge" />
          <EditableStat label="Vertical shift (D)" value={D} onChange={setD} min={-999999} max={999999} step={0.1} accent="hsl(var(--chart-4))" hint="Click to type · scroll to nudge" />
          <EditableStat
            label="Period"
            value={period}
            onChange={(p) => {
              if (p > 0) setB((B >= 0 ? 1 : -1) * ((2 * Math.PI) / p));
            }}
            min={0.001}
            max={999999}
            step={0.05}
            format={(v) => v.toFixed(3)}
            hint="Type a new period; frequency updates"
          />
          <EditableStat
            label="Phase shift"
            value={phaseShift}
            onChange={(s) => setC(-s * (B || 0.0001))}
            min={-999999}
            max={999999}
            step={0.05}
            format={(v) => v.toFixed(3)}
            accent="hsl(var(--chart-3))"
            hint="Type a horizontal shift; C updates"
          />
        </InsightCard>
      }
      extras={
        <>
          <VariableSolver
            title="Solve y = A·sin(B·x + C) + D for any variable"
            def={{
              vars: [
                { symbol: "A", color: "hsl(var(--chart-1))" },
                { symbol: "B", color: "hsl(var(--accent))" },
                { symbol: "C", color: "hsl(var(--chart-3))" },
                { symbol: "D", color: "hsl(var(--chart-4))" },
                { symbol: "x", label: "input", color: "hsl(var(--chart-2))" },
                { symbol: "y", label: "output", color: "hsl(var(--chart-5))" },
              ],
              solvers: {
                y: {
                  formula: "y = A·sin(B·x + C) + D",
                  compute: (k) => k.A * Math.sin(k.B * k.x + k.C) + k.D,
                },
                A: {
                  formula: "A = (y − D) / sin(B·x + C)",
                  compute: (k) => (k.y - k.D) / Math.sin(k.B * k.x + k.C),
                },
                D: {
                  formula: "D = y − A·sin(B·x + C)",
                  compute: (k) => k.y - k.A * Math.sin(k.B * k.x + k.C),
                },
                C: {
                  formula: "C = arcsin((y − D) / A) − B·x",
                  compute: (k) => Math.asin((k.y - k.D) / k.A) - k.B * k.x,
                },
                B: {
                  formula: "B = (arcsin((y − D)/A) − C) / x",
                  compute: (k) => (Math.asin((k.y - k.D) / k.A) - k.C) / k.x,
                },
                x: {
                  formula: "x = (arcsin((y − D)/A) − C) / B",
                  compute: (k) => (Math.asin((k.y - k.D) / k.A) - k.C) / k.B,
                },
              },
            }}
            initial={{ A, B, C, D, x: 0, y: A * Math.sin(C) + D }}
            onApply={(out) => {
              if (Number.isFinite(out.A)) setA(out.A);
              if (Number.isFinite(out.B)) setB(out.B);
              if (Number.isFinite(out.C)) setC(out.C);
              if (Number.isFinite(out.D)) setD(out.D);
            }}
          />
          <SolutionSteps title="How the wave is shaped" steps={steps} />
        </>
      }
    />
  );
}
