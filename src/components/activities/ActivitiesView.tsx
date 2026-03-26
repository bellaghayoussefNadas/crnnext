"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import type { Activity, User } from "@prisma/client";
import {
  createActivityAction,
  toggleActivityDoneAction,
  deleteActivityAction,
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
import { Loader2, Plus, Trash2, List, CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type ActivityWithUser = Activity & { user: { name: string } | null };

const TYPE_ICON: Record<string, string> = {
  call: "📞",
  email: "✉️",
  meeting: "🤝",
  note: "📝",
};
const TYPE_COLOR: Record<string, string> = {
  call: "bg-blue-500/20 text-blue-400",
  email: "bg-purple-500/20 text-purple-400",
  meeting: "bg-yellow-500/20 text-yellow-400",
  note: "bg-green-500/20 text-green-400",
};

function NewActivityForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createActivityAction, {});
  useEffect(() => {
    if (state?.success) { toast.success("Activité créée"); onClose(); }
    if (state?.error) toast.error(state.error);
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="a-type">Type *</Label>
          <select id="a-type" name="type" required className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="call">📞 Appel</option>
            <option value="email">✉️ Email</option>
            <option value="meeting">🤝 Réunion</option>
            <option value="note">📝 Note</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-scheduled">Date prévue</Label>
          <Input id="a-scheduled" name="scheduledAt" type="datetime-local" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-title">Titre *</Label>
        <Input id="a-title" name="title" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-desc">Description</Label>
        <Textarea id="a-desc" name="description" rows={3} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Créer
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
      </div>
    </form>
  );
}

// ── Calendar View ─────────────────────────────────────────────────────────────

function CalendarView({ activities }: { activities: ActivityWithUser[] }) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(current);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Sunday=0, but we want Monday first
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
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrent(new Date(year, month - 1, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base font-semibold capitalize min-w-[180px] text-center">{monthName}</h2>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrent(new Date(year, month + 1, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day)
            return <div key={`e-${i}`} className="h-20 rounded-lg" />;

          const dayActs = activitiesOnDay(day);
          const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;

          return (
            <div
              key={day}
              className={`h-20 rounded-lg border p-1.5 text-xs overflow-hidden transition-colors ${
                isToday
                  ? "border-[oklch(0.60_0.22_255)] bg-[oklch(0.60_0.22_255_/_0.08)]"
                  : "border-border/40 hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <span
                className={`font-semibold ${
                  isToday ? "text-[oklch(0.65_0.22_255)]" : "text-muted-foreground"
                }`}
              >
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayActs.slice(0, 2).map((a) => (
                  <div
                    key={a.id}
                    className="truncate text-[10px] px-1 py-0.5 rounded"
                    style={{ background: "oklch(0.55 0.22 255 / 0.2)", color: "oklch(0.65 0.22 255)" }}
                    title={a.title}
                  >
                    {TYPE_ICON[a.type]} {a.title}
                  </div>
                ))}
                {dayActs.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayActs.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ActivitiesView({ activities }: { activities: ActivityWithUser[] }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");

  const columns = [
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (row: ActivityWithUser) => (
        <Badge className={`border-0 text-xs ${TYPE_COLOR[row.type]}`}>
          {TYPE_ICON[row.type]} {row.type}
        </Badge>
      ),
    },
    {
      key: "title",
      label: "Titre",
      sortable: true,
      render: (row: ActivityWithUser) => (
        <div className="flex items-center gap-2">
          {row.isDone && (
            <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
          )}
          <span className={row.isDone ? "line-through text-muted-foreground" : "text-foreground"}>
            {row.title}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      label: "Assigné à",
      render: (row: ActivityWithUser) => row.user?.name ?? "—",
    },
    {
      key: "scheduledAt",
      label: "Prévue le",
      sortable: true,
      render: (row: ActivityWithUser) => formatDate(row.scheduledAt),
    },
    {
      key: "isDone",
      label: "Statut",
      render: (row: ActivityWithUser) => (
        <Badge className={`border-0 text-xs ${row.isDone ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
          {row.isDone ? "Terminée" : "En cours"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activités</h1>
          <p className="text-muted-foreground text-sm">{activities.length} activité{activities.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              Liste
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendrier
            </button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
              <Button className="gap-2" style={{ background: "oklch(0.55 0.22 255)" }}>
                <Plus className="w-4 h-4" />
                Nouvelle
              </Button>
            } />
            <SheetContent>
              <SheetHeader><SheetTitle>Nouvelle activité</SheetTitle></SheetHeader>
              <NewActivityForm onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

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
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-green-400"
                  onClick={() => toggleActivityDoneAction(act.id, !act.isDone)}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {act.isDone ? "Rouvrir" : "Terminer"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                  onClick={() => { if (confirm("Supprimer ?")) deleteActivityAction(act.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          }}
        />
      ) : (
        <CalendarView activities={activities} />
      )}
    </div>
  );
}
