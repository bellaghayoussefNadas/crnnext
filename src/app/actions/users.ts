"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const UserSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").optional().or(z.literal("")),
  role: z.enum(["admin", "agent"]),
});

export type UserFormState = { error?: string; success?: boolean };

export async function createUserAction(_s: UserFormState, f: FormData): Promise<UserFormState> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Accès refusé" };

  const raw = Object.fromEntries(f.entries());
  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  if (!data.password) return { error: "Mot de passe requis pour un nouvel utilisateur" };

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return { error: "Cet email est déjà utilisé" };

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      password: hashedPassword,
    },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function updateUserAction(id: string, _s: UserFormState, f: FormData): Promise<UserFormState> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Accès refusé" };

  const raw = Object.fromEntries(f.entries());
  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUserAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Accès refusé");
  
  if (id === session.userId) throw new Error("Vous ne pouvez pas supprimer votre propre compte");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
