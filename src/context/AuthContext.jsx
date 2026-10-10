import { createContext, useContext, useEffect, useState } from "react";
import { authService, isDemoMode } from "../services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isDemo: isDemoMode,
    isModerator: user?.role === "admin" || user?.role === "moderator",
    isAdmin: user?.role === "admin",
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
      signInWithGoogle: () => Promise.resolve(),
      signInWithEmail: () => Promise.resolve(),
      signUpWithEmail: () => Promise.resolve(),
      signOut: () => Promise.resolve(),
    };
  }
  return context;
}
