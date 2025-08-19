import React, { useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Track = {
  id: string;
  title: string;
};

type Phase = {
  id: string;
  track_id: string;
  title: string;
  description: string;
  duration: number; // real
};

const fetchTracks = async (): Promise<Track[]> => {
  const { data, error } = await (supabase as any)
    .from("meditation_tracks")
    .select("id,title")
    .order("title", { ascending: true });
  if (error) throw error;
  return (data as unknown as Track[]) || [];
};

const fetchPhasesByTrack = async (trackId: string): Promise<Phase[]> => {
  if (!trackId) return [];
  const { data, error } = await (supabase as any)
    .from("phases")
    .select("*")
    .eq("track_id", trackId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as Phase[]) || [];
};

const PhaseForm: React.FC = () => {
  const { toast } = useToast();
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 3.2, // default da coluna
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: tracks, isLoading: tracksLoading, error: tracksError } = useQuery({
    queryKey: ["admin-tracks-basic"],
    queryFn: fetchTracks,
  });

  const {
    data: phases,
    refetch: refetchPhases,
    isLoading: phasesLoading,
    error: phasesError,
  } = useQuery({
    queryKey: ["admin-phases", selectedTrackId],
    queryFn: () => fetchPhasesByTrack(selectedTrackId),
    enabled: !!selectedTrackId,
  });

  const handleChangeText =
    (field: "title" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleChangeDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setForm((prev) => ({ ...prev, duration: isNaN(v) ? 0 : v }));
  };

  const selectedTrackTitle = useMemo(
    () => tracks?.find((t) => t.id === selectedTrackId)?.title ?? "",
    [tracks, selectedTrackId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId || !form.title || !form.description) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Selecione a trilha e preencha título e descrição.",
      });
      return;
    }
    try {
      const payload = {
        track_id: selectedTrackId,
        title: form.title,
        description: form.description,
        duration: form.duration,
      };

      const { error } = await (supabase as any)
        .from("phases")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Fase criada com sucesso" });
      setForm({ title: "", description: "", duration: 3.2 });
      await refetchPhases();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao criar fase",
        description: "Verifique os dados e tente novamente.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <section className="p-4 border rounded-lg bg-white">
        <h2 className="text-lg font-medium">Nova Fase</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trilha *</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {tracks && tracks.length > 0 ? (
                  tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">Nenhuma trilha encontrada</div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome da fase *</Label>
            <Input
              placeholder="Ex: Introdução à Respiração"
              value={form.title}
              onChange={handleChangeText("title")}
            />
          </div>
          <div className="space-y-2">
            <Label>Duração (minutos)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={form.duration}
              onChange={handleChangeDuration}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição *</Label>
            <Textarea
              rows={4}
              placeholder="O que será trabalhado nesta fase"
              value={form.description}
              onChange={handleChangeText("description")}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={!selectedTrackId}>
              Salvar
            </Button>
          </div>
        </form>
      </section>

      <section className="p-4 border rounded-lg bg-white">
        <h3 className="text-md font-medium mb-3">
          Fases da trilha {selectedTrackTitle ? `"${selectedTrackTitle}"` : ""}
        </h3>
        {!selectedTrackId ? (
          <div className="text-gray-500">Selecione uma trilha para visualizar as fases.</div>
        ) : phasesLoading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : phasesError ? (
          <div className="text-red-600">Erro ao carregar fases.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Título</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phases && phases.length > 0 ? (
                phases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.duration ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                    Nenhuma fase cadastrada para esta trilha.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
};

export default PhaseForm;
