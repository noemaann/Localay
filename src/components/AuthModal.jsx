import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Google sign in error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is not enabled yet in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable Google.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized in Firebase Console > Authentication > Settings > Authorized domains.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Only one sign-in popup allowed at a time.");
      } else {
        setError(err.message || "Google sign-in failed. Please check your connection.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-monsoon-100 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-monsoon-100">
          <h2 id="auth-modal-title" className="text-lg font-bold text-monsoon-900">
            {isSignUp ? "Join LOCALAY Community" : "Sign In to Contribute"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="rounded-lg p-1 text-monsoon-800 hover:bg-monsoon-100"
          >
            ✕
          </button>
        </div>

        {isDemo && (
          <div className="my-3 rounded-lg bg-turmeric-400/15 border border-turmeric-400/30 p-2.5 text-xs text-monsoon-900">
            ⚡ <strong>Demo Mode Active:</strong> Clicking any button instantly logs you in with a demo contributor profile.
          </div>
        )}

        {error && (
          <div className="my-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-monsoon-800 mb-1">
                Your Name / Alias
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anas K."
                className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-monsoon-800 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-monsoon-800 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Signing in…" : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-monsoon-100" />
          <span className="text-xs text-monsoon-800/60">OR</span>
          <div className="h-px flex-1 bg-monsoon-100" />
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-monsoon-200 bg-white py-2.5 px-4 text-sm font-semibold text-monsoon-800 hover:bg-monsoon-50 hover:border-monsoon-300 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{submitting ? "Signing in with Google…" : "Continue with Google"}</span>
        </button>

        <p className="mt-4 text-center text-xs text-monsoon-800/80">
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsSignUp((s) => !s);
            }}
            className="font-semibold text-monsoon-600 underline underline-offset-2 hover:text-monsoon-800"
          >
            {isSignUp ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
