import { prisma } from "@/lib/prisma";
import InvoicesView from "@/components/invoices/InvoicesView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Factures — NexCRM" };

export default async function InvoicesPage() {
  const session = await getSession();
  const where = await getModuleWhere("sales", session);

  const [invoices, accounts, quotes] = await Promise.all([
    prisma.invoice.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      include: {
        account: { select: { name: true } },
        lines: true
      },
    }),
    prisma.account.findMany({
      where: where as any,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.quote.findMany({
      where: { ...(where as any), status: "accepted" },
      select: { id: true, number: true, title: true }
    })
  ]);

  return <InvoicesView invoices={invoices as any} accounts={accounts as any} quotes={quotes as any} />;
}
