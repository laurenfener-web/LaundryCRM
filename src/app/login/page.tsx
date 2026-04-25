"use client";

import { useState } from "react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="border-2 p-8" style={{ borderColor: "#1a3a6e", background: "#0f2238" }}>
      <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6">Sign In</h2>

      {justRegistered && (
        <div className="mb-4 px-3 py-2 border-2 text-xs font-bold uppercase tracking-wide" style={{ borderColor: "#f5c518", color: "#f5c518" }}>
          Account created — sign in below.
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
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-sm border-2 bg-transparent text-white outline-none transition-colors"
            style={{ borderColor: "#1a3a6e" }}
            onFocus={(e) => (e.target.style.borderColor = "#f5c518")}
            onBlur={(e) => (e.target.style.borderColor = "#1a3a6e")}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border-2 bg-transparent text-white outline-none transition-colors"
            style={{ borderColor: "#1a3a6e" }}
            onFocus={(e) => (e.target.style.borderColor = "#f5c518")}
            onBlur={(e) => (e.target.style.borderColor = "#1a3a6e")}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

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
