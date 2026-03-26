import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/deals/KanbanBoard";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pipeline des ventes — NexCRM" };

export default async function DealsPage() {
  const session = await getSession();
  const where = await getModuleWhere("deals", session);

  const [deals, stages] = await Promise.all([
    prisma.deal.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      include: { account: true, stage: true },
    }),
    prisma.pipelineStage.findMany({
      orderBy: { order: "asc" }
    })
  ]);

  return <KanbanBoard initialDeals={deals as any} initialStages={stages as any} />;
}
