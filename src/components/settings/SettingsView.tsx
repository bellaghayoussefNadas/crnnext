"use client";

import { useActionState, useEffect } from "react";
import { saveSettingsAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Building, Database, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsView({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {});

  useEffect(() => {
    if (state?.success) toast.success(state.message);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Gérez la configuration globale de votre CRM (Admin uniquement)</p>
      </div>

      <form action={formAction} className="space-y-6">
         {/* Entreprise */}
         <Card className="bg-card/50 border-border/60">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-primary"/> Société</CardTitle>
             <CardDescription>Informations légales et publiques</CardDescription>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                <Input id="companyName" name="companyName" defaultValue={initialSettings["companyName"] || "My Company"} required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email principal</Label>
                <Input id="companyEmail" name="companyEmail" type="email" defaultValue={initialSettings["companyEmail"] || "contact@mycompany.com"} required/>
              </div>
           </CardContent>
         </Card>

         {/* Régionalisation */}
         <Card className="bg-card/50 border-border/60">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary"/> Global</CardTitle>
             <CardDescription>Configuration financière</CardDescription>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise par défaut</Label>
                <select id="currency" name="currency" defaultValue={initialSettings["currency"] || "EUR"} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar AM ($)</option>
                  <option value="GBP">Livre Sterling (£)</option>
                  <option value="TND">Dinar Tunisien (TND)</option>
                </select>
              </div>
           </CardContent>
         </Card>
           
         {/* Sécurité */}
         <Card className="bg-card/50 border-border/60 opacity-60">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><Fingerprint className="w-5 h-5 text-muted-foreground"/> API & Sécurité</CardTitle>
             <CardDescription>Paramètres avancés</CardDescription>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground bg-muted p-4 rounded-xl">La modification des Webhooks et clés API est temporairement désactivée dans cette version de démonstration.</p>
           </CardContent>
         </Card>

         <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[200px]">
               {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
               Sauvegarder
            </Button>
         </div>
      </form>
    </div>
  )
}
