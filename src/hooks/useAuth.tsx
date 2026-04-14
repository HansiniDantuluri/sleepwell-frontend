import { useState, useEffect, createContext, useContext } from "react";
import { api, tokenStore, type UserProfile } from "../lib/api";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load token from sessionStorage on app start
    const savedToken = sessionStorage.getItem("sleepwell_token");
    if (savedToken) {
      tokenStore.set(savedToken);
      api.users.me()
        .then(setUser)
        .catch(() => {
          sessionStorage.removeItem("sleepwell_token");
          tokenStore.clear();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await api.auth.login(email, password);
    tokenStore.set(access_token);
    sessionStorage.setItem("sleepwell_token", access_token);
    const profile = await api.users.me();
    setUser(profile);
  };

  const register = async (email: string, password: string, name: string) => {
    const { access_token } = await api.auth.register(email, password, name);
    tokenStore.set(access_token);
    sessionStorage.setItem("sleepwell_token", access_token);
    const profile = await api.users.me();
    setUser(profile);
  };

  const logout = () => {
    tokenStore.clear();
    sessionStorage.removeItem("sleepwell_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}