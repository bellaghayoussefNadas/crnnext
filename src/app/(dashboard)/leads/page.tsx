import { prisma } from "@/lib/prisma";
import LeadsTable from "@/components/leads/LeadsTable";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads — NexCRM" };

export default async function LeadsPage() {
  const session = await getSession();
  const where = await getModuleWhere("leads", session);

  const leads = await prisma.lead.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return <LeadsTable leads={leads as any} />;
}
