"use client";

import { useState } from "react";
import { updateRole, toggleActive, deleteUser } from "./actions";
import { formatDate } from "@/lib/utils";

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    active: boolean;
    createdAt: Date;
    loginEvents: { createdAt: Date }[];
    _count: { loginEvents: number };
  };
  isYou: boolean;
}

export function UserRow({ user, isYou }: UserRowProps) {
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.active);
  const [saving, setSaving] = useState(false);

  async function handleRole(newRole: string) {
    setSaving(true);
    setRole(newRole);
    await updateRole(user.id, newRole).catch(() => setRole(user.role));
    setSaving(false);
  }

  async function handleToggle() {
    setSaving(true);
    const next = !active;
    setActive(next);
    await toggleActive(user.id, next).catch(() => setActive(active));
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${user.email}? If they have records, they'll be deactivated instead.`)) return;
    setSaving(true);
    await deleteUser(user.id).catch(() => {});
    setSaving(false);
  }

  const lastLogin = user.loginEvents[0]?.createdAt;

  return (
    <tr className={`border-b border-gray-100 last:border-0 ${!active ? "opacity-50" : "hover:bg-gray-50"}`}>
      <td className="px-4 py-3 font-medium text-gray-900">
        {user.name ?? "—"}
        {isYou && (
          <span className="ml-2 text-xs font-bold uppercase tracking-wide px-1.5 py-0.5" style={{ background: "#f5c518", color: "#0d1b2a" }}>
            You
          </span>
        )}
        {!active && (
          <span className="ml-2 text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 bg-gray-200 text-gray-500">
            Inactive
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600">{user.email}</td>
      <td className="px-4 py-3">
        {isYou ? (
          <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5" style={{ background: "#1a3a6e", color: "#fff" }}>
            {role}
          </span>
        ) : (
          <select
            value={role}
            disabled={saving}
            onChange={(e) => handleRole(e.target.value)}
            className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 border-2 outline-none cursor-pointer disabled:opacity-50"
            style={{ borderColor: "#1a3a6e", color: "#1a3a6e" }}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>
        )}
      </td>
      <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3 text-gray-500">
        {lastLogin ? formatDate(lastLogin) : <span className="text-gray-300">Never</span>}
      </td>
      <td className="px-4 py-3 text-right text-gray-600">{user._count.loginEvents}</td>
      <td className="px-4 py-3 text-right">
        {!isYou && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleToggle}
              disabled={saving}
              className="text-xs font-bold uppercase tracking-wide px-2 py-1 border-2 transition-colors disabled:opacity-50"
              style={active
                ? { borderColor: "#d1d5db", color: "#6b7280" }
                : { borderColor: "#1a3a6e", color: "#1a3a6e" }}
            >
              {active ? "Deactivate" : "Reactivate"}
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-xs font-bold uppercase tracking-wide px-2 py-1 border-2 transition-colors disabled:opacity-50"
              style={{ borderColor: "#ef4444", color: "#ef4444" }}
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
