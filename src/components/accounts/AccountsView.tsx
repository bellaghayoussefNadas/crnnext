"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Account, Contact, Deal } from "@prisma/client";
import { createAccountAction, updateAccountAction, deleteAccountAction } from "@/app/actions/accounts";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, Plus, Pencil, Trash2, Building2, Globe, Phone, MapPin, Briefcase, ExternalLink, Users, PieChart } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

type AccountWithCounts = Account & {
  _count: { contacts: number; deals: number };
};

function AccountForm({
  account,
  onClose,
}: {
  account?: AccountWithCounts;
  onClose: () => void;
}) {
  const action = account ? updateAccountAction.bind(null, account.id) : createAccountAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(account ? "Compte actualisé" : "Compte créé avec succès");
      onClose();
    }
    if (state?.error) toast.error(state.error);
  }, [state, account, onClose]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dénomination Sociale *</Label>
        <Input id="name" name="name" defaultValue={account?.name} required className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secteur d'Activité</Label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input id="industry" name="industry" defaultValue={account?.industry ?? ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Site Internet</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input id="website" name="website" type="url" defaultValue={account?.website ?? ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Standard Téléphonique</Label>
          <div className="relative">
             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
             <Input id="phone" name="phone" defaultValue={account?.phone ?? ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ville</Label>
          <div className="relative">
             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
             <Input id="city" name="city" defaultValue={account?.city ?? ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse Siège Social</Label>
        <Input id="address" name="address" defaultValue={account?.address ?? ""} className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold" />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notes Collaboratives</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={account?.notes ?? ""} className="rounded-2xl bg-muted/30 border-transparent font-medium p-4 focus:bg-background transition-all" />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={pending} 
          className="flex-1 h-14 bg-primary rounded-2xl font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 italic tracking-widest uppercase"
        >
          {pending && <Loader2 className="w-4 h-4 mr-3 animate-spin" />}
          {account ? "Actualiser le Compte" : "Créer le Compte Professionnel"}
        </Button>
      </div>
    </form>
  );
}

export default function AccountsView({ accounts }: { accounts: AccountWithCounts[] }) {
  const [open, setOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountWithCounts | undefined>();

  const columns = [
    {
      key: "name",
      label: "ENTREPRISE",
      sortable: true,
      render: (row: AccountWithCounts) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1rem] bg-primary/10 flex items-center justify-center font-black text-primary italic text-sm border border-primary/20">
             {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <Link href={`/accounts/${row.id}`} className="font-black text-foreground italic uppercase tracking-tighter text-sm hover:text-primary transition-colors flex items-center gap-1.5 group/link">
              {row.name}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all -translate-x-1 group-hover/link:translate-x-0" />
            </Link>
            <div className="flex items-center gap-1.5 opacity-60">
              <Globe className="w-3 h-3" />
              <p className="text-[10px] font-bold text-muted-foreground lowercase truncate max-w-[150px]">{row.website ?? "no-website.com"}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "industry",
      label: "SECTEUR",
      sortable: true,
      render: (row: AccountWithCounts) => (
        <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted/30 px-2 py-1 rounded-lg border border-border/40">
           {row.industry || "N/A"}
        </span>
      ),
    },
    {
      key: "city",
      label: "LOCALISATION",
      sortable: true,
      render: (row: AccountWithCounts) => (
        <div className="flex items-center gap-2">
           <MapPin className="w-3.5 h-3.5 text-primary/60" />
           <span className="font-bold text-xs uppercase tracking-tighter">{row.city || "—"}</span>
        </div>
      ),
    },
    {
      key: "stats",
      label: "VOLUME",
      render: (row: AccountWithCounts) => (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
             <Users className="w-3.5 h-3.5 text-primary/60" />
             <span className="text-xs font-black italic">{row._count.contacts}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <PieChart className="w-3.5 h-3.5 text-primary/60" />
             <span className="text-xs font-black italic">{row._count.deals}</span>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "MEMBRE DEPUIS",
      sortable: true,
      render: (row: AccountWithCounts) => (
        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
       <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-primary border-dashed font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">ÉCOSYSTÈME CLIENT</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/40 underline-offset-4 decoration-2">Portefeuille Entreprises</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 italic uppercase">
             Gestion des Comptes
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <Building2 className="w-4 h-4 text-primary" />
             {accounts.length} entités répertoriées
           </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button
              onClick={() => { setEditAccount(undefined); setOpen(true); }}
              className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white uppercase italic tracking-widest"
            >
              <Plus className="w-5 h-5 mr-3" />
              Nouveau Compte
            </Button>
          } />
          <SheetContent className="overflow-y-auto sm:max-w-xl">
            <SheetHeader className="pb-4 border-b border-border/40">
              <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">
                {editAccount ? "Révision du Compte" : "Identification Entité"}
              </SheetTitle>
            </SheetHeader>
            <AccountForm key={editAccount?.id ?? "new"} account={editAccount} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="premium-card p-2 rounded-[2.5rem]">
        <DataTable<AccountWithCounts>
          data={accounts}
          columns={columns as any}
          searchKeys={["name", "industry", "city"] as any}
          actions={(row) => {
            const acc = row as unknown as AccountWithCounts;
            return (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  onClick={() => {
                    setEditAccount(acc);
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
                    if (confirm("Supprimer ce compte et toutes ses données liées ?")) {
                      deleteAccountAction(acc.id);
                    }
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
