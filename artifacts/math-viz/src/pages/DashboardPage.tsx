import { useAuth, getInitials } from "@/lib/auth";
import {
  LineChart, Sigma, Waves, TrendingUp, Shapes, Move3d, Parentheses,
  LogOut, Calendar, BookOpen, Trophy, ChevronRight, Calculator, Compass, FolderOpen,
} from "lucide-react";

type ModuleId = "linear" | "quadratic" | "trig" | "derivative" | "integral" | "geometry" | "transform";

interface ModuleCard {
  id: ModuleId;
  label: string;
  group: string;
  groupIcon: React.ComponentType<{ className?: string }>;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  symbol: string;
}

const MODULES: ModuleCard[] = [
  {
    id: "linear",
    label: "Linear Functions",
    group: "Algebra",
    groupIcon: Calculator,
    icon: LineChart,
    description: "Explore slope, intercept, and the geometry of straight lines.",
    color: "from-blue-500/20 to-blue-600/10",
    symbol: "y=mx+b",
  },
  {
    id: "quadratic",
    label: "Quadratics",
    group: "Algebra",
    groupIcon: Calculator,
    icon: Parentheses,
    description: "Discover vertex, discriminant, and parabola shapes.",
    color: "from-violet-500/20 to-violet-600/10",
    symbol: "ax²+bx+c",
  },
  {
    id: "trig",
    label: "Sine Waves",
    group: "Algebra",
    groupIcon: Calculator,
    icon: Waves,
    description: "Visualize amplitude, frequency, and phase shifts live.",
    color: "from-cyan-500/20 to-cyan-600/10",
    symbol: "A·sin(Bx+C)",
  },
  {
    id: "derivative",
    label: "Derivatives",
    group: "Calculus",
    groupIcon: FolderOpen,
    icon: TrendingUp,
    description: "See tangent lines and instantaneous rate of change.",
    color: "from-orange-500/20 to-orange-600/10",
    symbol: "f′(x)",
  },
  {
    id: "integral",
    label: "Integrals",
    group: "Calculus",
    groupIcon: FolderOpen,
    icon: Sigma,
    description: "Explore Riemann sums and areas under the curve.",
    color: "from-green-500/20 to-green-600/10",
    symbol: "∫f(x)dx",
  },
  {
    id: "geometry",
    label: "Geometry",
    group: "Geometry",
    groupIcon: Compass,
    icon: Shapes,
    description: "Interact with 11 shape types and their properties.",
    color: "from-pink-500/20 to-pink-600/10",
    symbol: "△◻◯",
  },
  {
    id: "transform",
    label: "Linear Transforms",
    group: "Geometry",
    groupIcon: Compass,
    icon: Move3d,
    description: "See how 2×2 matrices warp and rotate the plane.",
    color: "from-amber-500/20 to-amber-600/10",
    symbol: "[a b; c d]",
  },
];

const GROUP_COLORS: Record<string, string> = {
  Algebra: "text-blue-400",
  Calculus: "text-green-400",
  Geometry: "text-pink-400",
};

export function DashboardPage({ onNavigate }: { onNavigate: (id: ModuleId) => void }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = getInitials(user.name);
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const visited = user.modulesVisited.length;
  const total = MODULES.length;
  const progressPct = Math.round((visited / total) * 100);

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <div className="aurora-bg" aria-hidden>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass-header sticky top-0 z-30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-base shadow-sm">
                ∫
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Interactive Math Visualizer</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Dashboard</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground glass px-3 py-1.5 rounded-lg hover-elevate transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Profile hero */}
          <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center text-3xl font-bold shadow-lg shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">Welcome back, {user.name.split(" ")[0]}!</h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {joinDate}
                </span>
              </div>
              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Modules explored — {visited}/{total}
                  </span>
                  <span className="text-xs font-bold text-primary">{progressPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:w-36 shrink-0">
              <div className="glass-stat rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase tracking-wide font-semibold">Explored</span>
                </div>
                <div className="text-2xl font-bold">{visited}</div>
              </div>
              <div className="glass-stat rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase tracking-wide font-semibold">Total</span>
                </div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
            </div>
          </div>

          {/* Modules grid */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Choose a module to explore
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const GroupIcon = mod.groupIcon;
                const isVisited = user.modulesVisited.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => onNavigate(mod.id)}
                    className={`group text-left glass rounded-2xl p-5 hover-elevate transition-all border border-border/60 hover:border-primary/30 bg-gradient-to-br ${mod.color}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-card/80 grid place-items-center shadow-sm border border-border/50">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      {isVisited && (
                        <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          Visited
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-muted-foreground mb-1 opacity-70">{mod.symbol}</div>
                    <div className="font-bold text-sm mb-1.5">{mod.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-3">{mod.description}</div>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1 text-[10px] font-semibold ${GROUP_COLORS[mod.group] ?? "text-muted-foreground"}`}>
                        <GroupIcon className="w-3 h-3" />
                        {mod.group}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-2">About this project</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              Mathematics is full of abstract ideas that are hard to grasp from static diagrams alone.
              This tool lets you drag sliders and watch graphs, areas, tangent lines, and shapes update in
              real time — turning equations into something you can feel. Covers algebra, calculus, and geometry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
