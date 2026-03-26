import { prisma } from "@/lib/prisma";
import CampaignsView from "@/components/campaigns/CampaignsView";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Campagnes — NexCRM" };

export default async function CampaignsPage() {
  const session = await getSession();
  const where = await getModuleWhere("campaigns", session);

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" }
  });

  const totalContacts = await prisma.contact.count({
    where: { email: { not: null } }
  });

  return <CampaignsView campaigns={campaigns as any} targetAudience={totalContacts} />;
}
