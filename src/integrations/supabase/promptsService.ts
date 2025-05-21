
import { supabase } from "./client";
import { AIPrompt } from "@/types/ai-prompt";

export const fetchPrompts = async (): Promise<AIPrompt[]> => {
  const { data, error } = await supabase
    .from("ai_prompts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar prompts:", error);
    throw error;
  }

  return data || [];
};

export const createPrompt = async (prompt: Omit<AIPrompt, "id" | "created_at" | "updated_at">): Promise<AIPrompt> => {
  const { data, error } = await supabase
    .from("ai_prompts")
    .insert(prompt)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar prompt:", error);
    throw error;
  }

  return data;
};

export const updatePrompt = async (id: string, updates: Partial<AIPrompt>): Promise<AIPrompt> => {
  const { data, error } = await supabase
    .from("ai_prompts")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao atualizar prompt:", error);
    throw error;
  }

  return data;
};

export const deletePrompt = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("ai_prompts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir prompt:", error);
    throw error;
  }
};

export const setActivePrompt = async (id: string): Promise<AIPrompt> => {
  const { data, error } = await supabase
    .from("ai_prompts")
    .update({ is_active: true })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao definir prompt como ativo:", error);
    throw error;
  }

  return data;
};
