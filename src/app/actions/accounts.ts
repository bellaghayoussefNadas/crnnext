"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AccountSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export type AccountFormState = { error?: string; success?: boolean };

export async function createAccountAction(_s: AccountFormState, f: FormData): Promise<AccountFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };
  const parsed = AccountSchema.safeParse(Object.fromEntries(f.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await prisma.account.create({ data: { ...parsed.data, userId: session.userId } as any });
  revalidatePath("/accounts");
  return { success: true };
}

export async function updateAccountAction(id: string, _s: AccountFormState, f: FormData): Promise<AccountFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };
  const parsed = AccountSchema.safeParse(Object.fromEntries(f.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await prisma.account.update({ where: { id }, data: parsed.data });
  revalidatePath("/accounts");
  return { success: true };
}

export async function deleteAccountAction(id: string) {
  await prisma.account.delete({ where: { id } });
  revalidatePath("/accounts");
}

// ── Contacts ──────────────────────────────────────────────────────────────────

const ContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  accountId: z.string().optional(),
});

export async function createContactAction(_s: AccountFormState, f: FormData): Promise<AccountFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };
  const raw = Object.fromEntries(f.entries());
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  await prisma.contact.create({ data: { ...data, email: data.email || null, accountId: data.accountId || null, userId: session.userId } as any });
  revalidatePath("/contacts");
  return { success: true };
}

export async function updateContactAction(id: string, _s: AccountFormState, f: FormData): Promise<AccountFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };
  const raw = Object.fromEntries(f.entries());
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  await prisma.contact.update({ 
    where: { id },
    data: { ...data, email: data.email || null, accountId: data.accountId || null } 
  });
  revalidatePath("/contacts");
  return { success: true };
}

export async function deleteContactAction(id: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
}
