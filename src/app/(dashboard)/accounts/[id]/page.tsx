import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AccountDetailView from "@/components/accounts/AccountDetailView";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      contacts: true,
      deals: true,
    },
  });

  if (!account) {
    notFound();
  }

  return (
    <div className="p-8">
      <AccountDetailView account={account as any} />
    </div>
  );
}
