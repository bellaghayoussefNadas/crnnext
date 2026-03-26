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
  const dueDateStr = f.get("dueDate") as string;
  const rawLines = JSON.parse(f.get("lines") as string || "[]");
  
  if (!title) return { error: "Titre obligatoire" };

  const totalAmount = rawLines.reduce((acc: number, line: any) => acc + (line.quantity * line.unitPrice), 0);

  const number = `FAC-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  await prisma.invoice.create({
    data: {
      userId: session.userId,
      number,
      title,
      quoteId: quoteId || null,
      accountId: accountId || null,
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
