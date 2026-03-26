"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { calculateLeadScore } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LeadSchema = z.object({
  title: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "unqualified", "converted"]).default("new"),
  score: z.coerce.number().min(0).max(100).optional(),
  value: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export type LeadFormState = { error?: string; success?: boolean };

export async function createLeadAction(
  _state: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  const score = data.score !== undefined && data.score > 0
    ? data.score
    : calculateLeadScore({
        email: data.email,
        phone: data.phone,
        company: data.company,
        notes: data.notes,
        value: data.value,
      });

  await prisma.lead.create({
    data: {
      ...data,
      email: data.email || null,
      score,
      userId: session.userId,
    },
  });

  revalidatePath("/leads");
  return { success: true };
}

export async function updateLeadAction(
  id: string,
  _state: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  const score = data.score !== undefined && data.score > 0
    ? data.score
    : calculateLeadScore({
        email: data.email,
        phone: data.phone,
        company: data.company,
        notes: data.notes,
        value: data.value,
      });

  await prisma.lead.update({
    where: { id },
    data: { ...data, email: data.email || null, score },
  });

  revalidatePath("/leads");
  return { success: true };
}

export async function deleteLeadAction(id: string) {
  const session = await getSession();
  if (!session) return;
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
}
