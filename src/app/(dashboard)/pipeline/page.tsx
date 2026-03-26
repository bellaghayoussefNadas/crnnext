import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PipelineView from "@/components/pipeline/PipelineView";

export const metadata: Metadata = {
  title: "Pipeline Management — NexCRM",
};

export default async function PipelinePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const stages = await prisma.pipelineStage.findMany({
    orderBy: { order: "asc" },
  });

  return <PipelineView initialStages={stages as any} />;
}
