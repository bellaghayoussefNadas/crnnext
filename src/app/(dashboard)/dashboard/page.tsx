import { prisma } from "@/lib/prisma";
import { formatCurrency, formatRelativeDate, cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  UserCheck,
  Receipt,
  ArrowUpRight,
  Activity,
  Building2,
  BarChart3,
  CalendarDays,
  Sparkles,
  Zap,
} from "lucide-react";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { getSession } from "@/lib/session";
import { getModuleWhere } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Tableau de bord — NexCRM",
};

async function getKPIs(where: any) {
  const [
    totalAccounts,
    totalContacts,
    totalLeads,
    openDeals,
    wonDeals,
    recentActivities,
    topDeals,
    allDeals,
    stages,
  ] = await Promise.all([
    prisma.account.count({ where }),
    prisma.contact.count({ where }),
    prisma.lead.count({ where: { ...where, status: { not: "converted" } } }),
    prisma.deal.aggregate({
      where: { ...where, stage: { name: { notIn: ["won", "lost"] } } } as any,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.deal.aggregate({
      where: { ...where, stage: { name: "won" } } as any,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
    prisma.deal.findMany({
      where: { ...where, stage: { name: { notIn: ["won", "lost"] } } } as any,
      orderBy: { amount: "desc" },
      take: 5,
      include: { account: { select: { name: true } }, stage: true },
    }),
    prisma.deal.findMany({
      where,
      select: { amount: true, createdAt: true, stage: { select: { name: true } } },
    } as any),
    prisma.pipelineStage.findMany({ orderBy: { order: "asc" } }),
  ]);

  return {
    totalAccounts,
    totalContacts,
    totalLeads,
    openDeals,
    wonDeals,
    recentActivities,
    topDeals,
    allDeals: allDeals.map((d: any) => ({ ...d, stage: d.stage?.name })),
    stages,
  };
}

const ACTIVITY_ICON: Record<string, string> = {
  call: "📞",
  email: "✉️",
  meeting: "🤝",
  note: "📝",
};

export default async function DashboardPage() {
  const session = await getSession();
  const where = await getModuleWhere("dashboard", session);

  const {
    totalAccounts,
    totalContacts,
    totalLeads,
    openDeals,
    wonDeals,
    recentActivities,
    topDeals,
    allDeals,
    stages,
  } = await getKPIs(where);

  const stats = [
    {
      label: "Comptes",
      value: totalAccounts,
      icon: Building2,
      color: "oklch(0.65 0.22 255)",
      trend: "+12%",
    },
    {
      label: "Contacts",
      value: totalContacts,
      icon: Users,
      color: "oklch(0.65 0.18 170)",
      trend: "+8%",
    },
    {
      label: "Leads actifs",
      value: totalLeads,
      icon: UserCheck,
      color: "oklch(0.72 0.18 80)",
      trend: "+23%",
    },
    {
      label: "Deals ouverts",
      value: formatCurrency(openDeals._sum.amount ?? 0),
      icon: TrendingUp,
      color: "oklch(0.65 0.22 30)",
      trend: `${openDeals._count} deals`,
    },
    {
      label: "Revenus gagnés",
      value: formatCurrency(wonDeals._sum.amount ?? 0),
      icon: Receipt,
      color: "oklch(0.65 0.18 145)",
      trend: `${wonDeals._count} gagnés`,
    },
  ];

  return (
    <div className="space-y-10 group/dashboard relative">
      {/* Dynamic Glow Overlay */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-primary border-dashed font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">PRO EDITION</Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">NexCRM Intelligence</span>
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-3">
             Tableau de bord
             <Sparkles className="w-8 h-8 text-primary animate-pulse" />
           </h1>
           <p className="text-muted-foreground font-semibold flex items-center gap-2">
             <CalendarDays className="w-4 h-4" />
             {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())} • {session?.role === "admin" ? "Console Global" : `Bienvenue, ${session?.name}`}
           </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-border/40 hover:bg-muted/40 transition-all border-dashed">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              Actions rapides
           </Button>
           <Link href="/pipeline">
              <Button className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white">
                Gérer Pipeline
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
           </Link>
        </div>
      </div>

      {/* KPI Section with Premium Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="premium-card overflow-hidden group/kpi relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover/kpi:opacity-100 transition-opacity" style={{ background: s.color }} />
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-60">
                {s.label}
              </CardTitle>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover/kpi:scale-110 group-hover/kpi:rotate-6"
                style={{ background: `${s.color}20` }}
              >
                <s.icon
                  className="w-5 h-5"
                  style={{ color: s.color }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {s.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                   <div className="h-full bg-primary/40 rounded-full animate-pulse" style={{ width: '60%', background: s.color }} />
                </div>
                <span
                  className="text-[10px] font-black uppercase tracking-tighter"
                  style={{ color: s.color }}
                >
                  {s.trend}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">Mensuel</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts with Glow Effect */}
      <div className="relative">
         <div className="absolute -inset-4 bg-primary/5 blur-[40px] rounded-[40px] -z-10 opacity-30 group-hover/dashboard:opacity-60 transition-opacity" />
         <DashboardCharts deals={allDeals} />
      </div>

      {/* Modern Reports Banner */}
      <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/5 group hidden sm:block">
        <CardContent className="p-0 flex items-stretch">
          <div className="flex-1 p-10 flex flex-col justify-center space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-black text-foreground tracking-tighter italic">VOTRE PERFORMANCE EN TEMPS RÉEL</h3>
             </div>
             <p className="text-muted-foreground font-semibold max-w-lg leading-relaxed px-1">
                Utilisez l&apos;IA de NexCRM pour analyser vos taux de conversion et optimiser votre pipeline commercial automatiquement.
             </p>
             <div className="flex items-center gap-8 py-4 border-t border-border/40 mt-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Taux Moyen</p>
                   <p className="text-2xl font-black text-primary italic">
                    {Math.round((wonDeals._count / (openDeals._count + wonDeals._count || 1)) * 100)}%
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Opportunités</p>
                   <p className="text-2xl font-black text-primary italic">
                    {openDeals._count + wonDeals._count}
                   </p>
                </div>
                <div className="ml-auto">
                   <Link href="/reports">
                    <Button className="bg-[oklch(0.15_0.03_260)] text-white hover:bg-black rounded-2xl px-10 h-14 font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10">
                      Rapports Avancés
                      <ArrowUpRight className="w-5 h-5 ml-3" />
                    </Button>
                   </Link>
                </div>
             </div>
          </div>
          <div className="hidden lg:block w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Sparkles className="w-40 h-40 text-primary/20 rotate-12" />
             </div>
             <div className="absolute inset-0 flex items-center justify-center scale-110">
                <div className="w-full h-full flex items-center justify-center -rotate-12 translate-x-12">
                   <div className="grid grid-cols-2 gap-2 w-96 opacity-30">
                      {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="h-20 bg-primary/20 rounded-xl shimmer" />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Grid with Premium Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-base font-black flex items-center gap-3 italic">
              <TrendingUp className="w-5 h-5 text-primary" />
              OPPORTUNITÉS PRIORITAIRES
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            {topDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucun deal actif pour le moment.</p>
            ) : (
              topDeals.map((deal: any) => (
                <div key={deal.id} className="flex items-center justify-between p-4 rounded-3xl bg-muted/20 hover:bg-muted/50 transition-all border border-transparent hover:border-border/40 group/item">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground group-hover/item:text-primary transition-colors truncate">{deal.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{deal.account?.name ?? "COMPTE NON LIÉ"}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <Badge className={cn("text-[9px] border-0 px-3 py-1 font-black uppercase rounded-full", deal.stage?.color ?? "bg-gray-500/20")}>
                      {deal.stage?.label ?? "STAGE"}
                    </Badge>
                    <span className="text-base font-black text-foreground italic">{formatCurrency(deal.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-base font-black flex items-center gap-3 italic">
              <Activity className="w-5 h-5 text-[oklch(0.65_0.18_170)]" />
              FLUX D&apos;ASSISTANCE & ACTIVITÉ
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucun événement enregistré.</p>
            ) : (
              recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-4 p-4 rounded-3xl bg-muted/20 hover:bg-muted/50 transition-all border border-transparent hover:border-border/40">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner shrink-0 text-xl">
                    {ACTIVITY_ICON[act.type] ?? "📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate uppercase tracking-tighter">{act.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter italic">{act.user?.name ?? "SYSTÈME"}</span>
                       <span className="text-[10px] text-muted-foreground/40">•</span>
                       <span className="text-[10px] text-primary font-bold">{formatRelativeDate(act.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
