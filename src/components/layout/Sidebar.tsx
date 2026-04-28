"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  WashingMachine,
  Wrench,
  Package,
  TrendingUp,
  DollarSign,
  Settings,
  Users,
  Truck,
  Briefcase,
  ChevronDown,
  ChevronRight,
  User,
  Factory,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buildings", label: "Buildings", icon: Building2 },
  { href: "/machines", label: "Machines", icon: WashingMachine },
  { href: "/service", label: "Service Records", icon: Wrench },
  { href: "/parts", label: "Parts", icon: Package },
  { href: "/parts-flow", label: "Parts Flow", icon: Layers },
  { href: "/vendors", label: "Vendors", icon: Truck },
  { href: "/deals", label: "Deals", icon: TrendingUp },
  { href: "/financials", label: "Financials", icon: DollarSign },
  { href: "/users", label: "Users", icon: Users },
];

const crmItems = [
  { href: "/companies", label: "Companies", icon: Factory },
  { href: "/owners", label: "Owners", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const onCrm = pathname.startsWith("/companies") || pathname.startsWith("/owners");
  const [crmOpen, setCrmOpen] = useState(onCrm);

  useEffect(() => {
    if (onCrm) setCrmOpen(true);
  }, [onCrm]);

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0" style={{ background: "#0d1b2a" }}>
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <WashingMachine className="h-6 w-6" style={{ color: "#f5c518" }} />
          <span className="font-black text-lg tracking-tight text-white uppercase">LaundryOS</span>
        </div>
        <p className="text-xs mt-0.5 font-medium uppercase tracking-widest" style={{ color: "#f5c518" }}>Machinery CRM</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors uppercase tracking-wide",
                active
                  ? "text-[#0d1b2a]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              style={active ? { background: "#f5c518", color: "#0d1b2a" } : {}}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* CRM section */}
        <div className="pt-1">
          <button
            onClick={() => setCrmOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors uppercase tracking-wide text-white/60 hover:text-white hover:bg-white/5"
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">CRM</span>
            {crmOpen
              ? <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          </button>

          {crmOpen && (
            <div className="ml-3 mt-0.5 space-y-0.5">
              {crmItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 pl-6 pr-3 py-2 text-sm font-semibold transition-colors uppercase tracking-wide",
                      active
                        ? "text-[#0d1b2a]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                    style={active ? { background: "#f5c518", color: "#0d1b2a" } : {}}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors uppercase tracking-wide",
            pathname.startsWith("/settings")
              ? "text-[#0d1b2a]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
          style={pathname.startsWith("/settings") ? { background: "#f5c518", color: "#0d1b2a" } : {}}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
