import { prisma } from "@/lib/prisma";
import ActivitiesView from "@/components/activities/ActivitiesView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activités — NexCRM" };

export default async function ActivitiesPage() {
  const session = await getSession();
  const where = await getModuleWhere("activities", session);

  const activities = await prisma.activity.findMany({
    where: where as any,
    orderBy: { scheduledAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return <ActivitiesView activities={activities as any} />;
}
