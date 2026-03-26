"use client";

import type { Account, Contact, Deal } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Users, 
  PieChart, 
  ArrowLeft, 
  Mail, 
  Briefcase,
  History,
  TrendingUp,
  Receipt
} from "lucide-react";
import Link from "next/link";

type FullAccount = Account & {
  contacts: Contact[];
  deals: Deal[];
};

export default function AccountDetailView({ account }: { account: FullAccount }) {
  const totalDeals = account.deals.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const contactColumns = [
    {
      key: "fullName",
      label: "IDENTITÉ",
      render: (c: Contact) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary italic text-[10px] border border-primary/20">
             {c.firstName[0]}{c.lastName[0]}
          </div>
          <div>
            <p className="font-black text-foreground italic uppercase tracking-tighter text-xs">
              {c.firstName} {c.lastName}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground lowercase opacity-60">{c.email ?? "no-email"}</p>
          </div>
        </div>
      )
    },
    {
      key: "position",
      label: "POSTE",
      render: (c: Contact) => (
        <span className="text-[9px] font-black text-muted-foreground uppercase bg-muted/30 px-2 py-0.5 rounded-lg border border-border/40">
           {c.position || "—"}
        </span>
      )
    },
    {
      key: "phone",
      label: "CONTACT",
      render: (c: Contact) => <span className="text-[10px] font-black italic">{c.phone || "—"}</span>
    }
  ];

  const dealColumns = [
    {
      key: "title",
      label: "OPPORTUNITÉ",
      render: (d: Deal) => <span className="font-black text-xs text-foreground italic uppercase tracking-tighter leading-tight">{d.title}</span>,
    },
    {
      key: "amount",
      label: "VALEUR",
      render: (d: Deal) => <span className="font-black text-sm text-primary italic">{formatCurrency(d.amount)}</span>,
    },
    {
      key: "status",
      label: "PIPELINE",
      render: (d: Deal) => (
        <Badge variant="outline" className="text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-tighter border-dashed bg-primary/5 border-primary/20 text-primary">
          ACTIF
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Header & Meta */}
      <div className="flex flex-col gap-6">
        <Link href="/accounts">
           <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary gap-2 rounded-xl transition-all">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Retour au Portefeuille</span>
           </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center font-black text-primary italic text-2xl border border-primary/20 shadow-xl shadow-primary/5">
                   {account.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                   <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase leading-none">
                     {account.name}
                   </h1>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 opacity-60">
                         <Globe className="w-4 h-4 text-primary/60" />
                         <span className="text-xs font-bold text-muted-foreground lowercase">{account.website || "no-website.com"}</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5 opacity-60">
                         <MapPin className="w-4 h-4 text-primary/60" />
                         <span className="text-xs font-bold text-muted-foreground uppercase">{account.city}, {account.country}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3 h-fit">
             <div className="premium-card p-4 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col items-end min-w-[200px]">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic mb-1">Business Consolidé</span>
                <span className="text-3xl font-black italic tracking-tighter text-primary">
                   {formatCurrency(totalDeals)}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Points de Contact", value: account.contacts.length, sub: "Interlocuteurs actifs" },
          { icon: TrendingUp, label: "Opportunités", value: account.deals.length, sub: "Pipeline commercial" },
          { icon: History, label: "Dernier Échange", value: "2 jours", sub: "Relance hebdomadaire" },
          { icon: Receipt, label: "Ratio Transfo", value: "65%", sub: "Validation devis" },
        ].map((stat, i) => (
          <div key={i} className="premium-card bg-card/40 backdrop-blur-md p-5 rounded-[2rem] border border-border/40 hover:border-primary/20 transition-all group">
             <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5 text-primary/60" />
             </div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{stat.value}</h3>
             <p className="text-[9px] font-bold text-primary/60 italic uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabbed Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contacts Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                 <Users className="w-5 h-5 text-primary" />
                 Contacts Associés
              </h2>
              <Button size="sm" variant="ghost" className="h-8 rounded-xl font-black uppercase text-[10px] italic border-dashed border border-border">
                 Gérer tout
              </Button>
           </div>
           <div className="premium-card p-2 rounded-[2.5rem] bg-card/40 backdrop-blur-md border border-border/40">
              <DataTable
                 data={account.contacts as any}
                 columns={contactColumns as any}
                 searchKeys={["firstName", "lastName", "email"]}
              />
           </div>
        </div>

        {/* Deals Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                 <PieChart className="w-5 h-5 text-primary" />
                 Pipeline Commercial
              </h2>
              <Button size="sm" variant="ghost" className="h-8 rounded-xl font-black uppercase text-[10px] italic border-dashed border border-border">
                 Full Pipeline
              </Button>
           </div>
           <div className="premium-card p-2 rounded-[2.5rem] bg-card/40 backdrop-blur-md border border-border/40">
              <DataTable
                 data={account.deals as any}
                 columns={dealColumns as any}
                 searchKeys={["title"]}
              />
           </div>
        </div>
      </div>

      {/* Info & Notes Section */}
      <div className="premium-card p-10 rounded-[3rem] bg-muted/20 border border-border/40 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 className="w-48 h-48" />
         </div>
         <div className="max-w-xl space-y-4">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Notes Stratégiques</h3>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed italic">
               {account.notes || "Aucune note stratégique enregistrée pour ce compte. Utilisez cet espace pour consigner les informations clés sur les besoins spécifiques, l'historique de relation ou les objectifs futurs de ce partenaire."}
            </p>
         </div>
      </div>
    </div>
  );
}
