"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Contact } from "@prisma/client";
import { createContactAction, deleteContactAction, updateContactAction } from "@/app/actions/accounts";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { Loader2, Plus, Pencil, Trash2, UserPlus, Mail, Phone, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

type ContactWithAccount = Contact & {
  account: { name: string } | null;
};

function ContactForm({
  accounts,
  contact,
  onClose,
}: {
  accounts: { id: string; name: string }[];
  contact?: Contact;
  onClose: () => void;
}) {
  const action = contact ? updateContactAction.bind(null, contact.id) : createContactAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(contact ? "Contact mis à jour" : "Contact créé avec succès");
      onClose();
    }
    if (state?.error) toast.error(state.error);
  }, [state, onClose, contact]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prénom *</Label>
          <Input id="firstName" name="firstName" defaultValue={contact?.firstName} required className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom *</Label>
          <Input id="lastName" name="lastName" defaultValue={contact?.lastName} required className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input id="email" name="email" type="email" defaultValue={contact?.email || ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input id="phone" name="phone" defaultValue={contact?.phone || ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Compte associé</Label>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
          <select
            id="accountId"
            name="accountId"
            defaultValue={contact?.accountId || ""}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-transparent bg-muted/30 text-sm font-bold appearance-none focus:bg-background transition-all"
          >
            <option value="">Aucun compte lié</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="position" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Poste & Fonction</Label>
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input id="position" name="position" defaultValue={contact?.position || ""} className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notes Additionnelles</Label>
        <Textarea id="notes" name="notes" defaultValue={contact?.notes || ""} rows={3} className="rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all p-4" />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={pending} 
          className="flex-1 h-14 bg-primary rounded-2xl font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 italic tracking-widest uppercase"
        >
          {pending && <Loader2 className="w-4 h-4 mr-3 animate-spin" />}
          {contact ? "Mettre à jour" : "Créer la fiche"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="h-14 px-8 rounded-2xl font-black uppercase italic text-[10px] border-border/40">
          Annuler
        </Button>
      </div>
    </form>
  );
}

export default function ContactsView({
  contacts,
  accounts,
}: {
  contacts: ContactWithAccount[];
  accounts: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();

  const columns = [
    {
      key: "fullName",
      label: "IDENTITÉ",
      sortable: true,
      render: (row: ContactWithAccount) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary italic text-xs border border-primary/20">
             {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="font-black text-foreground italic uppercase tracking-tighter text-sm">
              {row.firstName} {row.lastName}
            </p>
            <div className="flex items-center gap-1.5 opacity-60">
               <Mail className="w-3 h-3" />
               <p className="text-[10px] font-bold text-muted-foreground lowercase">{row.email ?? "no-email@crm.com"}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "position",
      label: "POSTE",
      sortable: true,
      render: (row: ContactWithAccount) => (
        <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted/30 px-2 py-1 rounded-lg border border-border/40">
           {row.position || "—"}
        </span>
      ),
    },
    {
      key: "accountName",
      label: "ENTREPRISE",
      sortable: true,
      render: (row: ContactWithAccount) => (
        <div className="flex items-center gap-2">
           <Building2 className="w-3.5 h-3.5 text-primary/60" />
           <span className="font-bold text-xs uppercase tracking-tighter">{row.account?.name || "INDÉPENDANT"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "CONTACT",
      render: (row: ContactWithAccount) => (
        <div className="flex items-center gap-2">
           <Phone className="w-3.5 h-3.5 text-primary/60" />
           <span className="font-black text-xs italic">{row.phone || "—"}</span>
        </div>
      ),
    },
  ];

  const searchIndexableData = contacts.map((c) => ({
    ...c,
    fullName: `${c.firstName} ${c.lastName}`,
    accountName: c.account?.name ?? "",
  }));

  return (
    <div className="space-y-8 relative">
       <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 rounded-full px-3 py-0.5 border-dashed">RÉPERTOIRE</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 italic uppercase">
             Gestion des Contacts
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <UserPlus className="w-4 h-4 text-primary" />
             {contacts.length} fiches répertoriées
           </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button 
               onClick={() => { setEditingContact(undefined); setOpen(true); }}
               className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white uppercase italic tracking-widest"
            >
              <Plus className="w-5 h-5 mr-3" />
              Nouveau contact
            </Button>
          } />
          <SheetContent className="overflow-y-auto sm:max-w-xl">
            <SheetHeader className="pb-4 border-b border-border/40">
              <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">
                {editingContact ? "Modification Fiche" : "Nouveau Contact"}
              </SheetTitle>
            </SheetHeader>
            <ContactForm 
              accounts={accounts} 
              contact={editingContact}
              onClose={() => setOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="premium-card p-2 rounded-[2.5rem]">
        <DataTable<any>
          data={searchIndexableData}
          columns={columns as any}
          searchKeys={["fullName", "email", "accountName", "position"] as any}
          actions={(row) => {
            const contact = row as unknown as ContactWithAccount;
            return (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  onClick={() => {
                    setEditingContact(contact);
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
                    if (confirm("Archiver ce contact définitivement ?")) {
                      deleteContactAction(contact.id);
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
