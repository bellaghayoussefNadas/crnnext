"use client";

import { useState } from "react";
import { useActionState, useEffect, useTransition } from "react";
import type { Campaign } from "@prisma/client";
import { createAndSendCampaignAction, deleteCampaignAction, updateCampaignAction, reSendCampaignAction } from "@/app/actions/campaigns";
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
import { Loader2, Plus, Trash2, Send, RotateCw, Pencil, Megaphone, Users, Mail, Target, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function CampaignForm({ 
  targetAudience, 
  onClose, 
  campaign 
}: { 
  targetAudience: number, 
  onClose: () => void;
  campaign?: Campaign;
}) {
  const action = campaign ? updateCampaignAction.bind(null, campaign.id) : createAndSendCampaignAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) { toast.success(state.message); onClose(); }
    if (state?.error) toast.error(state.error);
  }, [state, onClose, campaign]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
       <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audience Cible</span>
             </div>
             <span className="bg-primary text-white text-[10px] rounded-full px-3 py-1 font-black italic uppercase tracking-widest shadow-lg shadow-primary/20">
               {targetAudience} contacts qualifiés
             </span>
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold italic">L'envoi sera effectué à tous les contacts disposant d'une adresse email valide dans votre base de données.</p>
       </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom du projet *</Label>
        <Input 
          id="name" name="name" 
          defaultValue={campaign?.name} 
          placeholder="Ex: Campagne Fidélité Spring 2026" required 
          className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Objet de l'Email *</Label>
        <div className="relative">
           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
           <Input 
            id="subject" name="subject" 
            defaultValue={campaign?.subject} 
            placeholder="Ex: Offre exclusive pour nos partenaires" required 
            className="h-12 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Corps du Message (HTML Autorisé) *</Label>
        <Textarea 
          id="body" name="body" 
          defaultValue={campaign?.body} 
          rows={10} 
          className="font-mono text-xs rounded-2xl bg-muted/30 border-transparent p-4 focus:bg-background transition-all" 
          placeholder="<h1>Bonjour [Nom] !</h1><p>Découvrez notre nouvelle offre...</p>" 
          required 
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={pending || (targetAudience === 0 && !campaign)} 
          className="flex-1 h-14 bg-primary rounded-2xl font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 italic tracking-widest uppercase"
        >
          {pending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Send className="w-4 h-4 mr-3" />}
          {campaign ? "Actualiser le projet" : "Lancer la diffusion"}
        </Button>
      </div>
    </form>
  );
}

export default function CampaignsView({ campaigns, targetAudience }: { campaigns: Campaign[]; targetAudience: number }) {
  const [open, setOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
    draft: { label: "Brouillon", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    running: { label: "Envoi en cours...", color: "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse" },
    completed: { label: "Terminée", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    cancelled: { label: "Annulée", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  };

  const columns = [
    {
      key: "name",
      label: "PROJET",
      sortable: true,
      render: (r: Campaign) => (
        <div className="flex flex-col">
           <span className="font-black text-sm text-foreground italic uppercase tracking-tighter leading-tight">{r.name}</span>
           <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[200px]">{r.subject}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "STATUT",
      sortable: true,
      render: (r: Campaign) => {
        const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
        return (
          <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border-dashed", config.color)}>
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: "stats",
      label: "PERFORMANCES",
      render: (r: Campaign) => (
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Succès</span>
              <span className="text-xs font-black text-emerald-500 italic">{r.totalSent}</span>
           </div>
           <div className="w-px h-6 bg-border/40" />
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Échecs</span>
              <span className="text-xs font-black text-red-500 italic">{r.totalFailed}</span>
           </div>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "CHRONOLOGIE",
      sortable: true,
      render: (r: Campaign) => (
        <div className="flex items-center gap-2 opacity-60">
           <Clock className="w-3.5 h-3.5 text-primary/60" />
           <span className="text-[10px] font-black text-muted-foreground uppercase">{formatDate(r.createdAt)}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-primary border-dashed font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">DIFFUSION MASSIVE</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/40 underline-offset-4 decoration-2">Marketing Stratégique</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 italic uppercase">
             Campaignes Marketing
             <Target className="w-8 h-8 text-primary animate-pulse" />
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <Megaphone className="w-4 h-4 text-primary" />
             {campaigns.length} flux de communication actifs
           </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="rounded-2xl h-12 w-12 p-0 border-border/40 hover:bg-muted/40 transition-all border-dashed"
          >
             <RotateCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
           </Button>
           <Sheet open={open} onOpenChange={setOpen}>
             <SheetTrigger render={
                <Button 
                  onClick={() => { setEditingCampaign(undefined); setOpen(true); }}
                  className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white uppercase italic tracking-widest"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Nouvelle Campagne
                </Button>
              } />
             <SheetContent className="overflow-y-auto sm:max-w-xl">
               <SheetHeader className="pb-4 border-b border-border/40">
                  <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">
                    {editingCampaign ? "Modification Projet" : "Initialisation Diffusion"}
                  </SheetTitle>
               </SheetHeader>
               <CampaignForm 
                targetAudience={targetAudience} 
                campaign={editingCampaign}
                onClose={() => setOpen(false)} 
               />
             </SheetContent>
           </Sheet>
        </div>
      </div>

      <div className="premium-card p-2 rounded-[2.5rem]">
        <DataTable
          data={campaigns as any}
          columns={columns as any}
          searchKeys={["name", "subject"]}
          actions={(row) => {
            const camp = row as unknown as Campaign;
            return (
              <div className="flex items-center gap-1 justify-end">
                {camp.status === "completed" && (
                  <Button
                    variant="ghost" size="sm" className="h-9 px-3 text-emerald-500 hover:bg-emerald-500/10 gap-2 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                    onClick={() => {
                       if (confirm("Relancer l'envoi de cette campagne ?")) reSendCampaignAction(camp.id);
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter italic">Relancer</span>
                  </Button>
                )}
                <Button
                  variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  onClick={() => { setEditingCampaign(camp); setOpen(true); }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                  onClick={() => { if(confirm("Archiver cette campagne ?")) deleteCampaignAction(camp.id) }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          }}
        />
      </div>
    </div>
  )
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
