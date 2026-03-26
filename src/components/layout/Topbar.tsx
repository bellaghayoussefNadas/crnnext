"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LayoutGrid, HelpCircle, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials, cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/button";

interface TopbarProps {
  userName: string;
  userRole: string;
}

export default function Topbar({ userName, userRole }: TopbarProps) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  return (
    <header className="h-20 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center px-8 gap-6 shrink-0 z-30 sticky top-0">
      {/* Dynamic Breadcrumb (Simulated) */}
      <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground mr-4">
        <LayoutGrid className="w-4 h-4" />
        <span>Espace de travail</span>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-bold">NexCRM Pro</span>
      </div>

      {/* Modern Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher tout ce dont vous avez besoin..."
            className="pl-11 h-11 bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-border/60 rounded-2xl transition-all duration-300 shadow-none focus:shadow-xl focus:shadow-black/5"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 group-focus-within:opacity-100 transition-opacity">
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium hidden sm:flex">
              ⌘ K
            </kbd>
          </div>
        </div>
      </form>

      <div className="flex items-center gap-4 ml-auto">
        {/* Help */}
        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hidden sm:flex">
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all relative group shadow-sm hover:shadow-md">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-background shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
        </button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="flex items-center gap-3 p-1.5 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all border border-transparent hover:border-border/40 ml-2 group">
              <div className="relative">
                <Avatar className="w-9 h-9 rounded-xl border border-border/20 shadow-md">
                   <AvatarImage src="" />
                   <AvatarFallback className="text-[10px] font-black text-white bg-primary">
                    {getInitials(userName)}
                   </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <div className="hidden md:block text-left pr-2">
                <p className="text-sm font-bold leading-none text-foreground group-hover:text-primary transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-1 opacity-60">
                  {userRole}
                </p>
              </div>
            </button>
          } />
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-border/40 shadow-2xl glass-premium">
            <DropdownMenuLabel className="px-3 py-4">
              <div className="flex flex-col space-y-1">
                 <p className="text-sm font-bold leading-none">{userName}</p>
                 <p className="text-[11px] font-medium leading-none text-muted-foreground mt-1">Personnel Autorisé</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem className="rounded-xl mt-1 h-10 px-3 cursor-pointer">
              <User className="w-4 h-4 mr-3 text-primary" />
              <span className="font-semibold text-xs">Mon Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl h-10 px-3 cursor-pointer">
              <Settings className="w-4 h-4 mr-3 text-primary" />
              <span className="font-semibold text-xs">Préférences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem
              className="rounded-xl h-10 px-3 text-red-500 font-bold focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
              onClick={() => logoutAction()}
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="text-xs">Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
