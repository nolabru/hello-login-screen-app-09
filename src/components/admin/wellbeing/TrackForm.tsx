import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadToBucket } from "@/services/storageService";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type Track = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  long_summary: string;
};

const fetchTracks = async (): Promise<Track[]> => {
  const { data, error } = await (supabase as any)
    .from("meditation_tracks")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return (data as unknown as Track[]) || [];
};

const TrackForm: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    summary: "",
    long_summary: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: tracks, refetch, isLoading, error } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: fetchTracks,
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = () => {
    if (!form.title) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o título da trilha.",
      });
      return false;
    }
    return true;
  };

  const doSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      let summaryWithImage = form.summary;

      // Upload image only when saving
      if (imageFile) {
        const url = await uploadToBucket("meditation_images", imageFile, "tracks");
        // injeta imagem no início do resumo
        summaryWithImage = `![cover](${url})\n\n${summaryWithImage}`;
      }

      const payload = {
        title: form.title,
        subtitle: form.subtitle || "",
        summary: summaryWithImage || "",
        long_summary: form.long_summary || "",
      };

      const { error: insertErr } = await (supabase as any)
        .from("meditation_tracks")
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      toast({ title: "Trilha criada com sucesso" });
      setForm({
        title: "",
        subtitle: "",
        summary: "",
        long_summary: "",
      });
      setImageFile(null);
      await refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao criar trilha",
        description: "Verifique os dados e tente novamente.",
      });
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const requestDelete = (t: Track) => {
    setTrackToDelete(t);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!trackToDelete) return;
    try {
      setDeleting(true);

      // Primeiro remover fases associadas (garante integridade mesmo sem ON DELETE CASCADE)
      const { error: delPhasesErr } = await (supabase as any)
        .from("phases")
        .delete()
        .eq("track_id", trackToDelete.id);
      if (delPhasesErr) throw delPhasesErr;

      // Depois remover a trilha
      const { error: delTrackErr } = await (supabase as any)
        .from("meditation_tracks")
        .delete()
        .eq("id", trackToDelete.id);
      if (delTrackErr) throw delTrackErr;

      toast({ title: "Trilha excluída" });
      await refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao excluir trilha",
        description: "Não foi possível excluir a trilha.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setTrackToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="p-4 border rounded-lg bg-white">
        <h2 className="text-lg font-medium mb-4">Nova Trilha</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!validate()) return;
            setConfirmOpen(true);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              placeholder="Título da trilha"
              value={form.title}
              onChange={handleChange("title")}
            />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input
              placeholder="Subtítulo"
              value={form.subtitle}
              onChange={handleChange("subtitle")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Resumo</Label>
            <Textarea
              rows={3}
              placeholder="Resumo curto"
              value={form.summary}
              onChange={handleChange("summary")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Resumo longo</Label>
            <Textarea
              rows={4}
              placeholder="Resumo detalhado"
              value={form.long_summary}
              onChange={handleChange("long_summary")}
            />
          </div>

          {/* Imagem no final (sem texto 'opcional') */}
          <div className="space-y-2 md:col-span-2">
            <Label>Imagem</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </section>

      <section className="p-4 border rounded-lg bg-white">
        <h3 className="text-md font-medium mb-3">Trilhas cadastradas</h3>
        {isLoading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="text-red-600">Erro ao carregar trilhas.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Título</TableHead>
                <TableHead>Subtítulo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks && tracks.length > 0 ? (
                tracks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{t.subtitle}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => requestDelete(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                    Nenhuma trilha cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Confirmação de envio */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar esta trilha? A imagem (se selecionada) será enviada ao Storage e a URL inserida no resumo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doSave}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir trilha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir “{trackToDelete?.title}”? As fases associadas serão removidas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrackForm;
