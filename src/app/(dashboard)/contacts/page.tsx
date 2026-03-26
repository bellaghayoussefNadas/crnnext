import { prisma } from "@/lib/prisma";
import ContactsView from "@/components/contacts/ContactsView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contacts — NexCRM" };

export default async function ContactsPage() {
  const session = await getSession();
  const where = await getModuleWhere("accounts", session); // Uses accounts permission

  const [contacts, accounts] = await Promise.all([
    prisma.contact.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      include: { account: { select: { name: true } } },
    }),
    prisma.account.findMany({
      where: where as any,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <ContactsView contacts={contacts as any} accounts={accounts as any} />;
}
