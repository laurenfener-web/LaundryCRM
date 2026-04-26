"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

export function InviteButton() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/signup`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copyLink}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-black uppercase tracking-wide transition-colors"
      style={{ background: "#f5c518", color: "#0d1b2a" }}
    >
      <UserPlus className="h-4 w-4" />
      {copied ? "Link Copied!" : "Invite User"}
    </button>
  );
}
