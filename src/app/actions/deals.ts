"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DealSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().min(0).default(0),
  probability: z.coerce.number().min(0).max(100).optional(),
  stageId: z.string().optional(),
  notes: z.string().optional(),
  accountId: z.string().optional(),
});

export type DealFormState = { error?: string; success?: boolean };

export async function createDealAction(
  _state: DealFormState,
  formData: FormData
): Promise<DealFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = DealSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  await prisma.deal.create({
    data: {
      ...data,
      probability: data.probability ?? 20,
      accountId: data.accountId || null,
      userId: session.userId,
    } as any,
  });

  revalidatePath("/deals");
  return { success: true };
}

export async function updateDealStageAction(id: string, stageId: string) {
  await prisma.deal.update({
    where: { id },
    data: {
      stageId,
    } as any,
  });
  revalidatePath("/deals");
}

export async function updateDealAction(
  id: string,
  _state: DealFormState,
  formData: FormData
): Promise<DealFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = DealSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  await prisma.deal.update({
    where: { id },
    data: {
      ...data,
      probability: data.probability ?? 20,
      accountId: data.accountId || null,
    } as any,
  });

  revalidatePath("/deals");
  return { success: true };
}

export async function deleteDealAction(id: string) {
  await prisma.deal.delete({ where: { id } });
  revalidatePath("/deals");
}
