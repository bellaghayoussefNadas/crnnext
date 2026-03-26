"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Account, Contact, Deal } from "@prisma/client";
import { createAccountAction, updateAccountAction, deleteAccountAction } from "@/app/actions/accounts";
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
  const action = account
    ? updateAccountAction.bind(null, account.id)
    : createAccountAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(account ? "Compte mis à jour" : "Compte créé");
      onClose();
    }
    if (state?.error) toast.error(state.error);
  }, [state, account, onClose]);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
        <Input id="name" name="name" defaultValue={account?.name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="industry">Secteur d&apos;activité</Label>
          <Input id="industry" name="industry" defaultValue={account?.industry ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website">Site web</Label>
          <Input id="website" name="website" type="url" defaultValue={account?.website ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone principal</Label>
          <Input id="phone" name="phone" defaultValue={account?.phone ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={account?.city ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" name="address" defaultValue={account?.address ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="country">Pays</Label>
        <Input id="country" name="country" defaultValue={account?.country ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={account?.notes ?? ""} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {account ? "Mettre à jour" : "Créer le compte"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
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
      label: "Nom de l'entreprise",
      sortable: true,
      render: (row: AccountWithCounts) => (
        <div>
          <p className="font-semibold text-foreground text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.website ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "industry",
      label: "Secteur",
      sortable: true,
      render: (row: AccountWithCounts) => row.industry ?? "—",
    },
    {
      key: "city",
      label: "Ville",
      sortable: true,
      render: (row: AccountWithCounts) => row.city ?? "—",
    },
    {
      key: "contacts",
      label: "Contacts",
      render: (row: AccountWithCounts) => (
        <span className="inline-flex items-center justify-center bg-muted px-2 py-0.5 rounded text-xs font-medium">
          {row._count.contacts}
        </span>
      ),
    },
    {
      key: "deals",
      label: "Deals",
      render: (row: AccountWithCounts) => (
        <span className="inline-flex items-center justify-center bg-muted px-2 py-0.5 rounded text-xs font-medium">
          {row._count.deals}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Créé le",
      sortable: true,
      render: (row: AccountWithCounts) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comptes</h1>
          <p className="text-muted-foreground text-sm">
            {accounts.length} entreprise{accounts.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button
              onClick={() => setEditAccount(undefined)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Nouveau compte
            </Button>
          } />
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editAccount ? "Modifier le compte" : "Nouveau compte"}</SheetTitle>
            </SheetHeader>
            <AccountForm key={editAccount?.id ?? "new"} account={editAccount} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

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
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditAccount(acc);
                  setOpen(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                onClick={() => {
                  if (confirm("Supprimer ce compte et toutes ses données liées ?")) {
                    deleteAccountAction(acc.id);
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
