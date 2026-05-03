import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  lastLogin: string;
  modulesVisited: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateModuleVisited: (moduleId: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

const USERS_KEY = "math-viz-users";
const SESSION_KEY = "math-viz-session";

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function saveSession(email: string | null) {
  if (email) localStorage.setItem(SESSION_KEY, email);
  else localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = getSession();
    if (email) {
      const found = getUsers().find((u) => u.email === email);
      if (found) {
        const updated = { ...found, lastLogin: new Date().toISOString() };
        saveUsers(getUsers().map((u) => u.email === email ? updated : u));
        setUser(updated);
      }
    }
    setLoading(false);
  }, []);

  function login(email: string, password: string) {
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { success: false, error: "No account found with this email." };
    if (found.password !== password) return { success: false, error: "Incorrect password." };
    const updated = { ...found, lastLogin: new Date().toISOString() };
    saveUsers(users.map((u) => u.email === found.email ? updated : u));
    saveSession(found.email);
    setUser(updated);
    return { success: true };
  }

  function register(name: string, email: string, password: string) {
    if (!name.trim()) return { success: false, error: "Please enter your full name." };
    if (!email.includes("@")) return { success: false, error: "Please enter a valid email address." };
    if (password.length < 6) return { success: false, error: "Password must be at least 6 characters." };
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      modulesVisited: [],
    };
    saveUsers([...users, newUser]);
    saveSession(newUser.email);
    setUser(newUser);
    return { success: true };
  }

  function logout() {
    saveSession(null);
    setUser(null);
  }

  function updateModuleVisited(moduleId: string) {
    if (!user) return;
    const already = user.modulesVisited.includes(moduleId);
    if (already) return;
    const updated = { ...user, modulesVisited: [...user.modulesVisited, moduleId] };
    saveUsers(getUsers().map((u) => u.id === user.id ? updated : u));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateModuleVisited }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
