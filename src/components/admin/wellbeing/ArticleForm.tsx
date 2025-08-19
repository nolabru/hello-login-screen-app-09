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

type Article = {
  id: string;
  title: string;
  category: string;
  text: string;
  date: string; // yyyy-mm-dd
  summary?: string | null;
  long_summary?: string | null;
};

const fetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await (supabase as any)
    .from("articles")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data as unknown as Article[]) || [];
};

const ArticleForm: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    summary: "",
    long_summary: "",
    text: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: articles, refetch, isLoading, error } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: fetchArticles,
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = () => {
    if (!form.title || !form.category || !form.date || !form.text) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha título, categoria, data e texto.",
      });
      return false;
    }
    return true;
  };

  const doSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      let finalText = form.text;
      let articleImageUrl: string | null = null;

      // Upload image only when saving
      if (imageFile) {
        const uploadResult = await (supabase.storage.from("article_image").upload(
          `articles/${Date.now()}-${imageFile.name}`,
          imageFile
        ));
        if (uploadResult.error) throw uploadResult.error;
        articleImageUrl = uploadResult.data?.path || null;
      }

      const payload = {
        title: form.title,
        category: form.category,
        date: form.date,
        summary: form.summary || null,
        long_summary: form.long_summary || null,
        text: finalText,
        article_image: articleImageUrl,
      };

      const { error: insertErr } = await (supabase as any)
        .from("articles")
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      toast({ title: "Artigo criado com sucesso" });
      setForm({
        title: "",
        category: "",
        date: "",
        summary: "",
        long_summary: "",
        text: "",
      });
      setImageFile(null);
      await refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao criar artigo",
        description: "Verifique os dados e tente novamente.",
      });
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const requestDelete = (a: Article) => {
    setArticleToDelete(a);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!articleToDelete) return;
    try {
      setDeleting(true);
      const { error: delErr } = await (supabase as any)
        .from("articles")
        .delete()
        .eq("id", articleToDelete.id);
      if (delErr) throw delErr;
      toast({ title: "Artigo excluído" });
      await refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o artigo.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setArticleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="p-4 border rounded-lg bg-white">
        <h2 className="text-lg font-medium mb-4">Novo Artigo</h2>

        {/* Linha com título, categoria e data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              placeholder="Título"
              value={form.title}
              onChange={handleChange("title")}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Input
              placeholder="Categoria"
              value={form.category}
              onChange={handleChange("category")}
            />
          </div>
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
            />
          </div>
        </div>

        {/* Resumo, Resumo longo, Texto */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea
              rows={3}
              placeholder="Resumo curto"
              value={form.summary}
              onChange={handleChange("summary")}
            />
          </div>
          <div className="space-y-2">
            <Label>Resumo longo</Label>
            <Textarea
              rows={4}
              placeholder="Resumo detalhado"
              value={form.long_summary}
              onChange={handleChange("long_summary")}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto *</Label>
            <Textarea
              rows={6}
              placeholder="Conteúdo do artigo"
              value={form.text}
              onChange={handleChange("text")}
            />
          </div>
        </div>

        {/* Imagem */}
        <div className="space-y-2 mt-4">
          <Label>Imagem</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Ação salvar com confirmação */}
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => {
              if (!validate()) return;
              setConfirmOpen(true);
            }}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </section>

      {/* Lista de artigos */}
      <section className="p-4 border rounded-lg bg-white">
        <h3 className="text-md font-medium mb-3">Artigos cadastrados</h3>
        {isLoading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="text-red-600">Erro ao carregar artigos.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles && articles.length > 0 ? (
                articles.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => requestDelete(a)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    Nenhum artigo cadastrado.
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
              Deseja salvar este artigo? A imagem (se selecionada) será enviada ao Storage e a URL inserida no conteúdo.
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
            <AlertDialogTitle>Excluir artigo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir “{articleToDelete?.title}”? Esta ação não pode ser desfeita.
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

export default ArticleForm;
