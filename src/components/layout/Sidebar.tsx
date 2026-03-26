"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  FileText,
  Receipt,
  Megaphone,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord", module: "dashboard" },
  { href: "/accounts", icon: Building2, label: "Comptes", module: "accounts" },
  { href: "/contacts", icon: Users, label: "Contacts", module: "accounts" },
  { href: "/leads", icon: UserCheck, label: "Leads", module: "leads" },
  { href: "/deals", icon: TrendingUp, label: "Opportunités", module: "deals" },
  { href: "/activities", icon: Calendar, label: "Activités", module: "activities" },
  { href: "/quotes", icon: FileText, label: "Devis", module: "sales" },
  { href: "/invoices", icon: Receipt, label: "Factures", module: "sales" },
  { href: "/campaigns", icon: Megaphone, label: "Campagnes", module: "campaigns" },
  { href: "/reports", icon: BarChart3, label: "Rapports", module: "reports" },
  { href: "/users", icon: Users, label: "Utilisateurs", adminOnly: true },
  { href: "/roles", icon: Shield, label: "Rôles", adminOnly: true },
  { href: "/pipeline", icon: Zap, label: "Pipeline", adminOnly: true },
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

export default function Sidebar({ userRole, permissions }: { userRole?: string, permissions?: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && userRole !== "admin") return false;
    if (permissions && item.module) {
      const rolePerms = permissions[userRole || "agent"];
      if (rolePerms && rolePerms[item.module] === "none") return false;
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "bg-sidebar border-r border-sidebar-border z-40 group/sidebar",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[40%] bg-primary/20 blur-[100px] rounded-full" />
      </div>

      {/* Logo */}
      <div className={cn(
          "flex items-center h-20 px-6 shrink-0 relative z-10",
          collapsed ? "justify-center" : "gap-4"
        )}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-primary shadow-lg shadow-primary/30 relative overflow-hidden group-hover/sidebar:scale-110 transition-transform">
          <Zap className="w-5 h-5 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter leading-none">
              Nex<span className="text-primary italic">CRM</span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1 opacity-60">PRO EDITION</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 relative z-10 custom-scrollbar">
        {filteredItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
                isActive
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0 w-12 mx-auto"
              )}
              title={collapsed ? label : undefined}
            >
              <div className={cn(
                "w-5 h-5 flex items-center justify-center transition-all duration-300",
                isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110"
              )}>
                <Icon className="w-full h-full" />
              </div>
              {!collapsed && <span className="truncate">{label}</span>}
              
              {/* Active Indicator Strip */}
              {isActive && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area */}
      <div className="p-4 border-t border-sidebar-border/50 relative z-10">
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group hover:bg-red-500/10 hover:text-red-400",
              collapsed ? "justify-center px-0 w-12 mx-auto" : "text-muted-foreground"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!collapsed && "Déconnexion"}
          </button>
        </form>
      </div>

      {/* Modern Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-24 w-8 h-8 rounded-xl border border-sidebar-border bg-sidebar flex items-center justify-center text-white/50 hover:text-white transition-all z-50 shadow-2xl hover:scale-110 active:scale-95"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
