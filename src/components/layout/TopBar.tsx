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
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
