"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, User, Check, X, Loader2, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateRolePermissionsAction } from "@/app/actions/roles";

const MODULES = [
  { id: "dashboard", label: "Tableau de Bord", icon: "📊" },
  { id: "accounts", label: "Comptes & Contacts", icon: "🏢" },
  { id: "leads", label: "Leads & Prospects", icon: "🎯" },
  { id: "deals", label: "Opportunités (Kanban)", icon: "🤝" },
  { id: "activities", label: "Activités & Calendrier", icon: "📅" },
  { id: "sales", label: "Devis & Factures", icon: "📄" },
  { id: "campaigns", label: "Marketing & Campagnes", icon: "📢" },
  { id: "reports", label: "Rapports & Stats", icon: "📈" },
];

const OPTIONS = [
  { value: "all", label: "Tout Voir", color: "text-green-500", bg: "bg-green-500/10" },
  { value: "own", label: "Uniquement les miens", color: "text-blue-400", bg: "bg-blue-400/10" },
  { value: "none", label: "Accès Interdit", color: "text-red-500", bg: "bg-red-500/10" },
];

export default function RolesView({ initialPermissions }: { initialPermissions: any }) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    setPending(true);
    const result = await updateRolePermissionsAction(permissions);
    setPending(false);

    if (result?.success) {
      toast.success("Permissions sauvegardées avec succès");
    } else {
      toast.error(result?.error || "Erreur de sauvegarde");
    }
  }

  function togglePerm(role: string, module: string, value: string) {
    setPermissions({
      ...permissions,
      [role]: {
        ...permissions[role],
        [module]: value,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold italic">Gestion des Rôles & Permissions</h1>
          <p className="text-muted-foreground text-sm">Définissez dynamiquement ce que chaque rôle peut voir ou faire.</p>
        </div>
        <Button onClick={handleSave} disabled={pending} className="bg-[oklch(0.55_0.22_255)] hover:bg-[oklch(0.55_0.22_255)]/90 shadow-lg shadow-[oklch(0.55_0.22_255)]/20">
          {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Role Editor */}
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center text-white"><Shield className="w-5 h-5" /></div>
              <CardTitle>Rôle Administrateur</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
             {MODULES.map(m => (
               <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                     <span className="text-sm">{m.icon}</span>
                     <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <div className="flex bg-background/50 rounded-lg p-0.5 scale-90">
                     {OPTIONS.map(opt => (
                       <button
                         key={opt.value}
                         onClick={() => togglePerm("admin", m.id, opt.value)}
                         className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${
                           permissions.admin[m.id] === opt.value
                             ? "bg-purple-500 text-white shadow-sm"
                             : "text-muted-foreground hover:text-foreground"
                         }`}
                       >
                         {opt.value}
                       </button>
                     ))}
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>

        {/* Agent Role Editor */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white"><User className="w-5 h-5" /></div>
              <CardTitle>Rôle Agent Commercial</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
             {MODULES.map(m => (
               <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                     <span className="text-sm">{m.icon}</span>
                     <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <div className="flex bg-background/50 rounded-lg p-0.5 scale-90">
                     {OPTIONS.map(opt => (
                       <button
                         key={opt.value}
                         onClick={() => togglePerm("agent", m.id, opt.value)}
                         className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${
                           permissions.agent[m.id] === opt.value
                             ? "bg-blue-500 text-white shadow-sm"
                             : "text-muted-foreground hover:text-foreground"
                         }`}
                       >
                         {opt.value}
                       </button>
                     ))}
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
           <Info className="w-6 h-6 text-[oklch(0.55_0.22_255)] shrink-0" />
           <div className="space-y-1">
              <h4 className="font-bold">Comment ça marche ?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                 <li>• <strong className="text-foreground">Tout Voir :</strong> L'utilisateur a accès à l'ensemble des données de l'entreprise.</li>
                 <li>• <strong className="text-foreground">Uniquement les miens :</strong> L'utilisateur ne voit que les fiches (Leads, Devis...) qui lui sont assignées.</li>
                 <li>• <strong className="text-foreground">Accès Interdit :</strong> Le module n'est pas affiché dans le menu et l'accès à la page est bloqué.</li>
              </ul>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
