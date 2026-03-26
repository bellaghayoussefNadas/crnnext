"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Contact } from "@prisma/client";
import { createContactAction, deleteContactAction } from "@/app/actions/accounts";
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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type ContactWithAccount = Contact & {
  account: { name: string } | null;
};

function ContactForm({
  accounts,
  onClose,
}: {
  accounts: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(createContactAction, {});

  useEffect(() => {
    if (state?.success) {
      toast.success("Contact créé avec succès");
      onClose();
    }
    if (state?.error) toast.error(state.error);
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="accountId">Compte associé</Label>
        <select
          id="accountId"
          name="accountId"
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Aucun compte</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="position">Poste</Label>
        <Input id="position" name="position" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Créer
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
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

  const columns = [
    {
      key: "fullName",
      label: "Nom",
      sortable: true,
      render: (row: ContactWithAccount) => (
        <div>
          <p className="font-semibold text-foreground text-sm">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{row.email ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "position",
      label: "Poste",
      sortable: true,
      render: (row: ContactWithAccount) => row.position ?? "—",
    },
    {
      key: "accountName",
      label: "Compte",
      sortable: true,
      render: (row: ContactWithAccount) => row.account?.name ?? "—",
    },
    {
      key: "phone",
      label: "Téléphone",
      render: (row: ContactWithAccount) => row.phone ?? "—",
    },
    {
      key: "createdAt",
      label: "Créé le",
      sortable: true,
      render: (row: ContactWithAccount) => formatDate(row.createdAt),
    },
  ];

  const searchIndexableData = contacts.map((c) => ({
    ...c,
    fullName: `${c.firstName} ${c.lastName}`,
    accountName: c.account?.name ?? "",
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm">
            {contacts.length} contact{contacts.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Nouveau contact
            </Button>
          } />
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Nouveau contact</SheetTitle>
            </SheetHeader>
            <ContactForm accounts={accounts} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

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
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                onClick={() => {
                  if (confirm("Supprimer ce contact ?")) {
                    deleteContactAction(contact.id);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        }}
      />
    </div>
  );
}
