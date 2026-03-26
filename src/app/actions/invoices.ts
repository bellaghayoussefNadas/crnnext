"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type InvoiceFormState = { error?: string; success?: boolean };

export async function createInvoiceAction(_s: InvoiceFormState, f: FormData): Promise<InvoiceFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const title = f.get("title") as string;
  const quoteId = f.get("quoteId") as string;
  const accountId = f.get("accountId") as string;
  const dealId = f.get("dealId") as string;
  const dueDateStr = f.get("dueDate") as string;
  const rawLines = JSON.parse(f.get("lines") as string || "[]");
  
  if (!title) return { error: "Titre obligatoire" };

  const totalAmount = rawLines.reduce((acc: number, line: any) => acc + (line.quantity * line.unitPrice), 0);

  const number = `FAC-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  await prisma.invoice.create({
    data: {
      user: { connect: { id: session.userId } },
      number,
      title,
      quote: quoteId ? { connect: { id: quoteId } } : undefined,
      account: accountId ? { connect: { id: accountId } } : undefined,
      deal: dealId ? { connect: { id: dealId } } : undefined,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
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

  revalidatePath("/invoices");
  return { success: true };
}

export async function updateInvoiceAction(id: string, _s: InvoiceFormState, f: FormData): Promise<InvoiceFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const title = f.get("title") as string;
  const status = f.get("status") as string;
  const quoteId = f.get("quoteId") as string;
  const accountId = f.get("accountId") as string;
  const dealId = f.get("dealId") as string;
  const dueDateStr = f.get("dueDate") as string;
  const rawLines = JSON.parse(f.get("lines") as string || "[]");

  const totalAmount = rawLines.reduce((acc: number, line: any) => acc + (line.quantity * line.unitPrice), 0);

  await prisma.$transaction([
    prisma.invoiceLine.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        title,
        status: status as any,
        quote: quoteId ? { connect: { id: quoteId } } : { disconnect: true },
        account: accountId ? { connect: { id: accountId } } : { disconnect: true },
        deal: dealId ? { connect: { id: dealId } } : { disconnect: true },
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
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

  revalidatePath("/invoices");
  return { success: true };
}

export async function deleteInvoiceAction(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
}

export async function markInvoicePaidAction(id: string) {
  await prisma.invoice.update({
    where: { id },
    data: { status: "paid", paidAt: new Date() }
  });
  revalidatePath("/invoices");
}

export async function createInvoiceFromDealAction(dealId: string) {
  const session = await getSession();
  if (!session) return { error: "Non autorisé" };

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { account: true }
  });

  if (!deal) return { error: "Opportunité introuvable" };

  const number = `FAC-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  await prisma.invoice.create({
    data: {
      user: { connect: { id: session.userId } },
      number,
      title: `Facture — ${deal.title}`,
      account: deal.accountId ? { connect: { id: deal.accountId } } : undefined,
      deal: { connect: { id: deal.id } },
      totalAmount: deal.amount,
      status: "draft",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lines: {
        create: [
          { description: deal.title, quantity: 1, unitPrice: deal.amount, total: deal.amount }
        ]
      }
    } as any
  });

  revalidatePath("/invoices");
  return { success: true };
}
