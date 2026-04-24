# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Apps

- **Interactive Math Visualizer** (`artifacts/math-viz`) — React + Vite frontend-only educational app with interactive visualizations: linear/quadratic/sinusoidal functions, derivatives & tangent lines, Riemann-sum integrals, geometry (11 shapes: circle, ellipse, square, rectangle, triangle, right triangle, parallelogram, trapezoid, rhombus, sector, regular polygon — each with angle arcs in the diagram), and 2×2 linear transformations. Every module ships with: (a) a **textbook-style SolutionSteps panel** with numbered steps and tagged Formula / Substitute / Result rows; (b) a **VariableSolver** that lets the student pick which symbol is unknown (e.g. solve `y=mx+b` for any of m, b, x, or y) and computes the missing value with the formula displayed and an "Apply to diagram" button; (c) an **interactive Plot toolbar** with zoom in/out, reset, 100%, fullscreen, drag-to-pan, scroll-to-zoom; (d) **typeable + scrollable numeric inputs** everywhere — every slider value, EditableStat, and solver field accepts keyboard typing, ↑/↓ arrow nudge, and mouse-wheel scroll (Shift = ×10). Glassmorphism UI with aurora background, dark/light theme persisted to localStorage, hash-based deep links (`#/<module>`). Custom SVG plotting engine in `src/lib/plot.tsx` (primitives: FunctionCurve, PointDot, VLine, HLine, FillRect, Polygon, Line2D, Circle2D, Ellipse2D, Sector2D, AngleArc, Label); modules in `src/modules/`; reusable shell + SolutionSteps + VariableSolver in `src/components/ModuleShell.tsx`. No backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
