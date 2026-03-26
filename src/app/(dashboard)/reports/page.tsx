import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ReportsView from "@/components/reports/ReportsView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Rapports & Statistiques — NexCRM",
};

export default async function ReportsPage() {
  const session = await getSession();
  const where = await getModuleWhere("reports", session);

  const [deals, leads, accounts, stages] = await Promise.all([
    prisma.deal.findMany({ 
      where: where as any, 
      include: { stage: true }
    }),
    prisma.lead.findMany({ 
      where: where as any, 
      select: { id: true } 
    }),
    prisma.account.findMany({ 
      where: where as any, 
      select: { id: true } 
    }),
    prisma.pipelineStage.findMany({
      orderBy: { order: "asc" }
    })
  ]);

  return <ReportsView deals={deals as any} leads={leads as any} accounts={accounts as any} stages={stages as any} />;
}
