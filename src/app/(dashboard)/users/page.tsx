import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import UsersView from "@/components/users/UsersView";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs — NexCRM",
};

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { leads: true, deals: true }
      }
    }
  });

  return <UsersView users={users as any} />;
}
