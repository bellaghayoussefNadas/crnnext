"use client";

import { useActionState, useEffect, useState } from "react";
import { createUserAction, updateUserAction, deleteUserAction, type UserFormState } from "@/app/actions/users";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface UserWithCount {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  _count: {
    leads: number;
    deals: number;
  };
}

function UserForm({
  user,
  onClose,
}: {
  user?: UserWithCount;
  onClose: () => void;
}) {
  const action = user ? updateUserAction.bind(null, user.id) : createUserAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(user ? "Utilisateur mis à jour" : "Utilisateur créé");
      onClose();
    }
    if (state?.error) toast.error(state.error);
  }, [state, user, onClose]);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom complet *</Label>
        <Input id="name" name="name" defaultValue={user?.name ?? ""} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" defaultValue={user?.email ?? ""} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Rôle *</Label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "agent"}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="admin">Administrateur</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Mot de passe {user ? "(laisser vide pour ne pas changer)" : "*"}
        </Label>
        <Input id="password" name="password" type="password" required={!user} />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={pending} className="flex-1 bg-primary text-primary-foreground font-bold">
          {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {user ? "Mettre à jour" : "Créer l'utilisateur"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
          Annuler
        </Button>
      </div>
    </form>
  );
}

export default function UsersView({ users }: { users: UserWithCount[] }) {
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserWithCount | undefined>();

  const columns = [
    {
      key: "name",
      label: "Utilisateur",
      sortable: true,
      render: (row: UserWithCount) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
             {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      sortable: true,
      render: (row: UserWithCount) => (
        <Badge
          className={`border-0 gap-1.5 ${
            row.role === "admin"
              ? "bg-purple-500/10 text-purple-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {row.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
          {row.role === "admin" ? "Administrateur" : "Agent"}
        </Badge>
      ),
    },
    {
      key: "leads",
      label: "Leads gérés",
      render: (row: UserWithCount) => (
        <span className="text-sm font-medium">{row._count.leads}</span>
      ),
    },
    {
      key: "deals",
      label: "Opportunités",
      render: (row: UserWithCount) => (
        <span className="text-sm font-medium text-[oklch(0.65_0.22_255)] font-bold">{row._count.deals}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Inscrit le",
      sortable: true,
      render: (row: UserWithCount) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground text-sm">Contrôle des accès et rôles</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button
              onClick={() => setEditUser(undefined)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Nouvel utilisateur
            </Button>
          } />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editUser ? "Modifier l'accès" : "Nouvel accès"}</SheetTitle>
            </SheetHeader>
            <UserForm key={editUser?.id ?? "new"} user={editUser} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <DataTable<UserWithCount>
        data={users}
        columns={columns as any}
        searchKeys={["name", "email"] as any}
        actions={(row) => {
          const user = row as UserWithCount;
          return (
            <div className="flex items-center gap-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => {
                  setEditUser(user);
                  setOpen(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={() => {
                  if (confirm("Supprimer cet utilisateur ?")) {
                    deleteUserAction(user.id);
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
