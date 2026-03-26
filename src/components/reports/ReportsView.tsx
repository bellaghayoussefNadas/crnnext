"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, Target, Rocket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsProps {
  deals: any[];
  leads: any[];
  accounts: any[];
   stages: any[];
}

export default function ReportsView({ deals, leads, stages, accounts }: ReportsProps) {
  // 1. Data Processing: Revenue by Month (last 6 months)
  const revenueData = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = months[d.getMonth()];
      const total = deals
        .filter(deal => {
          const dealDate = new Date(deal.createdAt);
          return deal.stage === "won" && dealDate.getMonth() === d.getMonth() && dealDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, deal) => sum + (deal.amount || 0), 0);
      result.push({ name: mLabel, total });
    }
    return result;
  }, [deals]);

  // 2. Data Processing: Deals by Stage
  const stageData = useMemo(() => {
    //const stages = ["lead", "contacted", "negotiation", "won", "lost"];
    const labels: Record<string, string> = { lead: "Lead", contacted: "Contacté", negotiation: "Négociation", won: "Gagné", lost: "Perdu" };
    return stages.map(s => ({
      name: labels[s] || s,
      value: deals.filter(d => d.stage === s).length
    })).filter(s => s.value > 0);
  }, [deals]);

  const COLORS = ["#3b82f6", "#eab308", "#f97316", "#22c55e", "#ef4444"];

  // 3. Stats
  const wonTotal = deals.filter(d => d.stage === "won").reduce((s, d) => s + (d.amount || 0), 0);
  const conversionRate = leads.length > 0 ? Math.round((deals.length / (leads.length + deals.length)) * 100) : 0;

  const handleExport = () => {
    const headers = ["ID", "Titre", "Montant", "Etape", "Date"];
    const csvRows = [
      headers.join(","),
      ...deals.map(d => `${d.id},"${d.title}",${d.amount},${d.stage},${d.createdAt}`)
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_deals_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapports & Statistiques</h1>
          <p className="text-muted-foreground text-sm">Analyse de la performance commerciale</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 border-dashed">
          <Download className="w-4 h-4" />
          Exporter CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Chiffre d'Affaires", value: formatCurrency(wonTotal), icon: TrendingUp, color: "text-green-500" },
          { label: "Taux de Conversion", value: `${conversionRate}%`, icon: Target, color: "text-blue-500" },
          { label: "Total Comptes", value: accounts.length, icon: Users, color: "text-purple-500" },
          { label: "Opportunités Actives", value: deals.filter(d => d.stage !== "won" && d.stage !== "lost").length, icon: Rocket, color: "text-yellow-500" },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/60 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{kpi.label}</CardTitle>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-border/60 bg-card/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Évolution du Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.60 0.22 255)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.60 0.22 255)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.25 0.04 255 / 0.2)" />
                <XAxis dataKey="name" stroke="oklch(0.55 0.04 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.04 255)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: "oklch(0.14 0.03 255)", border: "1px solid oklch(0.25 0.04 255)", borderRadius: "12px", fontSize: "12px" }} 
                  formatter={(v: any) => [formatCurrency(Number(v)), "Revenus"]}
                />
                <Area type="monotone" dataKey="total" stroke="oklch(0.60 0.22 255)" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="border-border/60 bg-card/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Répartition du Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ background: "oklch(0.14 0.03 255)", border: "1px solid oklch(0.25 0.04 255)", borderRadius: "12px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                {stageData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
      </div>

      {/* Conversion Bar */}
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Performance des Ventes par Mois</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis dataKey="name" stroke="oklch(0.55 0.04 255)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: "oklch(0.55 0.04 255 / 0.1)" }}
                contentStyle={{ background: "oklch(0.14 0.03 255)", border: "1px solid oklch(0.25 0.04 255)", borderRadius: "12px" }}
              />
              <Bar dataKey="total" fill="oklch(0.65 0.22 255)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
