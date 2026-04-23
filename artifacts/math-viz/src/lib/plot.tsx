import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";

export type PlotRange = { xMin: number; xMax: number; yMin: number; yMax: number };

export const defaultRange: PlotRange = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

type PlotProps = {
  range?: PlotRange;
  height?: number;
  children?: ReactNode;
  showAxes?: boolean;
  showGrid?: boolean;
  className?: string;
  onPointerMove?: (x: number, y: number) => void;
  cursor?: string;
};

type Ctx = {
  width: number;
  height: number;
  range: PlotRange;
  toX: (xVal: number) => number;
  toY: (yVal: number) => number;
};

let _ctx: Ctx | null = null;
export function usePlotCtx(): Ctx {
  if (!_ctx) throw new Error("usePlotCtx must be used inside <Plot>");
  return _ctx;
}

export function Plot({
  range = defaultRange,
  height = 420,
  children,
  showAxes = true,
  showGrid = true,
  className = "",
  onPointerMove,
  cursor,
}: PlotProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 800;
      setWidth(Math.max(200, w));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const ctx = useMemo<Ctx>(() => {
    const { xMin, xMax, yMin, yMax } = range;
    const w = width;
    const h = height;
    const toX = (xVal: number) => ((xVal - xMin) / (xMax - xMin)) * w;
    const toY = (yVal: number) => h - ((yVal - yMin) / (yMax - yMin)) * h;
    return { width: w, height: h, range, toX, toY };
  }, [width, height, range]);

  _ctx = ctx;

  const gridLinesX = useMemo(() => {
    const lines: number[] = [];
    const step = niceStep((range.xMax - range.xMin) / 10);
    const start = Math.ceil(range.xMin / step) * step;
    for (let v = start; v <= range.xMax; v += step) lines.push(round(v));
    return lines;
  }, [range]);

  const gridLinesY = useMemo(() => {
    const lines: number[] = [];
    const step = niceStep((range.yMax - range.yMin) / 10);
    const start = Math.ceil(range.yMin / step) * step;
    for (let v = start; v <= range.yMax; v += step) lines.push(round(v));
    return lines;
  }, [range]);

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!onPointerMove) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const xVal = range.xMin + (px / ctx.width) * (range.xMax - range.xMin);
    const yVal = range.yMin + ((ctx.height - py) / ctx.height) * (range.yMax - range.yMin);
    onPointerMove(xVal, yVal);
  }

  return (
    <div ref={wrapRef} className={`w-full ${className}`}>
      <svg
        width={width}
        height={height}
        className="block rounded-lg bg-card border border-card-border"
        style={{ cursor: cursor ?? (onPointerMove ? "crosshair" : "default") }}
        onPointerMove={handleMove}
      >
        {showGrid && (
          <g>
            {gridLinesX.map((v) => (
              <line key={`gx-${v}`} x1={ctx.toX(v)} y1={0} x2={ctx.toX(v)} y2={height}
                stroke="hsl(var(--border))" strokeWidth={v === 0 ? 0 : 1} opacity={0.45} />
            ))}
            {gridLinesY.map((v) => (
              <line key={`gy-${v}`} x1={0} y1={ctx.toY(v)} x2={width} y2={ctx.toY(v)}
                stroke="hsl(var(--border))" strokeWidth={v === 0 ? 0 : 1} opacity={0.45} />
            ))}
          </g>
        )}
        {showAxes && (
          <g>
            {range.yMin <= 0 && range.yMax >= 0 && (
              <line x1={0} y1={ctx.toY(0)} x2={width} y2={ctx.toY(0)}
                stroke="hsl(var(--foreground))" strokeWidth={1.5} opacity={0.7} />
            )}
            {range.xMin <= 0 && range.xMax >= 0 && (
              <line x1={ctx.toX(0)} y1={0} x2={ctx.toX(0)} y2={height}
                stroke="hsl(var(--foreground))" strokeWidth={1.5} opacity={0.7} />
            )}
            {gridLinesX.filter((v) => v !== 0).map((v) => (
              <text key={`tx-${v}`} x={ctx.toX(v)} y={Math.min(height - 4, Math.max(12, ctx.toY(0) + 14))}
                textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontFamily="var(--font-mono)">
                {fmtTick(v)}
              </text>
            ))}
            {gridLinesY.filter((v) => v !== 0).map((v) => (
              <text key={`ty-${v}`} x={Math.min(width - 4, Math.max(4, ctx.toX(0) + 6))} y={ctx.toY(v) + 4}
                textAnchor="start" fontSize={11} fill="hsl(var(--muted-foreground))" fontFamily="var(--font-mono)">
                {fmtTick(v)}
              </text>
            ))}
          </g>
        )}
        {children}
      </svg>
    </div>
  );
}

function niceStep(raw: number) {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  let step;
  if (n < 1.5) step = 1;
  else if (n < 3) step = 2;
  else if (n < 7) step = 5;
  else step = 10;
  return step * pow;
}
function round(v: number) {
  return Math.round(v * 1e6) / 1e6;
}
function fmtTick(v: number) {
  if (Math.abs(v) < 1e-9) return "0";
  if (Math.abs(v) >= 1000 || (Math.abs(v) > 0 && Math.abs(v) < 0.01)) return v.toExponential(0);
  return String(round(v));
}

export function FunctionCurve({
  fn, color = "hsl(var(--chart-1))", strokeWidth = 2.5, samples = 600, dashed = false,
}: { fn: (x: number) => number; color?: string; strokeWidth?: number; samples?: number; dashed?: boolean }) {
  const ctx = usePlotCtx();
  const { range, width } = ctx;
  const path = useMemo(() => {
    const segs: string[] = [];
    let pen = false;
    for (let i = 0; i <= samples; i++) {
      const x = range.xMin + (i / samples) * (range.xMax - range.xMin);
      const y = fn(x);
      if (!isFinite(y) || y < range.yMin - (range.yMax - range.yMin) || y > range.yMax + (range.yMax - range.yMin)) {
        pen = false;
        continue;
      }
      const px = ctx.toX(x);
      const py = ctx.toY(y);
      if (!pen) {
        segs.push(`M ${px.toFixed(2)} ${py.toFixed(2)}`);
        pen = true;
      } else {
        segs.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
      }
    }
    return segs.join(" ");
  }, [fn, range, samples, ctx, width]);
  return (
    <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinejoin="round" strokeLinecap="round"
      strokeDasharray={dashed ? "6 4" : undefined} />
  );
}

export function PointDot({ x, y, color = "hsl(var(--accent))", r = 5, label }: { x: number; y: number; color?: string; r?: number; label?: string }) {
  const ctx = usePlotCtx();
  const px = ctx.toX(x);
  const py = ctx.toY(y);
  return (
    <g>
      <circle cx={px} cy={py} r={r + 3} fill={color} opacity={0.18} />
      <circle cx={px} cy={py} r={r} fill={color} stroke="hsl(var(--card))" strokeWidth={2} />
      {label && (
        <text x={px + 10} y={py - 10} fontSize={12} fill="hsl(var(--foreground))"
          fontFamily="var(--font-mono)" fontWeight={600}>{label}</text>
      )}
    </g>
  );
}

export function VLine({ x, color = "hsl(var(--muted-foreground))", dashed = true }: { x: number; color?: string; dashed?: boolean }) {
  const ctx = usePlotCtx();
  return <line x1={ctx.toX(x)} y1={0} x2={ctx.toX(x)} y2={ctx.height}
    stroke={color} strokeWidth={1.2} strokeDasharray={dashed ? "4 4" : undefined} opacity={0.7} />;
}

export function HLine({ y, color = "hsl(var(--muted-foreground))", dashed = true }: { y: number; color?: string; dashed?: boolean }) {
  const ctx = usePlotCtx();
  return <line x1={0} y1={ctx.toY(y)} x2={ctx.width} y2={ctx.toY(y)}
    stroke={color} strokeWidth={1.2} strokeDasharray={dashed ? "4 4" : undefined} opacity={0.7} />;
}

export function FillRect({ x1, x2, y1, y2, color, opacity = 0.25 }: { x1: number; x2: number; y1: number; y2: number; color: string; opacity?: number }) {
  const ctx = usePlotCtx();
  const ax = Math.min(ctx.toX(x1), ctx.toX(x2));
  const bx = Math.max(ctx.toX(x1), ctx.toX(x2));
  const ay = Math.min(ctx.toY(y1), ctx.toY(y2));
  const by = Math.max(ctx.toY(y1), ctx.toY(y2));
  return <rect x={ax} y={ay} width={bx - ax} height={by - ay} fill={color} opacity={opacity} />;
}

export function Polygon({ points, fill, stroke, strokeWidth = 2, opacity = 0.25 }: { points: [number, number][]; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }) {
  const ctx = usePlotCtx();
  const d = points.map(([x, y]) => `${ctx.toX(x)},${ctx.toY(y)}`).join(" ");
  return <polygon points={d} fill={fill ?? "none"} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />;
}

export function Line2D({ x1, y1, x2, y2, color = "hsl(var(--chart-2))", width = 2, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; dashed?: boolean }) {
  const ctx = usePlotCtx();
  return <line x1={ctx.toX(x1)} y1={ctx.toY(y1)} x2={ctx.toX(x2)} y2={ctx.toY(y2)}
    stroke={color} strokeWidth={width} strokeDasharray={dashed ? "6 4" : undefined} strokeLinecap="round" />;
}

export function Circle2D({ cx, cy, r, fill, stroke = "hsl(var(--chart-2))", strokeWidth = 2, opacity = 0.2 }: { cx: number; cy: number; r: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }) {
  const ctx = usePlotCtx();
  // Convert radius from data units to pixel units (uses x-axis scale)
  const px = ctx.toX(cx);
  const py = ctx.toY(cy);
  const pr = Math.abs(ctx.toX(cx + r) - ctx.toX(cx));
  return <circle cx={px} cy={py} r={pr} fill={fill ?? "none"} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />;
}

export function Label({ x, y, children, color = "hsl(var(--foreground))", anchor = "middle", dy = 0 }: { x: number; y: number; children: string; color?: string; anchor?: "start" | "middle" | "end"; dy?: number }) {
  const ctx = usePlotCtx();
  return <text x={ctx.toX(x)} y={ctx.toY(y) + dy} fontSize={12} textAnchor={anchor} fill={color} fontFamily="var(--font-mono)" fontWeight={600}>{children}</text>;
}
