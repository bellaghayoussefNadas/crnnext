import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import AccountsView from "@/components/accounts/AccountsView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";

export const metadata: Metadata = { title: "Comptes — NexCRM" };

export default async function AccountsPage() {
  const session = await getSession();
  const where = await getModuleWhere("accounts", session);

  const accounts = await prisma.account.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { contacts: true, deals: true } },
    },
  });
  return <AccountsView accounts={accounts as any} />;
}
