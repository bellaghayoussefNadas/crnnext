"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type CampaignFormState = { error?: string; success?: boolean; message?: string };

// Mock send email function
async function sendEmailChunk(contacts: {email: string}[], subject: string, body: string) {
  // In production, this would use nodemailer
  console.log(`Sending batch of ${contacts.length} emails: ${subject}`);
  return contacts.length; // Simulate all sent successfully
}

export async function createAndSendCampaignAction(_s: CampaignFormState, f: FormData): Promise<CampaignFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const name = f.get("name") as string;
  const subject = f.get("subject") as string;
  const body = f.get("body") as string;

  if (!name || !subject || !body) return { error: "Tous les champs sont requis" };

  // 1. Create the campaign in draft state
  const campaign = await prisma.campaign.create({
    data: { name, subject, body, status: "draft" }
  });

  // 2. Start the background sending process immediately (Non-blocking Next.js approach)
  processCampaignInBackground(campaign.id).catch(console.error);

  revalidatePath("/campaigns");
  return { success: true, message: "Campagne enregistrée. Envoi en cours..." };
}

export async function updateCampaignAction(id: string, _s: CampaignFormState, f: FormData): Promise<CampaignFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const name = f.get("name") as string;
  const subject = f.get("subject") as string;
  const body = f.get("body") as string;

  if (!name || !subject || !body) return { error: "Tous les champs sont requis" };

  await prisma.campaign.update({
    where: { id },
    data: { name, subject, body }
  });

  revalidatePath("/campaigns");
  return { success: true, message: "Campagne mise à jour" };
}

export async function reSendCampaignAction(id: string): Promise<CampaignFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return { error: "Campagne introuvable" };

  processCampaignInBackground(campaign.id).catch(console.error);

  revalidatePath("/campaigns");
  return { success: true, message: "Ré-envoi en cours..." };
}

async function processCampaignInBackground(campaignId: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "running" }
  });

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }});
  if (!campaign) return;

  const chunkSize = 50;
  let skip = 0;
  let totalSent = 0;
  let totalFailed = 0;

  try {
    while (true) {
      // Fetch chunk of contacts with emails
      const contacts = await prisma.contact.findMany({
        where: { email: { not: null } },
        select: { email: true },
        take: chunkSize,
        skip
      });

      if (contacts.length === 0) break;

      const validContacts = contacts.filter(c => c.email) as {email: string}[];

      try {
         // Simulate delay per chunk to prevent rate limits
         await new Promise(r => setTimeout(r, 1000));
         const sentCount = await sendEmailChunk(validContacts, campaign.subject, campaign.body);
         totalSent += sentCount;
      } catch (err) {
         totalFailed += validContacts.length;
         console.error("Failed to send chunk", err);
      }

      skip += chunkSize;
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "completed", sentAt: new Date(), totalSent, totalFailed }
    });

  } catch (error) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "cancelled", totalFailed }
    });
  }
}

export async function deleteCampaignAction(id: string) {
  await prisma.campaign.delete({ where: { id }});
  revalidatePath("/campaigns");
}
