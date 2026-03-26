"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type SettingsFormState = { error?: string; success?: boolean; message?: string };

export async function saveSettingsAction(_s: SettingsFormState, f: FormData): Promise<SettingsFormState> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Accès refusé" };

  const companyName = f.get("companyName") as string;
  const companyEmail = f.get("companyEmail") as string;
  const currency = f.get("currency") as string;

  await prisma.$transaction([
    prisma.settings.upsert({
      where: { key: "companyName" }, update: { value: companyName }, create: { key: "companyName", value: companyName }
    }),
    prisma.settings.upsert({
      where: { key: "companyEmail" }, update: { value: companyEmail }, create: { key: "companyEmail", value: companyEmail }
    }),
    prisma.settings.upsert({
      where: { key: "currency" }, update: { value: currency }, create: { key: "currency", value: currency }
    })
  ]);

  revalidatePath("/settings");
  return { success: true, message: "Paramètres sauvegardés" };
}
