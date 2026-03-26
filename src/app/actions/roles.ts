"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateRolePermissionsAction(permissions: Record<string, any>) {
  const session = await getSession();
  if (session?.role !== "admin") return { error: "Non autorisé" };

  try {
    await prisma.settings.upsert({
      where: { key: "role_permissions" },
      update: { value: JSON.stringify(permissions) },
      create: { key: "role_permissions", value: JSON.stringify(permissions) },
    });

    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update perms:", error);
    return { error: "Erreur lors de la mise à jour" };
  }
}
