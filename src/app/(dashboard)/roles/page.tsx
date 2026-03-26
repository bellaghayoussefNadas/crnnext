import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import RolesView from "@/components/users/RolesView";
import { getAllRolePermissions } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Gestion des Rôles — NexCRM",
};

export default async function RolesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const permissions = await getAllRolePermissions();

  return <RolesView initialPermissions={permissions} />;
}
