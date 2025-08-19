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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type Sound = {
  sound_id: string;
  title: string;
  description?: string | null;
  sound_url?: string | null;
  sound_time: number;
  sound_type: "Todos" | "Dormir" | "Estudar";
  sound_category: "Natureza" | "Instrumental" | "Urbanos";
  created_at?: string;
};

const SOUND_TYPES: Sound["sound_type"][] = ["Todos", "Dormir", "Estudar"];
const SOUND_CATEGORIES: Sound["sound_category"][] = ["Natureza", "Instrumental", "Urbanos"];

const fetchSounds = async (): Promise<Sound[]> => {
  const { data, error } = await (supabase as any)
    .from("sounds")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as Sound[]) || [];
};

const SoundForm: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    sound_url: "",
    sound_time: 10,
    sound_type: "" as Sound["sound_type"] | "",
    sound_category: "" as Sound["sound_category"] | "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [soundToDelete, setSoundToDelete] = useState<Sound | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: sounds, refetch, isLoading, error } = useQuery({
    queryKey: ["admin-sounds"],
    queryFn: fetchSounds,
  });

  const handleChangeText =
    (field: "title" | "description" | "sound_url") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setForm((prev) => ({ ...prev, sound_time: isNaN(v) ? 0 : v }));
  };

  const handleChangeType = (value: Sound["sound_type"]) => {
    setForm((prev) => ({ ...prev, sound_type: value }));
  };

  const handleChangeCategory = (value: Sound["sound_category"]) => {
    setForm((prev) => ({ ...prev, sound_category: value }));
  };

  const validate = () => {
    if (
      !form.title ||
      !form.sound_url ||
      !form.sound_time ||
      !form.sound_type ||
      !form.sound_category
    ) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha título, URL, duração, tipo e categoria.",
      });
      return false;
    }
    return true;
  };

  const doSave = async () => {
    try {
      setSaving(true);

      let descriptionWithImage = form.description || "";

      if (imageFile) {
        const url = await uploadToBucket("sounds_images", imageFile, "sounds");
        descriptionWithImage = `![cover](${url})\n\n${descriptionWithImage}`;
      }

      const payload = {
        title: form.title,
        description: descriptionWithImage || null,
        sound_url: form.sound_url,
        sound_time: form.sound_time,
        sound_type: form.sound_type,
        sound_category: form.sound_category,
      };

      const { error: insertErr } = await (supabase as any)
        .from("sounds")
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      toast({ title: "Som cadastrado com sucesso" });
      setForm({
        title: "",
        description: "",
        sound_url: "",
        sound_time: 10,
        sound_type: "",
        sound_category: "",
      });
      setImageFile(null);
      await refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar som",
        description: "Verifique os dados e tente novamente.",
      });
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const requestDelete = (s: Sound) => {
    setSoundToDelete(s);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!soundToDelete) return;
    try {
      setDeleting(true);
      const { error: delErr } = await (supabase as any)
        .from("sounds")
        .delete()
        .eq("sound_id", soundToDelete.sound_id);
      if (delErr) throw delErr;
      toast({ title: "Som excluído" });
      await refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao excluir som",
        description: "Não foi possível excluir o som.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setSoundToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="p-4 border rounded-lg bg-white">
        <h2 className="text-lg font-medium mb-4">Novo Som</h2>
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
              placeholder="Ex: Chuva suave"
              value={form.title}
              onChange={handleChangeText("title")}
            />
          </div>
          <div className="space-y-2">
            <Label>URL do áudio *</Label>
            <Input
              placeholder="https://..."
              value={form.sound_url}
              onChange={handleChangeText("sound_url")}
            />
          </div>
          <div className="space-y-2">
            <Label>Duração *</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={form.sound_time}
              onChange={handleChangeNumber}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={form.sound_type} onValueChange={handleChangeType as any}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {SOUND_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={form.sound_category} onValueChange={handleChangeCategory as any}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {SOUND_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição</Label>
            <Textarea
              rows={3}
              placeholder="Descrição opcional"
              value={form.description}
              onChange={handleChangeText("description")}
            />
          </div>

          {/* Imagem no final (sem 'opcional' e sem botão 'Enviar imagem') */}
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
        <h3 className="text-md font-medium mb-3">Sons cadastrados</h3>
        {isLoading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="text-red-600">Erro ao carregar sons.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sounds && sounds.length > 0 ? (
                sounds.map((s) => (
                  <TableRow key={s.sound_id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell>{s.sound_type}</TableCell>
                    <TableCell>{s.sound_category}</TableCell>
                    <TableCell>{s.sound_time}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => requestDelete(s)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhum som cadastrado.
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
              Deseja salvar este som? A imagem (se selecionada) será enviada ao Storage e a URL inserida na descrição.
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
            <AlertDialogTitle>Excluir som</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir “{soundToDelete?.title}”? Esta ação não pode ser desfeita.
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

export default SoundForm;
