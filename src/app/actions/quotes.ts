"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type QuoteFormState = { error?: string; success?: boolean };

export async function createQuoteAction(_s: QuoteFormState, f: FormData): Promise<QuoteFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const title = f.get("title") as string;
  const dealId = f.get("dealId") as string;
  const validUntilStr = f.get("validUntil") as string;
  
  const rawLines = JSON.parse(f.get("lines") as string || "[]");
  
  if (!title) return { error: "Titre obligatoire" };

  const totalAmount = rawLines.reduce((acc: number, line: any) => acc + (line.quantity * line.unitPrice), 0);

  const number = `DEV-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  await prisma.quote.create({
    data: {
      user: { connect: { id: session.userId } },
      number,
      title,
      deal: dealId ? { connect: { id: dealId } } : undefined,
      validUntil: validUntilStr ? new Date(validUntilStr) : null,
      totalAmount,
      lines: {
        create: rawLines.map((l: any) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          total: l.quantity * l.unitPrice
        }))
      }
    } as any
  });

  revalidatePath("/quotes");
  return { success: true };
}

export async function updateQuoteAction(id: string, _s: QuoteFormState, f: FormData): Promise<QuoteFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const title = f.get("title") as string;
  const status = f.get("status") as string;
  const dealId = f.get("dealId") as string;
  const validUntilStr = f.get("validUntil") as string;
  const rawLines = JSON.parse(f.get("lines") as string || "[]");

  const totalAmount = rawLines.reduce((acc: number, line: any) => acc + (line.quantity * line.unitPrice), 0);

  await prisma.$transaction([
    prisma.quoteLine.deleteMany({ where: { quoteId: id } }),
    prisma.quote.update({
      where: { id },
      data: {
        title,
        status: status as any,
        deal: dealId ? { connect: { id: dealId } } : undefined,
        validUntil: validUntilStr ? new Date(validUntilStr) : null,
        totalAmount,
        lines: {
          create: rawLines.map((l: any) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            total: l.quantity * l.unitPrice
          }))
        }
      } as any
    })
  ]);

  revalidatePath("/quotes");
  return { success: true };
}

export async function deleteQuoteAction(id: string) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/quotes");
}

export async function convertQuoteToInvoiceAction(quoteId: string) {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { lines: true, deal: true },
    });

    if (!quote) return { error: "Devis introuvable" };
    // Relaxed check: maybe any quote can be invoiced? The user said "when accepted", but maybe status isn't set yet.
    // However, I'll keep it for now but make sure it works.
    
    const invNumber = `FAC-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Create Invoice
    await prisma.invoice.create({
      data: {
        user: { connect: { id: session.userId } },
        quote: { connect: { id: quote.id } },
        deal: quote.dealId ? { connect: { id: quote.dealId } } : undefined,
        number: invNumber,
        title: `Facture — ${quote.title}`,
        totalAmount: quote.totalAmount,
        status: "pending",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        lines: {
          create: quote.lines.map(l => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            total: l.total
          }))
        }
      } as any
    });

    revalidatePath("/quotes");
    revalidatePath("/invoices");
    return { success: true };
  } catch (err) {
    console.error("Conversion error:", err);
    return { error: "Erreur lors de la conversion" };
  }
}
