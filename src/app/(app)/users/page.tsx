import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      loginEvents: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { loginEvents: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">{users.length} {users.length === 1 ? "account" : "accounts"}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <Users className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Name</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Email</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Role</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Joined</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Last Login</th>
                <th className="text-right px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Total Logins</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isYou = user.email === session?.user?.email;
                const lastLogin = user.loginEvents[0]?.createdAt;
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.name ?? "—"}
                      {isYou && (
                        <span className="ml-2 text-xs font-bold uppercase tracking-wide px-1.5 py-0.5" style={{ background: "#f5c518", color: "#0d1b2a" }}>
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-2 py-0.5"
                        style={
                          user.role === "ADMIN"
                            ? { background: "#1a3a6e", color: "#fff" }
                            : { background: "#e5e7eb", color: "#374151" }
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {lastLogin ? formatDate(lastLogin) : <span className="text-gray-300">Never</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{user._count.loginEvents}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
