"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Invoice, InvoiceLine } from "@prisma/client";
import { createInvoiceAction, deleteInvoiceAction, markInvoicePaidAction } from "@/app/actions/invoices";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";

type InvoiceWithRelations = Invoice & {
  account: { name: string } | null;
  lines: InvoiceLine[];
};

function InvoiceForm({
  accounts,
  quotes,
  onClose,
}: {
  accounts: { id: string; name: string }[];
  quotes: { id: string; number: string; title: string }[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(createInvoiceAction, {});
  const [lines, setLines] = useState([{ description: "", quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    if (state?.success) { toast.success("Facture créée"); onClose(); }
    if (state?.error) toast.error(state.error);
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Titre *</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="accountId">Client</Label>
          <select id="accountId" name="accountId" required className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
             <option value="">Sélectionner un compte</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quoteId">Devis Origine (opt.)</Label>
          <select id="quoteId" name="quoteId" className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="">Aucun</option>
            {quotes.map((q) => <option key={q.id} value={q.id}>{q.number} - {q.title}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
         <Label htmlFor="dueDate">Date d'échéance</Label>
         <Input id="dueDate" name="dueDate" type="date" />
      </div>

      <div className="pt-4 border-t border-border mt-4">
        <Label className="mb-2 block font-semibold text-primary">Prestations</Label>
        <div className="space-y-2">
          {lines.map((line, idx) => (
             <div key={idx} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl border border-border/60">
                <Input 
                  placeholder="Désignation" value={line.description}
                  onChange={e => { const n = [...lines]; n[idx].description = e.target.value; setLines(n); }}
                  required
                />
                <div className="flex items-center gap-2">
                   <Input 
                      type="number" min="1" placeholder="Quantité" value={line.quantity}
                      onChange={e => { const n = [...lines]; n[idx].quantity = Number(e.target.value); setLines(n); }}
                      className="w-24"
                    />
                    <Input 
                      type="number" min="0" placeholder="Prix Unitaire" value={line.unitPrice}
                      onChange={e => { const n = [...lines]; n[idx].unitPrice = Number(e.target.value); setLines(n); }}
                      className="flex-1"
                    />
                     <Button type="button" variant="ghost" className="px-2 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => setLines(lines.filter((_, i) => i !== idx))} disabled={lines.length === 1}>
                        <Trash2 className="w-4 h-4" />
                     </Button>
                </div>
             </div>
          ))}
        </div>
        <Button 
          type="button" variant="outline" size="sm" 
          onClick={() => setLines([...lines, { description: "", quantity: 1, unitPrice: 0 }])}
          className="mt-3 w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter Ligne
        </Button>
      </div>

      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm mt-4">
        <span className="font-semibold text-muted-foreground">Total TTC</span>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
          {formatCurrency(lines.reduce((acc, l) => acc + (l.quantity * l.unitPrice), 0))}
        </span>
      </div>

      <Button type="submit" disabled={pending || lines.length===0} className="w-full h-11 text-base">
        {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Créer la facture
      </Button>
    </form>
  );
}

export default function InvoicesView({ invoices, accounts, quotes }: { invoices: InvoiceWithRelations[]; accounts: any[]; quotes: any[] }) {
  const [open, setOpen] = useState(false);

  const STATUS_BADGE: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400",
    sent: "bg-blue-500/20 text-blue-400",
    paid: "bg-green-500/20 text-green-400",
    overdue: "bg-red-500/20 text-red-500 animate-pulse",
  };
  const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", sent: "Envoyé", paid: "Payée", overdue: "En retard" };

  const columns = [
    { key: "number", label: "Facture N°", sortable: true, render: (r: InvoiceWithRelations) => <span className="font-mono text-xs">{r.number}</span> },
    { key: "account", label: "Client", sortable: true, render: (r: InvoiceWithRelations) => r.account?.name ?? "—" },
    { key: "totalAmount", label: "Montant", render: (r: InvoiceWithRelations) => <span className="font-bold">{formatCurrency(r.totalAmount)}</span> },
    { key: "status", label: "Statut", sortable: true, render: (r: InvoiceWithRelations) => <Badge className={`border-0 text-xs ${STATUS_BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</Badge> },
    { key: "dueDate", label: "Échéance", sortable: true, render: (r: InvoiceWithRelations) => formatDate(r.dueDate) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Factures</h1></div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Créer
            </Button>
          } />
          <SheetContent className="overflow-y-auto sm:max-w-md">
            <SheetHeader><SheetTitle>Nouvelle Facture</SheetTitle></SheetHeader>
            <InvoiceForm accounts={accounts} quotes={quotes} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <DataTable<InvoiceWithRelations>
        data={invoices}
        columns={columns as any}
        searchKeys={["number", "title"] as any}
        actions={(row) => {
          const inv = row as unknown as InvoiceWithRelations;
          return (
             <div className="flex items-center gap-1 justify-end">
                {inv.status !== "paid" && (
                  <Button variant="ghost" size="sm" onClick={() => markInvoicePaidAction(inv.id)} className="h-8 text-muted-foreground hover:text-green-400 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Payer
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { if(confirm("Supprimer fact ?")) deleteInvoiceAction(inv.id) }} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                   <Trash2 className="w-3.5 h-3.5" />
                </Button>
             </div>
          );
        }}
      />
    </div>
  )
}
