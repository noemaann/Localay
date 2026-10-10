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
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
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
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-monsoon-200 bg-white py-2.5 text-sm font-semibold text-monsoon-800 hover:bg-monsoon-50 transition-colors"
        >
          <span>🌐</span> Continue with Google
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
