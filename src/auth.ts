import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/db/client"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = credentials.email as string | undefined
        const password = credentials.password as string | undefined
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null
        if (!(await bcrypt.compare(password, user.password))) return null
        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as { role?: string }).role = token.role as string
      return session
    },
    authorized: authConfig.callbacks!.authorized,
  },
  session: { strategy: "jwt" },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.loginEvent.create({ data: { userId: user.id } }).catch(() => {});
      }
    },
  },
})
