import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Sigma, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

type Tab = "login" | "register";

export function LoginPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setPassword("");
    setConfirm("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (tab === "register") {
      if (password !== confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const res = register(name, email, password);
      if (!res.success) setError(res.error ?? "Registration failed.");
    } else {
      const res = login(email, password);
      if (!res.success) setError(res.error ?? "Login failed.");
    }

    setLoading(false);
  }

  const FEATURES = [
    { icon: "∫", label: "7 Interactive Modules", desc: "From algebra to geometry" },
    { icon: "∂", label: "Real-time Visualization", desc: "Drag sliders, see changes" },
    { icon: "∑", label: "Step-by-step Solutions", desc: "Understand the math" },
  ];

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background text-foreground">
      <div className="aurora-bg" aria-hidden>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 relative z-10 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-xl shadow-lg">
            <Sigma className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Interactive Math Visualizer</div>
            <div className="text-[11px] text-muted-foreground">Explore · Visualize · Understand</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Mathematics<br />
              <span className="text-primary">made visual.</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Drag sliders, zoom into graphs, and watch abstract equations come alive in real time. Learning math has never felt this intuitive.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center font-bold text-lg shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Your data is stored locally on your device.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold shadow-sm">∫</div>
            <div className="font-semibold text-sm">Interactive Math Visualizer</div>
          </div>

          <div className="glass rounded-2xl p-7 shadow-xl">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/40 rounded-xl mb-7">
              <button
                type="button"
                onClick={() => switchTab("login")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchTab("register")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === "register"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold">
                {tab === "login" ? "Welcome back" : "Get started free"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {tab === "login"
                  ? "Sign in to continue exploring mathematics"
                  : "Create your account to start learning"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                      placeholder="Ada Lovelace"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus={tab === "login"}
                    placeholder="ada@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={tab === "register" ? "At least 6 characters" : "Enter your password"}
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Repeat your password"
                      className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
              >
                {tab === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              {tab === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("register")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
