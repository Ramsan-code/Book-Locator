"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, AuthContextType, LoginCredentials, RegisterData, UserRole } from "@/types/auth";
import { authService, getErrorMessage } from "@/services/auth.service";

class ApiError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "booklink_token";
const USER_KEY = "booklink_user";

// ----------------------
// Helpers
// ----------------------
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

const deleteCookie = (name: string) => {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}

const saveAuth = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie('token', token, 7);
  setCookie('user', JSON.stringify(user), 7);
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  deleteCookie('token');
  deleteCookie('user');
};

const getRoleRedirect = (role: UserRole): string => {
  const redirectMap: Record<UserRole, string> = {
    user: "/books",
    admin: "/admin",
  };
  return redirectMap[role] || "/books";
};

// ----------------------
// Provider Component
// ----------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------------------------------
  // Load token & user on mount + auto-verify token
  // -------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        const res = await authService.getMe(storedToken);
        setUser(res.user);
        saveAuth(storedToken, res.user);
      } catch {
        clearAuth();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // -------------------------------------------------
  // Login
  // -------------------------------------------------
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        const res = await authService.login(credentials);

        if (!res.token) {
          toast.error("Login failed: No token received");
          return;
        }

        setToken(res.token);
        setUser(res.user);
        saveAuth(res.token, res.user);

        toast.success(res.message || "Login successful");
        router.push(getRoleRedirect(res.user.role));
      } catch (err) {
        console.error("Login error details:", err);
        toast.error(err instanceof ApiError ? err.message : "Login failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // -------------------------------------------------
  // Register
  // -------------------------------------------------
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        const res = await authService.register(data);

        // Roles requiring approval
        if (["user"].includes(data.role)) {
          toast.success(res.message || "Registration successful! Awaiting approval.");
          router.push("/auth/login");
          return;
        }

        // Auto-login for others (if any)
        if (res.token) {
          setToken(res.token);
          setUser(res.user);
          saveAuth(res.token, res.user);

          toast.success(res.message || "Registration successful");
          router.push(getRoleRedirect(res.user.role));
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Registration failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // -------------------------------------------------
  // Logout
  // -------------------------------------------------
  const logout = useCallback(async () => {
    try {
      if (token) await authService.logout(token);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      setUser(null);
      setToken(null);
      toast.success("Logged out");
      router.push("/");
    }
  }, [token, router]);

  // -------------------------------------------------
  // Check Auth (Refresh user)
  // -------------------------------------------------
  const checkAuth = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authService.getMe(token);
      setUser(res.user);
      saveAuth(token, res.user);
    } catch (err) {
      console.error("Session refresh failed:", err);
      await logout();
    }
  }, [token, logout]);

  // -------------------------------------------------
  // Provider value
  // -------------------------------------------------
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------
// Hook
// ----------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

