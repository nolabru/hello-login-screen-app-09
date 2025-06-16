import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserProfileFormData } from "@/components/user/UserProfileFormSchema";
import { Tables } from "@/integrations/supabase/types";

// Usar o tipo do Supabase para user_profiles
type UserProfileRow = Tables<"user_profiles">;

interface UserProfile {
  id: number;
  user_id: string;
  name: string; // preferred_name será mapeado para name
  gender: string | null;
  age_range: string | null;
  objective: string | null; // aia_objectives será mapeado para objective
  experience: string | null; // mental_health_experience será mapeado para experience
  email: string;
  phone: string | null;
  company_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar perfil do usuário atual
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se há um user_id temporário (vindo do app móvel)
      const tempUserId = localStorage.getItem('temp_user_id');
      let userId: string;

      if (tempUserId) {
        // Usar user_id temporário
        userId = tempUserId;
        console.log('🔄 Usando user_id temporário:', userId);
      } else {
        // Obter usuário atual da sessão
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Erro de autenticação:', authError);
          throw new Error("Usuário não autenticado");
        }

        if (!user) {
          console.error('❌ Usuário não encontrado na sessão');
          throw new Error("Usuário não encontrado");
        }

        userId = user.id;
        console.log('🔄 Usando user_id da sessão:', userId);
      }

      console.log('🔍 Buscando perfil para user_id:', userId);

      // Buscar perfil do usuário
      const { data, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        console.error('❌ Código do erro:', profileError.code);
        console.error('❌ Mensagem do erro:', profileError.message);
        throw new Error(`Perfil não encontrado: ${profileError.message}`);
      }

      console.log('✅ Perfil encontrado:', data);

      // Mapear os dados do Supabase para nossa interface
      // Usar casting pois os tipos TypeScript estão desatualizados
      const realData = data as any;
      
      const mappedProfile: UserProfile = {
        id: realData.id,
        user_id: realData.user_id,
        name: realData.preferred_name, // ✅ Campo real da tabela
        gender: realData.gender, // ✅ Campo correto
        age_range: realData.age_range, // ✅ Campo correto
        objective: Array.isArray(realData.aia_objectives) ? realData.aia_objectives.join(", ") : realData.aia_objectives, // ✅ Campo real da tabela (array)
        experience: realData.mental_health_experience, // ✅ Campo real da tabela
        email: realData.email, // ✅ Campo correto
        phone: realData.phone_number, // ✅ Campo real da tabela
        company_id: realData.company_id, // ✅ Campo correto
        created_at: realData.created_at, // ✅ Campo correto
        updated_at: realData.updated_at, // ✅ Campo correto
      };

      setProfile(mappedProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar perfil";
      setError(errorMessage);
      console.error("Erro ao buscar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil do usuário
  const updateUserProfile = async (formData: UserProfileFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se há um user_id temporário (vindo do app móvel)
      const tempUserId = localStorage.getItem('temp_user_id');
      let userId: string;

      if (tempUserId) {
        // Usar user_id temporário
        userId = tempUserId;
        console.log('🔄 Atualizando perfil via app móvel, user_id:', userId);
      } else {
        // Obter usuário atual da sessão
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Erro de autenticação:', authError);
          throw new Error("Usuário não autenticado");
        }

        if (!user) {
          console.error('❌ Usuário não encontrado na sessão');
          throw new Error("Usuário não encontrado");
        }

        userId = user.id;
        console.log('🔄 Atualizando perfil via webapp, user_id:', userId);
      }

      console.log('🔄 Atualizando perfil para user_id:', userId);

      // Atualizar perfil usando campos reais da tabela
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          preferred_name: formData.preferred_name, // ✅ Campo real da tabela
          gender: formData.gender,
          age_range: formData.age_range,
          aia_objectives: formData.aia_objectives, // ✅ Campo real da tabela (array)
          mental_health_experience: formData.mental_health_experience, // ✅ Campo real da tabela
          updated_at: new Date().toISOString(),
        } as any) // Usar casting pois os tipos estão desatualizados
        .eq("user_id", userId);

      if (updateError) {
        throw new Error("Erro ao atualizar perfil");
      }

      // Recarregar perfil atualizado
      await fetchUserProfile();

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      setError(errorMessage);
      
      toast({
        title: "Erro ao atualizar perfil",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("Erro ao atualizar perfil:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload de foto de perfil
  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    try {
      // Obter usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error("Erro ao fazer upload da foto");
      }

      // Obter URL pública da foto
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer upload da foto";
      setError(errorMessage);
      
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("Erro no upload da foto:", err);
      return null;
    }
  };

  // Carregar perfil ao montar o componente
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
    uploadProfilePhoto,
  };
};
