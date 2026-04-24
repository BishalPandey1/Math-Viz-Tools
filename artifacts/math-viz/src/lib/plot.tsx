import { useMemo, useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from "lucide-react";

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
  interactive?: boolean;
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
  range: rangeProp = defaultRange,
  height: heightProp = 420,
  children,
  showAxes = true,
  showGrid = true,
  className = "",
  onPointerMove,
  cursor,
  interactive = false,
}: PlotProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<null | { startX: number; startY: number; panX: number; panY: number }>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Derived range from base range + zoom + pan
  const range = useMemo<PlotRange>(() => {
    if (!interactive) return rangeProp;
    const cx = (rangeProp.xMin + rangeProp.xMax) / 2 + pan.x;
    const cy = (rangeProp.yMin + rangeProp.yMax) / 2 + pan.y;
    const halfW = ((rangeProp.xMax - rangeProp.xMin) / 2) / zoom;
    const halfH = ((rangeProp.yMax - rangeProp.yMin) / 2) / zoom;
    return { xMin: cx - halfW, xMax: cx + halfW, yMin: cy - halfH, yMax: cy + halfH };
  }, [rangeProp, zoom, pan, interactive]);

  const height = fullscreen ? Math.max(400, window.innerHeight - 80) : heightProp;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 800;
      setWidth(Math.max(200, w));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Fullscreen — use document.fullscreenElement listeners to sync state if user presses Esc
  useEffect(() => {
    function onChange() {
      const el = document.fullscreenElement;
      if (!el && fullscreen) setFullscreen(false);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [fullscreen]);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        setFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setFullscreen(false);
      }
    } catch {
      // Fallback: just visual state
      setFullscreen((f) => !f);
    }
  }, []);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
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
    if (dragging && interactive) {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      const dataDx = (-dx / ctx.width) * (range.xMax - range.xMin);
      const dataDy = (dy / ctx.height) * (range.yMax - range.yMin);
      setPan({ x: dragging.panX + dataDx, y: dragging.panY + dataDy });
      return;
    }
    if (!onPointerMove) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const xVal = range.xMin + (px / ctx.width) * (range.xMax - range.xMin);
    const yVal = range.yMin + ((ctx.height - py) / ctx.height) * (range.yMax - range.yMin);
    onPointerMove(xVal, yVal);
  }

  function handleDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging({ startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y });
  }

  function handleUp(e: React.PointerEvent<SVGSVGElement>) {
    if (dragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(null);
    }
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    if (!interactive) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setZoom((z) => Math.min(40, Math.max(0.1, z * factor)));
  }

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className} ${fullscreen ? "bg-background p-3" : ""}`}
    >
      {interactive && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg glass px-1 py-1 shadow-md">
          <PlotBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(40, z * 1.25))}>
            <ZoomIn className="w-4 h-4" />
          </PlotBtn>
          <PlotBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(0.1, z / 1.25))}>
            <ZoomOut className="w-4 h-4" />
          </PlotBtn>
          <PlotBtn label="Reset view" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </PlotBtn>
          <div className="w-px h-5 bg-border mx-1" />
          <span className="px-1.5 text-[11px] font-mono tabular-nums text-muted-foreground">
            {(zoom * 100).toFixed(0)}%
          </span>
          <div className="w-px h-5 bg-border mx-1" />
          <PlotBtn label={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </PlotBtn>
        </div>
      )}
      <svg
        width={width}
        height={height}
        className="block rounded-lg bg-card border border-card-border"
        style={{
          cursor:
            cursor ??
            (dragging ? "grabbing" : interactive ? "grab" : onPointerMove ? "crosshair" : "default"),
          touchAction: interactive ? "none" : undefined,
        }}
        onPointerMove={handleMove}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onWheel={handleWheel}
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

function PlotBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-7 h-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover-elevate transition-colors"
    >
      {children}
    </button>
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

export function Ellipse2D({
  cx, cy, rx, ry, rotation = 0, fill, stroke = "hsl(var(--chart-2))", strokeWidth = 2, opacity = 0.2,
}: { cx: number; cy: number; rx: number; ry: number; rotation?: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }) {
  const ctx = usePlotCtx();
  const px = ctx.toX(cx);
  const py = ctx.toY(cy);
  const prx = Math.abs(ctx.toX(cx + rx) - ctx.toX(cx));
  const pry = Math.abs(ctx.toY(cy + ry) - ctx.toY(cy));
  return (
    <ellipse cx={px} cy={py} rx={prx} ry={pry}
      transform={`rotate(${-rotation} ${px} ${py})`}
      fill={fill ?? "none"} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />
  );
}

/** Circular sector: center at (cx,cy), radius r, from startAngle to endAngle (degrees, CCW). */
export function Sector2D({
  cx, cy, r, startAngle, endAngle, fill = "hsl(var(--chart-3))", stroke = "hsl(var(--chart-3))", strokeWidth = 2, opacity = 0.25,
}: { cx: number; cy: number; r: number; startAngle: number; endAngle: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }) {
  const ctx = usePlotCtx();
  const cpx = ctx.toX(cx);
  const cpy = ctx.toY(cy);
  const pr = Math.abs(ctx.toX(cx + r) - ctx.toX(cx));
  const a1 = (startAngle * Math.PI) / 180;
  const a2 = (endAngle * Math.PI) / 180;
  // SVG y-axis is flipped relative to math; subtract for screen coords
  const x1 = cpx + pr * Math.cos(a1);
  const y1 = cpy - pr * Math.sin(a1);
  const x2 = cpx + pr * Math.cos(a2);
  const y2 = cpy - pr * Math.sin(a2);
  const sweep = Math.abs(endAngle - startAngle) % 360;
  const largeArc = sweep > 180 ? 1 : 0;
  // Sweep direction: in screen coords y-axis is inverted, so CCW in math = sweep-flag 0
  const sweepFlag = endAngle > startAngle ? 0 : 1;
  const d = `M ${cpx} ${cpy} L ${x1} ${y1} A ${pr} ${pr} 0 ${largeArc} ${sweepFlag} ${x2} ${y2} Z`;
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />;
}

/**
 * Draw an angle arc at vertex V between rays V→A and V→B, with the angle value labeled.
 * Returns the angle in degrees (positive, 0..180).
 */
export function AngleArc({
  vx, vy, ax, ay, bx, by, color = "hsl(var(--chart-4))", radiusPx = 22, label, rightAngle = false,
}: {
  vx: number; vy: number; ax: number; ay: number; bx: number; by: number;
  color?: string; radiusPx?: number; label?: string; rightAngle?: boolean;
}) {
  const ctx = usePlotCtx();
  const cpx = ctx.toX(vx);
  const cpy = ctx.toY(vy);
  // Use pixel-space angles for visual correctness
  const apx = ctx.toX(ax) - cpx;
  const apy = ctx.toY(ay) - cpy;
  const bpx = ctx.toX(bx) - cpx;
  const bpy = ctx.toY(by) - cpy;
  const angA = Math.atan2(apy, apx);
  const angB = Math.atan2(bpy, bpx);
  // Angle between vectors (always positive, 0..π)
  let delta = angB - angA;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  const sweepFlag = delta > 0 ? 1 : 0;
  const absDelta = Math.abs(delta);
  const largeArc = absDelta > Math.PI ? 1 : 0;
  const r = radiusPx;
  const x1 = cpx + r * Math.cos(angA);
  const y1 = cpy + r * Math.sin(angA);
  const x2 = cpx + r * Math.cos(angB);
  const y2 = cpy + r * Math.sin(angB);
  const midA = angA + delta / 2;
  const lblR = r + 14;
  const lx = cpx + lblR * Math.cos(midA);
  const ly = cpy + lblR * Math.sin(midA);
  const angDeg = (absDelta * 180) / Math.PI;
  const isRight = rightAngle || Math.abs(angDeg - 90) < 0.5;
  if (isRight) {
    // Draw a tiny square instead of arc for right angles
    const s = r * 0.6;
    const ux = Math.cos(angA), uy = Math.sin(angA);
    const vxv = Math.cos(angB), vyv = Math.sin(angB);
    const p0x = cpx + ux * s, p0y = cpy + uy * s;
    const p1x = p0x + vxv * s, p1y = p0y + vyv * s;
    const p2x = cpx + vxv * s, p2y = cpy + vyv * s;
    return (
      <g>
        <polyline points={`${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y}`}
          fill="none" stroke={color} strokeWidth={1.5} />
        <text x={lx} y={ly + 4} fontSize={11} textAnchor="middle"
          fill={color} fontFamily="var(--font-mono)" fontWeight={600}>
          {label ?? "90°"}
        </text>
      </g>
    );
  }
  return (
    <g>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth={1.6} />
      <text x={lx} y={ly + 4} fontSize={11} textAnchor="middle"
        fill={color} fontFamily="var(--font-mono)" fontWeight={600}>
        {label ?? `${angDeg.toFixed(1)}°`}
      </text>
    </g>
  );
}
