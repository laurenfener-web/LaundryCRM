"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/buildings": "Buildings",
  "/machines": "Machines",
  "/service": "Service Records",
  "/parts": "Parts Catalog",
  "/deals": "Deals Pipeline",
  "/financials": "Financials",
  "/settings": "Settings",
};

interface TopBarProps {
  userEmail: string;
  logoutAction: () => Promise<void>;
}

export function TopBar({ userEmail, logoutAction }: TopBarProps) {
  const pathname = usePathname();
  const segment = "/" + pathname.split("/")[1];
  const title = titles[segment] ?? "LaundryOS";

  return (
    <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b-4" style={{ background: "#1a3a6e", borderBottomColor: "#f5c518" }}>
      <h1 className="text-base font-black text-white uppercase tracking-widest">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-xs text-white/70 hidden sm:block">{userEmail}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 border transition-colors"
            style={{ borderColor: "#f5c518", color: "#f5c518" }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
