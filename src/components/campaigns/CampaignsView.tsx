"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import type { Campaign } from "@prisma/client";
import { createAndSendCampaignAction, deleteCampaignAction } from "@/app/actions/campaigns";
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
import { Loader2, Plus, Trash2, Send, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

function CampaignForm({ targetAudience, onClose }: { targetAudience: number, onClose: () => void; }) {
  const [state, formAction, pending] = useActionState(createAndSendCampaignAction, {});

  useEffect(() => {
    if (state?.success) { toast.success(state.message); onClose(); }
    if (state?.error) toast.error(state.error);
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-5 pt-4">
       <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between text-sm">
         <span className="font-medium text-primary-foreground">Audience cible :</span>
         <span className="bg-primary text-white rounded-full px-3 py-1 font-bold">{targetAudience} contacts</span>
       </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de la campagne interne *</Label>
        <Input id="name" name="name" placeholder="Ex: Promo Noël 2026" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Sujet de l'email *</Label>
        <Input id="subject" name="subject" placeholder="Ex: Devenez partenaire" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Contenu HTML ou Texte *</Label>
        <Textarea id="body" name="body" rows={8} className="font-mono text-sm" placeholder="<h1>Bonjour !</h1><p>Ceci est un test.</p>" required />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={pending || targetAudience === 0} className="w-full flex-1 bg-gradient-to-r from-[oklch(0.60_0.22_255)] to-[oklch(0.55_0.22_255)] text-white hover:opacity-90 transition-opacity">
          {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Enregistrer et envoyer en masse
        </Button>
      </div>
    </form>
  );
}

export default function CampaignsView({ campaigns, targetAudience }: { campaigns: Campaign[]; targetAudience: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const STATUS_BADGE: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400",
    running: "bg-blue-500/20 text-blue-400 animate-pulse",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", running: "Envoi en cours...", completed: "Terminée", cancelled: "Annulée" };

  const columns = [
    { key: "name", label: "Nom Campagne", sortable: true, render: (r: Campaign) => <span className="font-semibold text-foreground text-sm">{r.name}</span> },
    { key: "subject", label: "Sujet", render: (r: Campaign) => r.subject },
    { key: "status", label: "Statut", sortable: true, render: (r: Campaign) => <Badge className={`border-0 text-xs ${STATUS_BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</Badge> },
    { key: "stats", label: "Performances", render: (r: Campaign) => (
       <div className="flex gap-2 text-xs font-mono">
         <span className="text-green-400">Env.{r.totalSent}</span> / <span className="text-red-400">Éch.{r.totalFailed}</span>
       </div>
    )},
    { key: "createdAt", label: "Créée le", sortable: true, render: (r: Campaign) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-3">Campagnes Marketing</h1>
           <p className="text-muted-foreground text-sm mt-1">Gérez vos envois d'emails en masse</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={() => router.refresh()} className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground">
             <RotateCw className="w-4 h-4" />
           </Button>
           <Sheet open={open} onOpenChange={setOpen}>
             <SheetTrigger render={
                <Button className="bg-[oklch(0.55_0.22_255)] hover:bg-[oklch(0.55_0.22_255)]/90 text-white"><Plus className="w-4 h-4 mr-2" /> Créer Campagne</Button>
              } />
             <SheetContent className="overflow-y-auto sm:max-w-lg">
               <SheetHeader><SheetTitle>Nouvelle Campagne Mass-Mailing</SheetTitle></SheetHeader>
               <CampaignForm targetAudience={targetAudience} onClose={() => setOpen(false)} />
             </SheetContent>
           </Sheet>
        </div>
      </div>

      <DataTable
        data={campaigns as unknown as Record<string, unknown>[]}
        columns={columns as never}
        searchKeys={["name", "subject"]}
        actions={(row) => {
          const camp = row as unknown as Campaign;
          return (
             <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { if(confirm("Supprimer cette campagne ?")) deleteCampaignAction(camp.id) }} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                   <Trash2 className="w-3.5 h-3.5" />
                </Button>
             </div>
          );
        }}
      />
    </div>
  )
}
