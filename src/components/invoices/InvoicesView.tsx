"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Invoice, InvoiceLine } from "@prisma/client";
import { createInvoiceAction, deleteInvoiceAction, markInvoicePaidAction, updateInvoiceAction } from "@/app/actions/invoices";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, Plus, Trash2, CheckCircle2, Receipt, Pencil, History, Building2, Calendar, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";

type InvoiceWithRelations = Invoice & {
  account: { name: string } | null;
  lines: InvoiceLine[];
};

const INVOICE_STATUS = [
  { value: "draft", label: "Brouillon", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  { value: "sent", label: "Envoyé", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "paid", label: "Payée", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "overdue", label: "En retard", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

function InvoiceForm({
  accounts,
  quotes,
  invoice,
  onClose,
}: {
  accounts: { id: string; name: string }[];
  quotes: { id: string; number: string; title: string }[];
  invoice?: InvoiceWithRelations;
  onClose: () => void;
}) {
  const action = invoice ? updateInvoiceAction.bind(null, invoice.id) : createInvoiceAction;
  const [state, formAction, pending] = useActionState(action, {});
  const [lines, setLines] = useState(invoice?.lines?.map(l => ({
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice
  })) || [{ description: "", quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    if (state?.success) { 
      toast.success(invoice ? "Facture mise à jour" : "Facture initialisée avec succès"); 
      onClose(); 
    }
    if (state?.error) toast.error(state.error);
  }, [state, onClose, invoice]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Objet de la Facture *</Label>
        <Input id="title" name="title" defaultValue={invoice?.title} required className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Destinataire</Label>
          <div className="relative">
             <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
             <select id="accountId" name="accountId" defaultValue={invoice?.accountId || ""} required className="w-full h-12 pl-12 pr-4 rounded-2xl border-transparent bg-muted/30 text-sm font-bold appearance-none focus:bg-background transition-all">
                <option value="">Sélectionner un compte</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
             </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date d'échéance</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : ""} className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Devis Source (Opt.)</Label>
          <select id="quoteId" name="quoteId" defaultValue={invoice?.quoteId || ""} className="w-full h-12 rounded-2xl border-transparent bg-muted/30 px-4 text-sm font-bold focus:bg-background transition-all outline-none">
            <option value="">Aucun</option>
            {quotes.map((q) => <option key={q.id} value={q.id}>{q.number} — {q.title}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut Paiement</Label>
          <select id="status" name="status" defaultValue={invoice?.status || "draft"} className="w-full h-12 rounded-2xl border-transparent bg-muted/30 px-4 text-sm font-bold focus:bg-background transition-all outline-none">
            {INVOICE_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-border/40">
        <div className="flex items-center justify-between mb-4">
           <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Plus className="w-3 h-3" /> Postes de facturation
           </Label>
           <Button 
            type="button" variant="outline" size="sm" 
            onClick={() => setLines([...lines, { description: "", quantity: 1, unitPrice: 0 }])}
            className="h-8 rounded-xl px-4 text-[10px] font-black uppercase border-dashed hover:bg-muted/40"
          >
            Ajouter Poste
          </Button>
        </div>
        
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {lines.map((line, idx) => (
            <div key={idx} className="flex gap-2 p-3 rounded-2xl bg-muted/20 border border-border/40 group/line">
              <div className="flex-1 space-y-2">
                <Input 
                  placeholder="Désignation de la prestation..." 
                  value={line.description}
                  onChange={e => {
                    const n = [...lines]; n[idx].description = e.target.value; setLines(n);
                  }}
                  required
                  className="h-10 border-transparent bg-muted/40 font-bold text-xs rounded-xl"
                />
                <div className="flex gap-2">
                   <div className="flex-1">
                      <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 ml-1 tracking-tighter">Qté</p>
                      <Input 
                        type="number" min="1"
                        value={line.quantity}
                        onChange={e => {
                          const n = [...lines]; n[idx].quantity = Number(e.target.value); setLines(n);
                        }}
                        className="h-9 border-transparent bg-muted/40 font-bold text-xs rounded-xl"
                      />
                   </div>
                   <div className="flex-[2]">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 ml-1 tracking-tighter">Prix Unitaire</p>
                    <Input 
                      type="number" min="0"
                      value={line.unitPrice}
                      onChange={e => {
                        const n = [...lines]; n[idx].unitPrice = Number(e.target.value); setLines(n);
                      }}
                      className="h-9 border-transparent bg-muted/40 font-bold text-xs rounded-xl"
                    />
                   </div>
                   <div className="flex items-end pb-0.5">
                      <Button
                        type="button" variant="ghost" size="sm"
                        onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        disabled={lines.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Montant Total HT</span>
        <span className="text-2xl font-black text-emerald-600 italic">
          {formatCurrency(lines.reduce((acc, l) => acc + (l.quantity * l.unitPrice), 0))}
        </span>
      </div>

      <Button type="submit" disabled={pending || lines.length === 0} className="w-full h-16 bg-primary rounded-[1.2rem] font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 italic tracking-widest uppercase">
        {pending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : null}
        {invoice ? "Mettre à jour la facture" : "Générer la Facture"}
      </Button>
    </form>
  );
}

export default function InvoicesView({ invoices, accounts, quotes }: { invoices: InvoiceWithRelations[]; accounts: any[]; quotes: any[] }) {
  const [open, setOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithRelations | undefined>();

  const columns = [
    {
      key: "number",
      label: "RÉFÉRENCE",
      sortable: true,
      render: (row: InvoiceWithRelations) => <span className="font-black text-xs text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/20 italic">{row.number}</span>,
    },
    {
      key: "title",
      label: "DÉSIGNATION",
      sortable: true,
      render: (row: InvoiceWithRelations) => (
        <div className="space-y-0.5">
          <p className="font-black text-sm text-foreground italic uppercase tracking-tighter leading-tight">{row.title}</p>
          <div className="flex items-center gap-1.5 opacity-60">
             <Building2 className="w-3 h-3" />
             <p className="text-[10px] font-bold text-muted-foreground uppercase">{row.account?.name ?? "CLIENT INCONNU"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUT",
      sortable: true,
      render: (row: InvoiceWithRelations) => {
        const s = INVOICE_STATUS.find(st => st.value === row.status);
        return (
          <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border-dashed", s?.color)}>
            {s?.label || row.status}
          </Badge>
        );
      },
    },
    {
      key: "totalAmount",
      label: "MONTANT",
      sortable: true,
      render: (row: InvoiceWithRelations) => <span className="font-black text-sm text-foreground italic">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      key: "dueDate",
      label: "ÉCHÉANCE",
      sortable: true,
      render: (row: InvoiceWithRelations) => (
        <div className="flex items-center gap-1.5 opacity-60">
           <Calendar className="w-3 h-3" />
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{formatDate(row.dueDate)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-500 border-dashed font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">FLUX FINANCIER</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/40 underline-offset-4 decoration-2">Registre de Facturation</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 italic uppercase">
             Gestion des Factures
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <FileText className="w-4 h-4 text-primary" />
             {invoices.length} factures enregistrées
           </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button 
               onClick={() => { setEditingInvoice(undefined); setOpen(true); }}
               className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white uppercase italic tracking-widest"
            >
              <Plus className="w-5 h-5 mr-3" />
              Créer Facture
            </Button>
          } />
          <SheetContent className="overflow-y-auto sm:max-w-xl">
            <SheetHeader className="pb-4 border-b border-border/40">
              <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">{editingInvoice ? "Édition Facture" : "Nouvelle Facture"}</SheetTitle>
            </SheetHeader>
            <InvoiceForm 
              accounts={accounts} 
              quotes={quotes} 
              invoice={editingInvoice}
              onClose={() => setOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="premium-card p-2 rounded-[2.5rem]">
        <DataTable<InvoiceWithRelations>
          data={invoices}
          columns={columns as any}
          searchKeys={["number", "title"] as any}
          actions={(row) => {
            const inv = row as unknown as InvoiceWithRelations;
            return (
              <div className="flex items-center gap-1 justify-end">
                {inv.status !== "paid" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-3 text-emerald-500 hover:bg-emerald-500/10 gap-2 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                    onClick={() => markInvoicePaidAction(inv.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter italic">Payer</span>
                  </Button>
                )}
                <Button
                  variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all"
                  onClick={() => generateInvoicePDF(inv)}
                  title="Télécharger PDF"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  onClick={() => { setEditingInvoice(inv); setOpen(true); }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                  onClick={() => { if (confirm("Archiver cette facture définitivement ?")) deleteInvoiceAction(inv.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
