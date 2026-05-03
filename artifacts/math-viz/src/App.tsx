import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LinearModule } from "@/modules/LinearModule";
import { QuadraticModule } from "@/modules/QuadraticModule";
import { TrigModule } from "@/modules/TrigModule";
import { DerivativeModule } from "@/modules/DerivativeModule";
import { IntegralModule } from "@/modules/IntegralModule";
import { GeometryModule } from "@/modules/GeometryModule";
import { TransformModule } from "@/modules/TransformModule";
import {
  LineChart, Sigma, Waves, TrendingUp, Shapes, Move3d, Parentheses,
  BookOpen, ChevronDown, Sun, Moon, FolderOpen, Calculator, Compass,
  LayoutDashboard, LogOut,
} from "lucide-react";
import { getInitials } from "@/lib/auth";

const queryClient = new QueryClient();

type ModuleId = "linear" | "quadratic" | "trig" | "derivative" | "integral" | "geometry" | "transform";

const NAV: {
  id: ModuleId;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}[] = [
  { id: "linear", label: "Linear functions", group: "Algebra", icon: LineChart, component: LinearModule },
  { id: "quadratic", label: "Quadratics", group: "Algebra", icon: Parentheses, component: QuadraticModule },
  { id: "trig", label: "Sine waves", group: "Algebra", icon: Waves, component: TrigModule },
  { id: "derivative", label: "Derivatives", group: "Calculus", icon: TrendingUp, component: DerivativeModule },
  { id: "integral", label: "Integrals", group: "Calculus", icon: Sigma, component: IntegralModule },
  { id: "geometry", label: "Geometry", group: "Geometry", icon: Shapes, component: GeometryModule },
  { id: "transform", label: "Linear transforms", group: "Geometry", icon: Move3d, component: TransformModule },
];

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Algebra: Calculator,
  Calculus: FolderOpen,
  Geometry: Compass,
};

function NavGroup({
  name, active, onSelect,
}: { name: string; active: ModuleId; onSelect: (id: ModuleId) => void }) {
  const items = NAV.filter((n) => n.group === name);
  const containsActive = items.some((i) => i.id === active);
  const [hover, setHover] = useState(false);
  const open = hover;
  const GroupIcon = GROUP_ICONS[name] ?? FolderOpen;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`rounded-xl transition-all ${open ? "glass" : "bg-transparent border border-transparent hover-elevate"}`}
    >
      <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <GroupIcon className={`w-4 h-4 ${containsActive ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-sm font-semibold ${containsActive ? "text-foreground" : "text-muted-foreground"}`}>{name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-0" : "-rotate-90"}`} />
      </div>
      <div className="grid transition-all duration-300 ease-out overflow-hidden" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="min-h-0">
          <div className="px-2 pb-2 space-y-1">
            {items.map((n) => {
              const Icon = n.icon;
              const isActive = active === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => onSelect(n.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "text-foreground bg-transparent border-transparent hover-elevate"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="fixed bottom-5 left-5 z-40 group flex items-center gap-2.5 pl-3 pr-4 h-11 rounded-full glass hover-elevate transition-all"
    >
      <span className="relative w-7 h-7 rounded-full grid place-items-center bg-primary text-primary-foreground overflow-hidden">
        <Sun className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
        <Moon className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
      </span>
      <span className="text-sm font-medium">{isDark ? "Dark" : "Light"} mode</span>
    </button>
  );
}

type AppView = "dashboard" | ModuleId;

function AppShell() {
  const { user, logout, updateModuleVisited } = useAuth();

  const [view, setView] = useState<AppView>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("math-viz-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("math-viz-theme", theme);
  }, [theme]);

  // Sync hash with active module
  useEffect(() => {
    if (view === "dashboard") {
      window.history.replaceState(null, "", "#/");
      return;
    }
    const target = `#/${view}`;
    if (window.location.hash !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [view]);

  // Read hash on load
  useEffect(() => {
    const h = window.location.hash.replace(/^#\/?/, "");
    const found = NAV.find((n) => n.id === h);
    if (found) {
      setView(found.id);
    }
  }, []);

  function navigateTo(id: ModuleId) {
    setView(id);
    updateModuleVisited(id);
  }

  if (!user) return null;

  // Dashboard view
  if (view === "dashboard") {
    return (
      <>
        <DashboardPage onNavigate={navigateTo} />
        <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
      </>
    );
  }

  // Module view
  const activeModule = NAV.find((n) => n.id === view);
  const ActiveComponent = activeModule?.component ?? LinearModule;
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  const initials = getInitials(user.name);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <div className="aurora-bg" aria-hidden>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>
      <div className="relative z-10">
        <header className="glass-header sticky top-0 z-30">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-base shadow-sm">∫</div>
              <div>
                <div className="text-sm font-semibold leading-tight">Interactive Math Visualizer</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Explore mathematics by dragging, not just reading</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("dashboard")}
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors glass px-3 py-1.5 rounded-lg hover-elevate"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setView("dashboard")}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center text-xs font-bold shadow-sm hover-elevate transition-all"
                title={user.name}
              >
                {initials}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
            <nav className="space-y-2 lg:sticky lg:top-24 h-fit">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground px-3 mb-1">
                Topics — hover to expand
              </div>
              {groups.map((g) => (
                <NavGroup key={g} name={g} active={view as ModuleId} onSelect={navigateTo} />
              ))}
              <div className="pt-2 border-t border-border/50">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover-elevate transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </nav>

            <main className="min-w-0">
              <ActiveComponent />

              <section id="about" className="mt-12 pt-8 border-t border-border">
                <div className="glass rounded-2xl p-6 lg:p-8">
                  <h3 className="text-lg font-semibold mb-2">About this project</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                    Mathematics is full of abstract ideas that are hard to grasp from static diagrams alone. This tool lets you
                    drag sliders and watch graphs, areas, tangent lines, and shapes update in real time — turning equations
                    into something you can feel.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
                    <div className="glass-stat rounded-lg p-3">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Modules</div>
                      <div className="font-semibold text-lg">{NAV.length}</div>
                    </div>
                    <div className="glass-stat rounded-lg p-3">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Areas covered</div>
                      <div className="font-semibold text-lg">{groups.length}</div>
                    </div>
                    <div className="glass-stat rounded-lg p-3">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Real-time</div>
                      <div className="font-semibold text-lg">Yes</div>
                    </div>
                    <div className="glass-stat rounded-lg p-3">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Open & free</div>
                      <div className="font-semibold text-lg">Yes</div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
      <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="aurora-bg" aria-hidden>
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-xl animate-pulse">∫</div>
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <AppShell />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthGate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
