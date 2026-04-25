"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "./actions";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signUp(formData);
    if (result?.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    // Auto sign-in after successful registration
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      router.push("/login?registered=1");
    }
  }

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

        <div className="border-2 p-8" style={{ borderColor: "#1a3a6e", background: "#0f2238" }}>
          <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>
                Name
              </label>
              <input
                name="name"
                type="text"
                autoComplete="name"
                className="w-full px-3 py-2 text-sm border-2 bg-transparent text-white outline-none transition-colors"
                style={{ borderColor: "#1a3a6e" }}
                onFocus={(e) => (e.target.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.target.style.borderColor = "#1a3a6e")}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>
                Email
              </label>
              <input
                name="email"
                type="email"
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
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 text-sm border-2 bg-transparent text-white outline-none transition-colors"
                style={{ borderColor: "#1a3a6e" }}
                onFocus={(e) => (e.target.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.target.style.borderColor = "#1a3a6e")}
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>
                Confirm Password
              </label>
              <input
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs" style={{ color: "#6b7280" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-bold" style={{ color: "#f5c518" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
