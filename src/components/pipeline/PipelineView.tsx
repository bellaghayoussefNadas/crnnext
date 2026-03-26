"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Check, X, GripVertical, Loader2 } from "lucide-react";
import { createStageAction, updateStageAction, deleteStageAction } from "@/app/actions/pipeline";
import { toast } from "sonner";

export default function PipelineView({ initialStages }: { initialStages: any[] }) {
  const [stages, setStages] = useState(initialStages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ label: "", color: "", order: 0 });

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette étape ?")) return;
    const res = await deleteStageAction(id);
    if (res.success) toast.success("Étape supprimée");
    else toast.error(res.error);
  }

  async function handleAdd() {
    const res = await createStageAction({ ...formData, name: formData.label.toLowerCase().replace(/ /g, "_") });
    if (res.success) {
       toast.success("Étape ajoutée");
       setFormData({ label: "", color: "", order: 0 });
    }
    else toast.error(res.error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuration du Pipeline</h1>
        <p className="text-muted-foreground text-sm italic">Personnalisez les étapes de vente de votre CRM.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages List */}
        <Card className="lg:col-span-2 border-border/60 bg-card/80">
          <CardHeader><CardTitle className="text-lg">Étapes Actuelles</CardTitle></CardHeader>
          <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-10">Ordre</TableHead>
                   <TableHead>Label</TableHead>
                   <TableHead>Exemple Look</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {stages.map((s, idx) => (
                   <TableRow key={s.id}>
                     <TableCell className="font-mono text-xs">{s.order}</TableCell>
                     <TableCell className="font-medium">{s.label}</TableCell>
                     <TableCell>
                       <Badge className={`border-0 text-xs ${s.color}`}>
                         {s.label}
                       </Badge>
                     </TableCell>
                     <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                           <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          </CardContent>
        </Card>

        {/* Add New Stage */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader><CardTitle className="text-lg">Ajouter une Étape</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1.5">
                <Label htmlFor="label">Label Affiché *</Label>
                <Input id="label" placeholder="Ex: Démonstration" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} />
             </div>
             <div className="space-y-1.5">
                <Label htmlFor="color">Style CSS (Badge) *</Label>
                <select id="color" className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })}>
                   <option value="bg-blue-500/20 text-blue-400">Bleu</option>
                   <option value="bg-yellow-500/20 text-yellow-400">Jaune</option>
                   <option value="bg-green-500/20 text-green-400">Vert</option>
                   <option value="bg-purple-500/20 text-purple-400">Violet</option>
                   <option value="bg-red-500/20 text-red-400">Rouge</option>
                   <option value="bg-orange-500/20 text-orange-400">Orange</option>
                   <option value="bg-sky-400/20 text-sky-400">Sky</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <Label htmlFor="order">Ordre d'affichage</Label>
                <Input id="order" type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} />
             </div>
             <Button onClick={handleAdd} className="w-full bg-[oklch(0.55_0.22_255)]">Créer l'étape</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
