"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import type { Activity, User } from "@prisma/client";
import {
  createActivityAction,
  toggleActivityDoneAction,
  deleteActivityAction,
  updateActivityAction
} from "@/app/actions/activities";
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
import { Loader2, Plus, Trash2, List, CalendarDays, Check, ChevronLeft, ChevronRight, Pencil, Zap, Clock, Activity as ActivityIcon, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

type ActivityWithUser = Activity & { user: { name: string } | null };

const TYPE_ICON: Record<string, string> = {
  call: "📞",
  email: "✉️",
  meeting: "🤝",
  note: "📝",
};

const TYPE_COLOR: Record<string, string> = {
  call: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  email: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  meeting: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  note: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

function ActivityForm({ 
  onClose, 
  activity 
}: { 
  onClose: () => void; 
  activity?: ActivityWithUser 
}) {
  const action = activity ? updateActivityAction.bind(null, activity.id) : createActivityAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) { 
      toast.success(activity ? "Activité actualisée" : "Activité programmée"); 
      onClose(); 
    }
    if (state?.error) toast.error(state.error);
  }, [state, onClose, activity]);

  return (
    <form action={formAction} className="space-y-6 pt-6 px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type d'engagement *</Label>
          <select 
            id="a-type" 
            name="type" 
            defaultValue={activity?.type || "call"} 
            required 
            className="w-full h-12 rounded-2xl border-transparent bg-muted/30 px-4 text-sm font-bold focus:bg-background transition-all"
          >
            <option value="call">📞 Appel Commercial</option>
            <option value="email">✉️ Envoi Email</option>
            <option value="meeting">🤝 Réunion Client</option>
            <option value="note">📝 Note Interne</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Échéance programmée</Label>
          <Input 
            id="a-scheduled" 
            name="scheduledAt" 
            type="datetime-local" 
            defaultValue={activity?.scheduledAt ? new Date(activity.scheduledAt).toISOString().slice(0, 16) : ""}
            className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Titre de l'activité *</Label>
        <Input 
          id="a-title" 
          name="title" 
          defaultValue={activity?.title} 
          required 
          placeholder="Ex: Relance contrat maintenance"
          className="h-12 rounded-2xl bg-muted/30 border-transparent font-bold focus:bg-background transition-all" 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Détails & Compte-rendu</Label>
        <Textarea 
          id="a-desc" 
          name="description" 
          defaultValue={activity?.description || ""} 
          rows={4} 
          className="rounded-2xl bg-muted/30 border-transparent font-medium p-4 focus:bg-background transition-all" 
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={pending} 
          className="flex-1 h-14 bg-primary rounded-2xl font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 italic tracking-widest uppercase"
        >
          {pending && <Loader2 className="w-4 h-4 mr-3 animate-spin" />}
          {activity ? "Sauvegarder les modifications" : "Programmer l'activité"}
        </Button>
      </div>
    </form>
  );
}

function CalendarView({ activities, onEdit }: { activities: ActivityWithUser[], onEdit: (a: ActivityWithUser) => void }) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(current);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const activitiesOnDay = (day: number) =>
    activities.filter((a) => {
      if (!a.scheduledAt) return false;
      const d = new Date(a.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-3xl border border-border/40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setCurrent(new Date(year, month - 1, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-black italic uppercase tracking-tighter min-w-[220px] text-center">{monthName}</h2>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setCurrent(new Date(year, month + 1, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-black uppercase italic text-[10px] tracking-widest border-dashed" onClick={() => setCurrent(new Date())}>
          Aujourd'hui
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((d) => (
          <div key={d} className="text-center text-[10px] font-black text-muted-foreground uppercase py-2 tracking-widest opacity-60 italic">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-32 rounded-[1.5rem] bg-muted/5 opacity-20" />;

          const dayActs = activitiesOnDay(day);
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

          return (
            <div
              key={day}
              className={cn(
                "h-32 rounded-[1.5rem] border p-3 flex flex-col transition-all duration-300",
                isToday ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border/40 bg-card/40 hover:border-primary/20 hover:bg-muted/10"
              )}
            >
              <span className={cn("text-xs font-black underline decoration-2 underline-offset-4 mb-2", isToday ? "text-primary decoration-primary/40" : "text-muted-foreground decoration-transparent")}>
                {day.toString().padStart(2, '0')}
              </span>
              <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                {dayActs.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onEdit(a)}
                    className="w-full text-left truncate text-[9px] px-2 py-1.5 rounded-lg bg-card/80 border border-border/40 shadow-sm hover:border-primary/40 transition-all font-black uppercase italic tracking-tighter flex items-center gap-1.5"
                  >
                    <span className="opacity-80">{TYPE_ICON[a.type]}</span>
                    {a.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActivitiesView({ activities }: { activities: ActivityWithUser[] }) {
  const [open, setOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityWithUser | undefined>();
  const [view, setView] = useState<"list" | "calendar">("list");

  const columns = [
    {
      key: "type",
      label: "ENGAGEMENT",
      sortable: true,
      render: (row: ActivityWithUser) => (
        <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border-dashed", TYPE_COLOR[row.type])}>
          {TYPE_ICON[row.type]} {row.type}
        </Badge>
      ),
    },
    {
      key: "title",
      label: "INTITULÉ",
      sortable: true,
      render: (row: ActivityWithUser) => (
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg transition-all", row.isDone ? "bg-emerald-500/10" : "bg-primary/5")}>
             {row.isDone ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <ActivityIcon className="w-3.5 h-3.5 text-primary" />}
          </div>
          <span className={cn("text-sm font-black italic uppercase tracking-tighter", row.isDone ? "line-through text-muted-foreground opacity-60" : "text-foreground")}>
            {row.title}
          </span>
        </div>
      ),
    },
    {
      key: "scheduledAt",
      label: "CHRONOLOGIE",
      sortable: true,
      render: (row: ActivityWithUser) => (
        <div className="flex items-center gap-2 opacity-60">
           <Clock className="w-3.5 h-3.5 text-primary/60" />
           <span className="text-[10px] font-black text-muted-foreground uppercase">{formatDate(row.scheduledAt)}</span>
        </div>
      ),
    },
    {
      key: "user",
      label: "RESPONSABLE",
      render: (row: ActivityWithUser) => (
        <div className="flex items-center gap-2">
           <UserIcon className="w-3.5 h-3.5 text-primary/40" />
           <span className="text-[10px] font-black uppercase tracking-tighter">{row.user?.name ?? "—"}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-primary border-dashed font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">AGENDA COMMERCIAL</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/40 underline-offset-4 decoration-2">Registre des Actions</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 italic uppercase">
             Gestion des Activités
             <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <Clock className="w-4 h-4 text-primary" />
             {activities.filter(a => !a.isDone).length} engagements en attente
           </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/40 backdrop-blur-md rounded-2xl p-1.5 border border-border/40">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                view === "list" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Liste
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                view === "calendar" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
              <Button 
                onClick={() => { setEditingActivity(undefined); setOpen(true); }}
                className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white uppercase italic tracking-widest"
              >
                <Plus className="w-5 h-5 mr-3" />
                Nouveau
              </Button>
            } />
            <SheetContent className="overflow-y-auto sm:max-w-xl">
              <SheetHeader className="pb-4 border-b border-border/40">
                <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">
                  {editingActivity ? "Révision de l'Action" : "Nouvel Engagement"}
                </SheetTitle>
              </SheetHeader>
              <ActivityForm onClose={() => setOpen(false)} activity={editingActivity} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className={cn("premium-card p-2 rounded-[2.5rem]", view === "calendar" && "bg-transparent border-none shadow-none p-0")}>
        {view === "list" ? (
          <DataTable<ActivityWithUser>
            data={activities}
            columns={columns as any}
            searchKeys={["title", "type"] as any}
            actions={(row) => {
              const act = row as unknown as ActivityWithUser;
              return (
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-emerald-500 hover:bg-emerald-500/10 gap-2 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                    onClick={() => toggleActivityDoneAction(act.id, !act.isDone)}
                  >
                    <Check className={cn("w-3.5 h-3.5", act.isDone && "rotate-45")} />
                    <span className="text-[10px] font-black uppercase tracking-tighter italic">{act.isDone ? "Rouvrir" : "Terminer"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                    onClick={() => { setEditingActivity(act); setOpen(true); }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                    onClick={() => { if (confirm("Archiver cet engagement définitivement ?")) deleteActivityAction(act.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            }}
          />
        ) : (
          <CalendarView 
            activities={activities} 
            onEdit={(a) => { setEditingActivity(a); setOpen(true); }} 
          />
        )}
      </div>
    </div>
  );
}
