"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", { email, password, redirect: false });

      if (!res || res.error) {
        setPassword("");
        setError("Incorrect email or password. Please try again.");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setTimeout(() => passwordRef.current?.focus(), 50);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setPassword("");
      setError("Something went wrong. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }

    setLoading(false);
  }

  return (
    <div
      className="border-2 p-8 transition-transform"
      style={{
        borderColor: error ? "#ef4444" : "#1a3a6e",
        background: "#0f2238",
        animation: shake ? "shake 0.5s ease-in-out" : undefined,
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>

      <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6">Sign In</h2>

      {justRegistered && (
        <div className="mb-4 px-3 py-2 border-2 text-xs font-bold uppercase tracking-wide" style={{ borderColor: "#f5c518", color: "#f5c518" }}>
          Account created — sign in below.
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 border-2 text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.08)" }}>
          <span>✕</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-sm border-2 bg-transparent text-white outline-none transition-colors"
            style={{ borderColor: error ? "#ef4444" : "#1a3a6e" }}
            onFocus={(e) => (e.target.style.borderColor = "#f5c518")}
            onBlur={(e) => (e.target.style.borderColor = error ? "#ef4444" : "#1a3a6e")}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>
            Password
          </label>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border-2 bg-transparent text-white outline-none transition-colors"
            style={{ borderColor: error ? "#ef4444" : "#1a3a6e" }}
            onFocus={(e) => (e.target.style.borderColor = "#f5c518")}
            onBlur={(e) => (e.target.style.borderColor = error ? "#ef4444" : "#1a3a6e")}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-sm font-black uppercase tracking-widest transition-opacity disabled:opacity-50"
          style={{ background: "#f5c518", color: "#0d1b2a" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs" style={{ color: "#6b7280" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold" style={{ color: "#f5c518" }}>
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1b2a" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-block px-4 py-2 mb-4" style={{ background: "#f5c518" }}>
            <span className="text-xl font-black uppercase tracking-widest" style={{ color: "#0d1b2a" }}>
              LaundryOS
            </span>
          </div>
          <p className="text-sm uppercase tracking-widest font-bold" style={{ color: "#f5c518" }}>
            CRM Platform
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
