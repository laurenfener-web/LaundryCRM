"use server";

import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";

export async function signUp(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashed, name: name || null, role: "TECHNICIAN" },
  });

  return { success: true };
}
