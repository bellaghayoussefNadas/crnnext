"use client";

import { useActionState, useEffect, useState } from "react";
import { createLeadAction, updateLeadAction, deleteLeadAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Loader2, Plus, Pencil, Trash2, UserPlus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Lead } from "@prisma/client";

interface LeadsTableProps {
  leads: Lead[];
}

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  qualified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  unqualified: "bg-red-500/10 text-red-500 border-red-500/20",
  converted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  unqualified: "Non qualifié",
  converted: "Converti",
};

function LeadForm({
  lead,
  onClose,
}: {
  lead?: Lead;
  onClose: () => void;
}) {
  const action = lead
    ? updateLeadAction.bind(null, lead.id)
    : createLeadAction;

  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(lead ? "Lead mis à jour" : "Lead créé");
      onClose();
    }
    if (state?.error) toast.error(state.error);
  }, [state, lead, onClose]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prénom *</Label>
          <Input id="firstName" name="firstName" defaultValue={lead?.firstName} required className="h-11 rounded-xl bg-muted/30 border-transparent font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom *</Label>
          <Input id="lastName" name="lastName" defaultValue={lead?.lastName} required className="h-11 rounded-xl bg-muted/30 border-transparent font-bold" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Titre du poste / lead *</Label>
        <Input id="title" name="title" defaultValue={lead?.title} required className="h-11 rounded-xl bg-muted/30 border-transparent font-bold placeholder:italic" placeholder="Ex: Directeur Marketing" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={lead?.email ?? ""} className="h-11 rounded-xl bg-muted/30 border-transparent font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={lead?.phone ?? ""} className="h-11 rounded-xl bg-muted/30 border-transparent font-bold" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Société</Label>
          <Input id="company" name="company" defaultValue={lead?.company ?? ""} className="h-11 rounded-xl bg-muted/30 border-transparent font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut Commercial</Label>
          <select
            id="status"
            name="status"
            defaultValue={lead?.status ?? "new"}
            className="w-full h-11 rounded-xl border-transparent bg-muted/30 px-4 text-sm font-bold outline-none focus:bg-background transition-all"
          >
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes de qualification</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={lead?.notes ?? ""} className="rounded-xl bg-muted/30 border-transparent font-medium" />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={pending} className="flex-1 h-14 bg-primary rounded-2xl font-black text-white hover:scale-105 active:scale-95 transition-all">
          {pending && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
          {lead ? "Actualiser Lead" : "Lancer Prospection"}
        </Button>
      </div>
    </form>
  );
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [open, setOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | undefined>();

  const columns = [
    {
      key: "firstName",
      label: "IDENTITÉ",
      sortable: true,
      render: (row: Lead) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
            {row.firstName.charAt(0)}{row.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-black text-sm text-foreground italic uppercase tracking-tighter">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground/60">{row.email ?? "AUCUN EMAIL"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      label: "ENTREPRISE",
      sortable: true,
      render: (row: Lead) => (
        <span className="text-xs font-black text-foreground underline decoration-primary/20 underline-offset-4">{row.company ?? "—"}</span>
      ),
    },
    {
      key: "status",
      label: "STATUT",
      sortable: true,
      render: (row: Lead) => (
        <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-tighter border-dashed", STATUS_BADGE[row.status])}>
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "score",
      label: "POTENTIEL",
      sortable: true,
      render: (row: Lead) => (
        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 rounded-full bg-muted/50 overflow-hidden shadow-inner flex shrink-0">
            <div
              className="h-full rounded-full shimmer"
              style={{
                width: `${row.score}%`,
                background:
                  row.score >= 70
                    ? "oklch(0.65 0.18 145)"
                    : row.score >= 40
                    ? "oklch(0.72 0.18 80)"
                    : "oklch(0.65 0.22 30)",
              }}
            />
          </div>
          <span className="text-xs font-black italic">{row.score}%</span>
        </div>
      ),
    },
    {
      key: "value",
      label: "VALEUR",
      sortable: true,
      render: (row: Lead) => <span className="font-black text-sm text-primary italic">{formatCurrency(row.value)}</span>,
    },
    {
      key: "createdAt",
      label: "CRÉATION",
      sortable: true,
      render: (row: Lead) => <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-8 relative">
       {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[4000px] bg-primary/3 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-primary border-dashed font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">PROSPECTION</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">NexCRM Database Management</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase italic">
             Index des Leads
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <Filter className="w-4 h-4" />
             {leads.length} opportunités identifiées
           </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-border/40 hover:bg-muted/40 transition-all border-dashed">
              <Search className="w-4 h-4 mr-2" />
              Recherche avancée
           </Button>
           <Sheet open={open} onOpenChange={setOpen}>
             <SheetTrigger render={
               <Button
                 onClick={() => setEditLead(undefined)}
                 className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white uppercase italic"
               >
                 <UserPlus className="w-5 h-5 mr-3" />
                 Lancer Nouveau Lead
               </Button>
             } />
             <SheetContent className="overflow-y-auto sm:max-w-md">
               <SheetHeader className="pb-4 border-b border-border/40">
                 <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">Configuration Prospect</SheetTitle>
               </SheetHeader>
               <LeadForm key={editLead?.id ?? "new"} lead={editLead} onClose={() => setOpen(false)} />
             </SheetContent>
           </Sheet>
        </div>
      </div>

      <div className="premium-card p-2 rounded-[2.5rem]">
        <DataTable<Lead>
          data={leads}
          columns={columns as any}
          searchKeys={["firstName", "lastName", "email", "company"] as any}
          actions={(row) => {
            const lead = row as unknown as Lead;
            return (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  onClick={() => {
                    setEditLead(lead);
                    setOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                  onClick={() => {
                    if (confirm("Archiver ce lead définitivement ?")) deleteLeadAction(lead.id);
                  }}
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
