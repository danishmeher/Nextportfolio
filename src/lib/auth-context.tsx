"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { toast } from "sonner";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  remainingTimeSeconds: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email - only this email can access admin panel
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@danish.dev";

// 2 Hours inactivity timeout in milliseconds (7,200,000 ms)
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number>(7200);

  // Helper to record activity timestamp
  const updateLastActivity = () => {
    if (typeof window !== "undefined") {
      const now = Date.now();
      const last = Number(localStorage.getItem("admin_last_activity") || 0);
      // Update activity timestamp
      localStorage.setItem("admin_last_activity", now.toString());
      setRemainingTimeSeconds(7200);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser && authUser.email === ADMIN_EMAIL) {
        const lastActivity = Number(localStorage.getItem("admin_last_activity") || 0);
        const now = Date.now();

        if (lastActivity && now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
          signOut(auth);
          localStorage.removeItem("admin_session_token");
          localStorage.removeItem("admin_last_activity");
          setUser(null);
          toast.error("Session expired due to 2 hours of inactivity. Please log in again.");
        } else {
          setUser(authUser);
          if (!localStorage.getItem("admin_last_activity")) {
            localStorage.setItem("admin_last_activity", now.toString());
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem("admin_session_token");
        localStorage.removeItem("admin_last_activity");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to admin user activity (mouse move, keypress, click, scroll) & update timer
  useEffect(() => {
    if (!user) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleActivity = () => {
      const now = Date.now();
      const last = Number(localStorage.getItem("admin_last_activity") || 0);
      if (now - last > 5000) {
        // update every 5 sec on user activity
        updateLastActivity();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    // Live countdown timer checking every 1 second
    const interval = setInterval(() => {
      const lastActivity = Number(localStorage.getItem("admin_last_activity") || 0);
      const now = Date.now();

      if (!lastActivity) return;

      const elapsedMs = now - lastActivity;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsedMs;

      if (remainingMs <= 0) {
        logout();
        toast.error("Logged out automatically due to 2 hours of inactivity.");
        setRemainingTimeSeconds(0);
      } else {
        setRemainingTimeSeconds(Math.floor(remainingMs / 1000));
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearInterval(interval);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      throw new Error("Unauthorized: You are not an admin");
    }

    const now = Date.now();
    const sessionToken = `token_${now}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem("admin_session_token", sessionToken);
    localStorage.setItem("admin_last_activity", now.toString());
    setRemainingTimeSeconds(7200);
  };

  const logout = async () => {
    localStorage.removeItem("admin_session_token");
    localStorage.removeItem("admin_last_activity");
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, remainingTimeSeconds }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
