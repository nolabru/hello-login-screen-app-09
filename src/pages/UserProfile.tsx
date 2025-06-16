import React, { useEffect, useState } from "react";
import { UserProfileForm } from "@/components/user/UserProfileForm";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UserProfile: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleUserIdFromUrl = async () => {
      try {
        // Verificar se há um user_id na URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user_id');

        if (userId) {
          console.log('🔄 user_id encontrado na URL:', userId);
          
          // Criar uma sessão temporária para este usuário
          // Isso permite que o hook useUserProfile funcione corretamente
          localStorage.setItem('temp_user_id', userId);
          
          // Remover user_id da URL por segurança
          window.history.replaceState({}, document.title, window.location.pathname);
          
          console.log('✅ user_id processado com sucesso');
        } else {
          // Verificar se já há uma sessão ativa ou user_id temporário
          const { data: { session } } = await supabase.auth.getSession();
          const tempUserId = localStorage.getItem('temp_user_id');
          
          if (!session && !tempUserId) {
            setAuthError('Usuário não autenticado. Acesse através do aplicativo móvel.');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar user_id:', error);
        setAuthError('Erro ao processar dados do usuário');
      } finally {
        setIsAuthenticating(false);
      }
    };

    handleUserIdFromUrl();
  }, []);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Autenticando...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription className="text-center">
              {authError}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Editar Perfil - Portal Calma</title>
        <meta name="description" content="Edite suas informações pessoais e preferências no Portal Calma" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meu Perfil
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mantenha suas informações atualizadas para uma experiência personalizada
            </p>
          </div>
          
          <UserProfileForm />
        </div>
      </div>
    </>
  );
};

export default UserProfile;
