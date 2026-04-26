import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { UserRow } from "./UserRow";
import { InviteButton } from "./InviteButton";

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
        <InviteButton />
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
                <th className="text-right px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Logins</th>
                <th className="text-right px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isYou={user.email === session?.user?.email}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
