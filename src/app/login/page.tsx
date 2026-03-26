"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Zap, Sparkles, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = { error: undefined };

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_260)] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      
      {/* Dynamic Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full opacity-40 animate-pulse" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#f97316]/10 blur-[150px] rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 shadow-2xl rounded-[3rem] overflow-hidden bg-background/40 backdrop-blur-2xl border border-white/5 relative z-10">
        
        {/* Branding Panel (Side) */}
        <div className="hidden lg:flex flex-col p-16 justify-between bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
           
           <div className="flex items-center gap-3 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <Zap className="w-6 h-6 text-white" />
             </div>
             <div>
               <span className="text-3xl font-black text-white tracking-tighter">
                 Nex<span className="text-primary italic">CRM</span>
               </span>
               <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Intelligence</span>
                  <div className="h-[1px] w-8 bg-primary/30" />
               </div>
             </div>
           </div>

           <div className="space-y-6 relative z-10">
              <h2 className="text-6xl font-black text-white tracking-tighter italic leading-[0.9]">
                 DOMINEZ VOTRE <br /> 
                 <span className="text-primary not-italic">MARCHÉ.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-semibold max-w-md leading-relaxed">
                 L&apos;infrastructure CRM la plus avancée au monde pour les équipes de vente haute-performance.
              </p>
              
              <div className="flex items-center gap-6 py-8">
                 <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-white/60 uppercase tracking-widest">Global Sync</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-white/60 uppercase tracking-widest">AES-256 SECURE</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                 <p className="text-4xl font-black text-white italic">99.9%</p>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Uptime SLA</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                 <p className="text-4xl font-black text-white italic">+240%</p>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">ROI Moyen</p>
              </div>
           </div>
        </div>

        {/* Login Panel */}
        <div className="flex flex-col p-8 sm:p-16 justify-center bg-card/60 backdrop-blur-md border-l border-white/5">
           <div className="max-w-sm mx-auto w-full space-y-10">
              <div className="space-y-4">
                 <h1 className="text-5xl font-black text-white tracking-tighter italic">
                    ACCÈS <span className="text-primary not-italic">PORTAIL</span>
                 </h1>
                 <p className="text-muted-foreground font-bold">Identifiez-vous pour accéder à la console de commande.</p>
              </div>

              <form action={action} className="space-y-6">
                {state?.error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black italic flex items-center gap-3 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {state.error.toUpperCase()}
                  </div>
                )}

                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Veuillez entrer votre ID</Label>
                   <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ADMIN@NEXCRM.PRO"
                        required
                        className="h-14 pl-12 rounded-[1.2rem] bg-black/20 border-white/5 focus:border-primary/50 focus:bg-black/40 text-white font-black uppercase tracking-tighter transition-all shadow-inner"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Code de Sécurité</Label>
                   <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="h-14 pl-12 rounded-[1.2rem] bg-black/20 border-white/5 focus:border-primary/50 focus:bg-black/40 text-white font-black transition-all shadow-inner"
                      />
                   </div>
                </div>

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full h-16 rounded-[1.2rem] bg-primary text-white font-black uppercase italic tracking-widest text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {pending ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AUTHENTIFICATION...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      CONNEXION AU RÉSEAU
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="pt-8 border-t border-white/5 text-center">
                 <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                   NexCRM Pro Security Standard v2.4.1
                 </p>
                 <p className="mt-4 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors cursor-help italic">
                   Besoin d&apos;assistance technique ?
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
