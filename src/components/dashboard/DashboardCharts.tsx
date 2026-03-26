"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DashboardChartsProps {
  deals: { amount: number | null, stage: string, createdAt: Date }[];
}

export default function DashboardCharts({ deals }: DashboardChartsProps) {
  // Revenue by month
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

  // Stage distribution
  const stageData = useMemo(() => {
    const uniqueStages = Array.from(new Set(deals.map(d => d.stage).filter(Boolean)));
    return uniqueStages.map(s => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: deals.filter(d => d.stage === s).length
    })).filter(s => s.value > 0);
  }, [deals]);

  const COLORS = ["oklch(0.62 0.22 255)", "oklch(0.72 0.18 80)", "oklch(0.65 0.22 30)", "oklch(0.65 0.18 145)", "oklch(0.62 0.22 25)"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Chart */}
      <Card className="lg:col-span-2 border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5 rounded-3xl group">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-black flex items-center justify-between">
            <span className="uppercase tracking-[0.1em] text-muted-foreground">Évolution Financière</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
               EN HAUSSE +12%
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-semibold">Volume des ventes remportées (6 derniers mois)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] mt-4 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="dashRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="oklch(0.62 0.22 255)" stopOpacity={0}/>
                </linearGradient>
              </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.55 0.04 255 / 0.08)" />
              <XAxis dataKey="name" stroke="oklch(0.55 0.04 255 / 0.4)" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="oklch(0.55 0.04 255 / 0.4)" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip 
                cursor={{ stroke: "oklch(0.62 0.22 255 / 0.2)", strokeWidth: 2 }}
                contentStyle={{ background: "oklch(0.12 0.03 260 / 0.9)", border: "1px solid oklch(0.25 0.04 260)", borderRadius: "16px", backdropFilter: "blur(10px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }} 
                itemStyle={{ color: "white", fontWeight: 800, fontSize: "11px" }}
                labelStyle={{ color: "oklch(0.55 0.04 255)", marginBottom: "4px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}
                formatter={(v: any) => [formatCurrency(Number(v)), "VOLUME"]}
              />
              <Area type="monotone" dataKey="total" stroke="oklch(0.62 0.22 255)" fillOpacity={1} fill="url(#dashRevenue)" strokeWidth={4} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline Chart */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5 rounded-3xl group">
        <CardHeader className="pb-0 text-center">
          <CardTitle className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground">Distribution Pipeline</CardTitle>
          <CardDescription className="text-xs font-semibold">Volume par étape actuelle</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center pt-2">
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ background: "oklch(0.12 0.03 260 / 0.9)", border: "1px solid oklch(0.25 0.04 260)", borderRadius: "16px", backdropFilter: "blur(10px)" }}
                   itemStyle={{ color: "white", fontWeight: 800, fontSize: "11px" }}
                   labelStyle={{ display: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text for Pie */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[10px] uppercase font-black text-muted-foreground">Total</span>
               <span className="text-xl font-black text-foreground">{deals.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 px-6 w-full">
            {stageData.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center gap-2 group/label">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-black text-muted-foreground group-hover/label:text-foreground transition-colors truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
