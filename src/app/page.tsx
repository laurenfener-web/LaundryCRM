import Link from "next/link";
import { WashingMachine, Wrench, Package, DollarSign, Building2, TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: WashingMachine,
    title: "Machine Tracking",
    body: "Every washer and dryer in every location — serial numbers, install dates, status, and full history in one place.",
  },
  {
    icon: Wrench,
    title: "Service Records",
    body: "Log every repair and maintenance visit. Know exactly what was done, by who, and what it cost.",
  },
  {
    icon: Package,
    title: "Parts Catalog",
    body: "Track your parts inventory, unit costs, and usage across all machines. Never guess what you spent.",
  },
  {
    icon: DollarSign,
    title: "Financial Overview",
    body: "See total cost per machine — purchase price, labor, and parts — all calculated automatically.",
  },
  {
    icon: Building2,
    title: "Building Management",
    body: "Organize machines by location. Track owner contacts, address, and everything tied to each property.",
  },
  {
    icon: TrendingUp,
    title: "Deals Pipeline",
    body: "Manage your sales pipeline from prospecting to close. Attach line items and track deal value.",
  },
];

const stats = [
  { value: "100%", label: "Cost Visibility" },
  { value: "1 place", label: "All Your Machines" },
  { value: "Real-time", label: "Financial Data" },
  { value: "0 spreadsheets", label: "Required" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#0d1b2a", color: "#fff" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b-4" style={{ borderBottomColor: "#f5c518" }}>
        <div className="flex items-center gap-2">
          <WashingMachine className="h-6 w-6" style={{ color: "#f5c518" }} />
          <span className="font-black text-lg tracking-tight uppercase text-white">LaundryOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-bold uppercase tracking-wide border-2 transition-colors"
            style={{ borderColor: "#f5c518", color: "#f5c518" }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors"
            style={{ background: "#f5c518", color: "#0d1b2a" }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-24 max-w-5xl mx-auto text-center">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-black uppercase tracking-widest border-2" style={{ borderColor: "#f5c518", color: "#f5c518" }}>
          Built for Laundry Operators
        </div>
        <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-6" style={{ letterSpacing: "-0.02em" }}>
          Stop Managing Your
          <br />
          <span style={{ color: "#f5c518" }}>Machines in Spreadsheets</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          LaundryOS is the CRM built specifically for laundry equipment owners.
          Track every machine, service record, part, and dollar — across every building you operate.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 text-base font-black uppercase tracking-widest transition-opacity"
            style={{ background: "#f5c518", color: "#0d1b2a" }}
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 text-base font-black uppercase tracking-widest border-2 transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y-2 py-10" style={{ borderColor: "#1a3a6e", background: "#0f2238" }}>
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black" style={{ color: "#f5c518" }}>{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black uppercase" style={{ color: "#fff" }}>
            Everything in <span style={{ color: "#f5c518" }}>One Dashboard</span>
          </h2>
          <p className="text-white/50 mt-3 text-sm uppercase tracking-widest">No more juggling apps, spreadsheets, and paper records</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-2 p-6" style={{ borderColor: "#1a3a6e", background: "#0f2238" }}>
              <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ background: "#f5c518" }}>
                <Icon className="h-5 w-5" style={{ color: "#0d1b2a" }} />
              </div>
              <h3 className="font-black uppercase tracking-wide text-sm text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t-2 py-16 px-8" style={{ borderColor: "#1a3a6e", background: "#0f2238" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Secure by Default", body: "Every account is protected with encrypted passwords and session-based authentication." },
            { icon: BarChart3, title: "Financial Clarity", body: "Know the true cost of every machine the moment you log a service record." },
            { icon: Building2, title: "Multi-Location Ready", body: "Run 1 building or 100 — LaundryOS scales with your operation." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 flex items-center justify-center border-2" style={{ borderColor: "#f5c518" }}>
                <Icon className="h-4 w-4" style={{ color: "#f5c518" }} />
              </div>
              <div>
                <p className="font-black uppercase tracking-wide text-xs text-white mb-1">{title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 py-24 text-center">
        <h2 className="text-4xl font-black uppercase mb-4">
          Ready to take <span style={{ color: "#f5c518" }}>control?</span>
        </h2>
        <p className="text-white/50 mb-10 max-w-md mx-auto">
          Sign up in 30 seconds. No credit card. No setup fees. Just a cleaner way to run your laundry operation.
        </p>
        <Link
          href="/signup"
          className="inline-block px-10 py-4 text-base font-black uppercase tracking-widest"
          style={{ background: "#f5c518", color: "#0d1b2a" }}
        >
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t-2 px-8 py-6 flex items-center justify-between" style={{ borderColor: "#1a3a6e" }}>
        <div className="flex items-center gap-2">
          <WashingMachine className="h-4 w-4" style={{ color: "#f5c518" }} />
          <span className="text-xs font-black uppercase tracking-widest text-white/40">LaundryOS</span>
        </div>
        <div className="flex gap-6">
          <Link href="/login" className="text-xs font-bold uppercase tracking-wide text-white/40 hover:text-white/70">Sign In</Link>
          <Link href="/signup" className="text-xs font-bold uppercase tracking-wide text-white/40 hover:text-white/70">Sign Up</Link>
        </div>
      </footer>

    </div>
  );
}
