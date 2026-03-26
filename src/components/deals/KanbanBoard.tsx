"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { updateDealStageAction, createDealAction, deleteDealAction } from "@/app/actions/deals";
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
import { Loader2, Plus, Trash2, GripVertical, Trophy, Sparkles, Filter, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { useActionState } from "react";
import type { Deal, Account } from "@prisma/client";

type DealWithAccount = Deal & { account: Account | null, stage: any | null, stageId: string | null };

function DealCard({ deal, index }: { deal: DealWithAccount; index: number }) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 group/card relative",
            snapshot.isDragging ? "shadow-2xl shadow-primary/20 rotate-1 scale-105 z-50 opacity-100 ring-2 ring-primary" : "shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-sm font-black text-foreground leading-tight group-hover/card:text-primary transition-colors flex-1 uppercase tracking-tighter italic">
              {deal.title}
            </h4>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
               <button
                  onClick={() => { if (confirm("Supprimer ce deal définitivement ?")) deleteDealAction(deal.id); }}
                  className="opacity-0 group-hover/card:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div
                  {...provided.dragHandleProps}
                  className="text-muted-foreground/30 hover:text-foreground cursor-grab active:cursor-grabbing p-1 transition-colors"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
            </div>
          </div>
          
          {deal.account && (
            <div className="flex items-center gap-2 mb-3 bg-muted/30 px-2 py-1 rounded-lg w-fit">
               <LayoutGrid className="w-3 h-3 text-primary/60" />
               <p className="text-[10px] font-black tracking-tighter text-muted-foreground uppercase">{deal.account.name}</p>
            </div>
          )}

          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
               <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Valeur Deal</p>
               <span className="text-base font-black text-foreground italic">
                 {formatCurrency(deal.amount)}
               </span>
            </div>
            <div className="flex flex-col items-end gap-1.5 min-w-[60px]">
               <span className="text-[10px] text-muted-foreground font-black uppercase italic">{deal.probability}%</span>
               <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shimmer"
                    style={{
                      width: `${deal.probability}%`,
                      background: "oklch(0.65 0.22 255)",
                    }}
                  />
               </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function NewDealForm({ onClose, stages }: { onClose: () => void, stages: any[] }) {
  const [state, formAction, pending] = useActionState(createDealAction, {});

  useEffect(() => {
    if (state?.success) { toast.success("Deal créé avec succès"); onClose(); }
    if (state?.error) toast.error(state.error);
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
      <div className="space-y-2">
        <Label htmlFor="d-title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Titre de l&apos;opportunité *</Label>
        <Input id="d-title" name="title" required className="h-12 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold placeholder:italic" placeholder="Ex: Contrat de services Cloud" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="d-amount" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Montant estimé (TND)</Label>
          <Input id="d-amount" name="amount" type="number" min="0" defaultValue={0} className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="d-stage" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Étape Pipeline</Label>
          <select
            id="d-stage"
            name="stageId"
            defaultValue={stages[0]?.id}
            className="w-full h-12 rounded-2xl border-transparent bg-muted/30 px-4 text-sm font-bold focus:bg-background transition-all outline-none"
          >
            {stages.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="d-notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notes prospectives</Label>
        <Textarea id="d-notes" name="notes" rows={4} className="rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all font-medium" />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={pending} className="flex-1 h-14 bg-primary rounded-2xl font-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
          {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Lancer l&apos;opportunité
        </Button>
      </div>
    </form>
  );
}

export default function KanbanBoard({ 
  initialDeals, 
  initialStages 
}: { 
  initialDeals: DealWithAccount[], 
  initialStages: any[] 
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [optimisticDeals, updateOptimistic] = useOptimistic(
    initialDeals,
    (current, { id, stageId }: { id: string; stageId: string }) =>
      current.map((d) => (d.id === id ? { ...d, stageId } : d))
  );

  const byStage = (stageId: string) =>
    optimisticDeals.filter((d) => d.stageId === stageId);

  const wonStageId = initialStages.find(s => s.name === "won")?.id;

  const totalWon = optimisticDeals
    .filter((d) => d.stageId === wonStageId)
    .reduce((s, d) => s + (d.amount || 0), 0);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStageId = destination.droppableId;

    startTransition(async () => {
      updateOptimistic({ id: draggableId, stageId: newStageId });
      await updateDealStageAction(draggableId, newStageId);
      if (newStageId === wonStageId) toast.success("🏆 DEAL REMPORTÉ !", { duration: 4000 });
    });
  };

  return (
    <div className="space-y-10 group/kanban relative">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-500 border-dashed font-black px-3 py-0.5 text-[10px] tracking-widest">LIVE PIPELINE</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/40 underline-offset-4 decoration-2">Flux de Conversion Commerciale</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4">
             Gestion du Pipeline
             <Sparkles className="w-8 h-8 text-primary animate-pulse" />
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2 italic">
             <Trophy className="w-5 h-5 text-yellow-400" />
             Revenus consolidés : <span className="text-foreground font-black not-italic">{formatCurrency(totalWon)}</span>
           </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-border/40 hover:bg-muted/40 transition-all border-dashed">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer Vue
           </Button>
           <Sheet open={open} onOpenChange={setOpen}>
             <SheetTrigger render={
               <Button className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white">
                 <Plus className="w-5 h-5 mr-2" />
                 Nouveau Deal
               </Button>
             } />
             <SheetContent className="overflow-y-auto sm:max-w-md">
               <SheetHeader className="pb-4 border-b border-border/40">
                 <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">Initialiser Opportunité</SheetTitle>
               </SheetHeader>
               <NewDealForm onClose={() => setOpen(false)} stages={initialStages} />
             </SheetContent>
           </Sheet>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-8 overflow-x-auto pb-8 px-1 scroll-smooth custom-scrollbar">
          {initialStages.map((col) => {
            const cards = byStage(col.id);
            const total = cards.reduce((s, d) => s + (d.amount || 0), 0);
            return (
              <div key={col.id} className="flex-shrink-0 w-[19rem] flex flex-col group/col">
                <div
                  className={cn(
                    "flex items-center justify-between mb-4 p-4 rounded-3xl border border-border/40 transition-all duration-300",
                    "bg-card/40 backdrop-blur-md shadow-sm group-hover/col:shadow-xl group-hover/col:shadow-primary/5 group-hover/col:border-primary/20"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className={cn("text-xs font-black uppercase tracking-[0.1em] opacity-60")}>
                      {col.label}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-xl font-black text-foreground italic">{cards.length}</span>
                       <Badge className={cn("border-0 text-[9px] font-black uppercase px-2 py-0", col.color)}>
                         ACTIF
                       </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Total</span>
                     <span className="text-sm font-black text-primary italic">
                        {formatCurrency(total)}
                     </span>
                  </div>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-4 min-h-[500px] rounded-[2.5rem] p-3 transition-all duration-500 ease-out",
                        snapshot.isDraggingOver ? "bg-primary/[0.03] border-2 border-dashed border-primary/20 shadow-inner" : "bg-muted/10 border-2 border-transparent"
                      )}
                    >
                      {cards.map((deal, index) => (
                        <DealCard key={deal.id} deal={deal} index={index} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
