import Link from "next/link";
import { WashingMachine, Wrench, Package, DollarSign, Building2, TrendingUp, ShieldCheck, BarChart3, ArrowRight, Zap } from "lucide-react";

const features = [
  {
    icon: WashingMachine,
    title: "Machine Tracking",
    body: "Every washer and dryer across every location — serial numbers, install dates, status, and full history in one place.",
    color: "#f5c518",
    number: "01",
  },
  {
    icon: Wrench,
    title: "Service Records",
    body: "Log every repair and maintenance visit. Know exactly what was done, by who, and what it cost.",
    color: "#4da6ff",
    number: "02",
  },
  {
    icon: Package,
    title: "Parts Catalog",
    body: "Track your parts inventory, unit costs, and usage across all machines. Never guess what you spent.",
    color: "#a78bfa",
    number: "03",
  },
  {
    icon: DollarSign,
    title: "Financial Overview",
    body: "See total cost per machine — purchase price, labor, and parts — all calculated automatically.",
    color: "#34d399",
    number: "04",
  },
  {
    icon: Building2,
    title: "Building Management",
    body: "Organize machines by location. Track owner contacts, address, and everything tied to each property.",
    color: "#fb923c",
    number: "05",
  },
  {
    icon: TrendingUp,
    title: "Deals Pipeline",
    body: "Manage your sales from prospecting to close. Attach line items, set close dates, track deal value.",
    color: "#f472b6",
    number: "06",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#060f1a", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(26,58,110,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(26,58,110,0.15) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Yellow glow behind hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{
        width: "800px", height: "500px",
        background: "radial-gradient(ellipse at center, rgba(245,197,24,0.12) 0%, transparent 70%)",
      }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(26,58,110,0.6)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: "#f5c518" }}>
            <WashingMachine className="h-5 w-5" style={{ color: "#060f1a" }} />
          </div>
          <span className="font-black text-xl tracking-tight uppercase text-white">LaundryOS</span>
          <span className="ml-2 px-2 py-0.5 text-xs font-black uppercase tracking-widest" style={{ background: "rgba(245,197,24,0.15)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.3)" }}>CRM</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}>
            Sign In
          </Link>
          <Link href="/signup" className="flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase tracking-wide" style={{ background: "#f5c518", color: "#060f1a" }}>
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-8 pt-24 pb-20 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Zap className="h-4 w-4" style={{ color: "#f5c518" }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#f5c518" }}>The operating system for laundry owners</span>
        </div>

        <h1 className="text-center font-black uppercase leading-none mb-8" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", letterSpacing: "-0.03em" }}>
          <span style={{ color: "#fff" }}>Stop Managing</span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, #f5c518 0%, #ffaa00 50%, #ff8c00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Your Machines</span>
          <br />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>in Spreadsheets</span>
        </h1>

        <p className="text-center text-lg leading-relaxed mb-12 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" }}>
          LaundryOS gives you a single dashboard to track every machine, service record, part, and dollar — across every building you operate. Built for people who run laundry, not software engineers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup" className="flex items-center gap-2 px-10 py-4 text-base font-black uppercase tracking-widest" style={{ background: "#f5c518", color: "#060f1a" }}>
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/login" className="px-10 py-4 text-base font-bold uppercase tracking-widest border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}>
            I Have an Account
          </Link>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative mx-auto max-w-4xl border" style={{ borderColor: "rgba(26,58,110,0.8)", background: "rgba(10,22,40,0.9)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,197,24,0.1)" }}>
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(26,58,110,0.6)", background: "rgba(6,15,26,0.8)" }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#f5c518" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
            </div>
            <div className="flex-1 mx-4 px-3 py-1 text-xs text-center" style={{ background: "rgba(26,58,110,0.4)", color: "rgba(255,255,255,0.3)" }}>
              app.laundryos.com/dashboard
            </div>
          </div>
          {/* Fake dashboard content */}
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Total Machines", value: "142", color: "#f5c518" },
                { label: "Service This Month", value: "$8,420", color: "#4da6ff" },
                { label: "Active Buildings", value: "23", color: "#34d399" },
                { label: "Open Deals", value: "$124k", color: "#a78bfa" },
              ].map((kpi) => (
                <div key={kpi.label} className="p-3 border" style={{ borderColor: "rgba(26,58,110,0.6)", background: "rgba(26,58,110,0.2)" }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{kpi.label}</p>
                  <p className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 border p-3" style={{ borderColor: "rgba(26,58,110,0.6)", background: "rgba(26,58,110,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Monthly Service Spend</p>
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1" style={{ height: `${h}%`, background: i === 11 ? "#f5c518" : "rgba(77,166,255,0.4)" }} />
                  ))}
                </div>
              </div>
              <div className="border p-3" style={{ borderColor: "rgba(26,58,110,0.6)", background: "rgba(26,58,110,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Recent Service</p>
                {["Washer #A12", "Dryer #B04", "Washer #C07"].map((m) => (
                  <div key={m} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "rgba(26,58,110,0.4)" }}>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{m}</span>
                    <span className="text-xs font-bold" style={{ color: "#34d399" }}>Done</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 border-y" style={{ borderColor: "rgba(26,58,110,0.4)", background: "linear-gradient(135deg, rgba(26,58,110,0.2) 0%, rgba(6,15,26,0.8) 100%)" }}>
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "100%", label: "Cost Visibility", sub: "per machine" },
            { value: "1", label: "Dashboard", sub: "for everything" },
            { value: "Real-time", label: "Financial Data", sub: "always current" },
            { value: "Zero", label: "Spreadsheets", sub: "needed" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", background: "linear-gradient(135deg, #f5c518, #ffaa00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</p>
              <p className="text-sm font-black uppercase tracking-wide text-white">{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 py-24 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#f5c518" }}>Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-none" style={{ letterSpacing: "-0.02em" }}>
            Built for the way<br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>operators actually work</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, body, color, number }) => (
            <div key={title} className="group relative p-6 border transition-all" style={{ borderColor: "rgba(26,58,110,0.5)", background: "rgba(10,22,40,0.8)" }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-4xl font-black" style={{ color: "rgba(255,255,255,0.06)", letterSpacing: "-0.05em" }}>{number}</span>
              </div>
              <h3 className="font-black uppercase tracking-wide text-sm text-white mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why section */}
      <section className="relative z-10 px-8 py-20" style={{ background: "linear-gradient(180deg, transparent, rgba(26,58,110,0.15), transparent)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, color: "#34d399", title: "Secure by Default", body: "Encrypted passwords, JWT sessions, and per-user access controls keep your data private." },
            { icon: BarChart3, color: "#4da6ff", title: "Financial Clarity", body: "True cost per machine calculated the moment you log a service record. No math required." },
            { icon: Building2, color: "#a78bfa", title: "Multi-Location Ready", body: "Run 1 building or 100. LaundryOS organizes everything by location automatically." },
          ].map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="flex flex-col gap-4 p-6 border" style={{ borderColor: "rgba(26,58,110,0.4)", background: "rgba(10,22,40,0.6)" }}>
              <div className="w-12 h-12 flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-wide text-sm text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-8 py-32 text-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(245,197,24,0.08) 0%, transparent 65%)" }} />
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Get started today</p>
        <h2 className="font-black uppercase leading-none mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}>
          Ready to take<br />
          <span style={{ background: "linear-gradient(135deg, #f5c518, #ffaa00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>control?</span>
        </h2>
        <p className="mb-10 max-w-sm mx-auto text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Sign up in 30 seconds. No credit card. No setup fees. Just a cleaner way to run your operation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="flex items-center gap-2 px-10 py-4 text-base font-black uppercase tracking-widest" style={{ background: "#f5c518", color: "#060f1a" }}>
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/login" className="px-10 py-4 text-base font-bold uppercase tracking-widest border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t px-8 py-8" style={{ borderColor: "rgba(26,58,110,0.4)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center" style={{ background: "#f5c518" }}>
              <WashingMachine className="h-3.5 w-3.5" style={{ color: "#060f1a" }} />
            </div>
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>LaundryOS</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>— Machinery CRM</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="text-xs font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.3)" }}>Sign In</Link>
            <Link href="/signup" className="text-xs font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.3)" }}>Sign Up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
