import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./utils";

export function generateQuotePDF(quote: any) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [37, 99, 235]; // #2563eb

  // Header - Company Info
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("DEVIS", 140, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text("VOTRE ENTREPRISE S.A.R.L", 15, 20);
  doc.text("123 Avenue de l'Innovation", 15, 25);
  doc.text("75001 Paris, France", 15, 30);
  doc.text("contact@votre-entreprise.com", 15, 35);

  // Quote Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Référence : ${quote.number}`, 140, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date : ${formatDate(quote.createdAt)}`, 140, 40);
  doc.text(`Valide jusqu'au : ${formatDate(quote.validUntil)}`, 140, 45);

  // Client Info (using account if available)
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 55, 195, 55);
  doc.setFont("helvetica", "bold");
  doc.text("DESTINATAIRE", 15, 65);
  doc.setFont("helvetica", "normal");
  doc.text(quote.account?.name || "Client Particulier", 15, 72);
  doc.text(quote.account?.address || "", 15, 78);
  doc.text(quote.account?.city || "", 15, 84);

  // Table
  autoTable(doc, {
    startY: 95,
    head: [["Description", "Quantité", "Prix Unitaire", "Total"]],
    body: quote.lines.map((l: any) => [
      l.description,
      l.quantity,
      formatCurrency(l.unitPrice),
      formatCurrency(l.total)
    ]),
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 95 },
  });

  // Footer Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL TTC : ${formatCurrency(quote.totalAmount)}`, 140, finalY);

  doc.save(`Devis_${quote.number}.pdf`);
}

export function generateInvoicePDF(invoice: any) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [16, 185, 129]; // emerald-500

  // Header - Company Info
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("FACTURE", 140, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text("VOTRE ENTREPRISE S.A.R.L", 15, 20);
  doc.text("123 Avenue de l'Innovation", 15, 25);
  doc.text("75001 Paris, France", 15, 30);
  doc.text("contact@votre-entreprise.com", 15, 35);

  // Invoice Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`N° Facture : ${invoice.number}`, 140, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date : ${formatDate(invoice.createdAt)}`, 140, 40);
  doc.text(`Échéance : ${formatDate(invoice.dueDate)}`, 140, 45);

  // Client Info
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 55, 195, 55);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À", 15, 65);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.account?.name || "Client Particulier", 15, 72);
  doc.text(invoice.account?.address || "", 15, 78);
  doc.text(invoice.account?.city || "", 15, 84);

  // Table
  autoTable(doc, {
    startY: 95,
    head: [["Prestation", "Quantité", "P.U HT", "Total HT"]],
    body: invoice.lines.map((l: any) => [
      l.description,
      l.quantity,
      formatCurrency(l.unitPrice),
      formatCurrency(l.total)
    ]),
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    margin: { top: 95 },
  });

  // Footer Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`TOTAL NET À PAYER : ${formatCurrency(invoice.totalAmount)}`, 120, finalY);

  // Custom condition for status
  if (invoice.status === "paid") {
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(30);
    doc.text("PAYÉE", 20, finalY + 15, { angle: 15 });
  }

  doc.save(`Facture_${invoice.number}.pdf`);
}
