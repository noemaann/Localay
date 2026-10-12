import { createContext, useContext, useEffect, useState } from "react";
import { authService, isDemoMode } from "../services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devRoleOverride, setDevRoleOverride] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem("localay_dev_role") || null;
      }
    } catch (_) {}
    return null;
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const activeRole = devRoleOverride || user?.role || "community_member";
  const isModerator = Boolean(user && (activeRole === "admin" || activeRole === "moderator"));
  const isAdmin = Boolean(user && activeRole === "admin");

  const toggleDevRole = (role) => {
    setDevRoleOverride(role);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        if (role) localStorage.setItem("localay_dev_role", role);
        else localStorage.removeItem("localay_dev_role");
      }
    } catch (_) {}
  };

  const value = {
    user: user ? { ...user, role: activeRole } : null,
    loading,
    isDemo: isDemoMode,
    isModerator,
    isAdmin,
    toggleDevRole,
    signInWithGoogle: authService.signInWithGoogle,
    signInWithEmail: authService.signInWithEmail,
    signUpWithEmail: authService.signUpWithEmail,
    signOut: authService.signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      isDemo: isDemoMode,
      isModerator: false,
      isAdmin: false,
      toggleDevRole: () => {},
      signInWithGoogle: () => Promise.resolve(),
      signInWithEmail: () => Promise.resolve(),
      signUpWithEmail: () => Promise.resolve(),
      signOut: () => Promise.resolve(),
    };
  }
  return context;
}
