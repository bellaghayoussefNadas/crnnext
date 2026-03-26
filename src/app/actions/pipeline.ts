"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createStageAction(data: any) {
  const session = await getSession();
  if (session?.role !== "admin") return { error: "Non autorisé" };

  try {
    await prisma.pipelineStage.create({ data });
    revalidatePath("/pipeline");
    revalidatePath("/deals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: "Erreur lors de la création de l'étape" };
  }
}

export async function updateStageAction(id: string, data: any) {
  const session = await getSession();
  if (session?.role !== "admin") return { error: "Non autorisé" };

  try {
    await prisma.pipelineStage.update({ where: { id }, data });
    revalidatePath("/pipeline");
    revalidatePath("/deals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: "Erreur lors de la modification de l'étape" };
  }
}

export async function deleteStageAction(id: string) {
  const session = await getSession();
  if (session?.role !== "admin") return { error: "Non autorisé" };

  try {
    // Check if deals exist in this stage
    const count = await prisma.deal.count({ where: { stageId: id } });
    if (count > 0) return { error: "Impossible de supprimer une étape contenant des deals actifs." };

    await prisma.pipelineStage.delete({ where: { id } });
    revalidatePath("/pipeline");
    revalidatePath("/deals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: "Erreur lors de la suppression de l'étape" };
  }
}
