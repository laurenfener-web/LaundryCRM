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

export function TopBar() {
  const pathname = usePathname();
  const segment = "/" + pathname.split("/")[1];
  const title = titles[segment] ?? "LaundryOS";

  return (
    <header className="h-14 flex items-center px-6 shrink-0 border-b-4" style={{ background: "#1a3a6e", borderBottomColor: "#f5c518" }}>
      <h1 className="text-base font-black text-white uppercase tracking-widest">{title}</h1>
    </header>
  );
}
