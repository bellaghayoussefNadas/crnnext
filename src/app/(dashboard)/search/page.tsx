import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Building2, UserCheck, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recherche Globales — NexCRM" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  
  if (!query) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <SearchIcon className="w-16 h-16 opacity-20 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Recherche Globale CRM</h2>
        <p className="max-w-md">Tapez un mot-clé dans la barre supérieure pour trouver des comptes, contacts ou opportunités.</p>
      </div>
    );
  }

  const [accounts, leads, contacts] = await Promise.all([
    prisma.account.findMany({ where: { OR: [{ name: { contains: query } }, { notes: { contains: query } }] }, take: 10 }),
    prisma.lead.findMany({ where: { OR: [{ title: { contains: query } }, { firstName: { contains: query } }, { lastName: { contains: query } }, { email: { contains: query } }] }, take: 10 }),
    prisma.contact.findMany({ where: { OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }, { email: { contains: query } }] }, take: 10 })
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">Résultats pour "{query}"</h1>
      <p className="text-muted-foreground text-sm">
        {accounts.length + leads.length + contacts.length} éléments trouvés.
      </p>

      <div className="space-y-6">
        {accounts.length > 0 && (
           <div className="space-y-3">
             <h2 className="text-sm font-semibold text-primary flex items-center gap-2"><Building2 className="w-4 h-4"/> Comptes ({accounts.length})</h2>
             <div className="grid gap-2">
                {accounts.map(a => (
                  <Link key={a.id} href="/accounts" className="bg-card border border-border/50 p-4 rounded-xl hover:border-primary/50 transition-colors">
                     <div className="font-semibold text-foreground">{a.name}</div>
                     <div className="text-xs text-muted-foreground">{a.industry || "Pas de secteur"}</div>
                  </Link>
                ))}
             </div>
           </div>
        )}

        {leads.length > 0 && (
           <div className="space-y-3 border-t border-border pt-6">
             <h2 className="text-sm font-semibold flex items-center gap-2" style={{color: "oklch(0.65 0.18 170)"}}><UserCheck className="w-4 h-4"/> Leads ({leads.length})</h2>
             <div className="grid gap-2">
                {leads.map(l => (
                  <Link key={l.id} href="/leads" className="bg-card border border-border/50 p-4 rounded-xl hover:border-[oklch(0.65_0.18_170)]/50 transition-colors">
                     <div className="font-semibold text-foreground">{l.firstName} {l.lastName}</div>
                     <div className="text-xs text-muted-foreground">{l.title}</div>
                     <Badge className="mt-2 text-[10px]">{l.status}</Badge>
                  </Link>
                ))}
             </div>
           </div>
        )}

        {contacts.length > 0 && (
           <div className="space-y-3 border-t border-border pt-6">
             <h2 className="text-sm font-semibold flex items-center gap-2" style={{color: "oklch(0.72 0.18 80)"}}><Users className="w-4 h-4"/> Contacts ({contacts.length})</h2>
             <div className="grid gap-2">
                {contacts.map(c => (
                  <Link key={c.id} href="/contacts" className="bg-card border border-border/50 p-4 rounded-xl hover:border-[oklch(0.72_0.18_80)]/50 transition-colors">
                     <div className="font-semibold text-foreground">{c.firstName} {c.lastName}</div>
                     <div className="text-xs text-muted-foreground">{c.email || "Pas d'email"}</div>
                  </Link>
                ))}
             </div>
           </div>
        )}
      </div>
    </div>
  )
}
