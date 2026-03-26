import { prisma } from "@/lib/prisma";
import QuotesView from "@/components/quotes/QuotesView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Devis — NexCRM" };

export default async function QuotesPage() {
  const session = await getSession();
  const where = await getModuleWhere("sales", session);

  const [quotes, deals] = await Promise.all([
    prisma.quote.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      include: {
        deal: { select: { title: true } },
        lines: true
      },
    }),
    prisma.deal.findMany({
      where: where as any,
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    })
  ]);

  return <QuotesView quotes={quotes as any} deals={deals as any} />;
}
