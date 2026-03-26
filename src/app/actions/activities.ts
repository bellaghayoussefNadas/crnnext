"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ActivitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note"]),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  accountId: z.string().optional(),
});

export type ActivityFormState = { error?: string; success?: boolean };

export async function createActivityAction(
  _state: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = ActivitySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  await prisma.activity.create({
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      leadId: data.leadId || null,
      contactId: data.contactId || null,
      accountId: data.accountId || null,
      userId: session.userId,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function updateActivityAction(
  id: string,
  _state: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = ActivitySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  await prisma.activity.update({
    where: { id },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      leadId: data.leadId || null,
      contactId: data.contactId || null,
      accountId: data.accountId || null,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function toggleActivityDoneAction(id: string, isDone: boolean) {
  await prisma.activity.update({
    where: { id },
    data: {
      isDone,
      doneAt: isDone ? new Date() : null,
    },
  });
  revalidatePath("/activities");
}

export async function deleteActivityAction(id: string) {
  await prisma.activity.delete({ where: { id } });
  revalidatePath("/activities");
}
