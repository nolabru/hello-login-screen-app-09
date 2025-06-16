import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserProfileFormData, userProfileFormSchema } from "./UserProfileFormSchema";
import { UserProfileFormFields } from "./UserProfileFormFields";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const UserProfileForm: React.FC = () => {
  const { profile, loading, error, updateUserProfile } = useUserProfile();

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      preferred_name: "",
      gender: undefined,
      age_range: undefined,
      aia_objectives: [],
      mental_health_experience: undefined,
      profile_photo: "",
    },
  });

  // Preencher formulário quando o perfil for carregado
  useEffect(() => {
    if (profile) {
      // Converter objective (string) de volta para array
      const objectives = profile.objective 
        ? profile.objective.split(", ").filter(obj => obj.trim() !== "")
        : [];

      form.reset({
        preferred_name: profile.name || "",
        gender: profile.gender as "Masculino" | "Feminino" | "Não binário" | undefined,
        age_range: profile.age_range as "18-24" | "25-34" | "35-44" | "45-54" | "55+" | undefined,
        aia_objectives: objectives,
        mental_health_experience: profile.experience as "Diariamente" | "Já tentei" | "Nunca fiz" | undefined,
        profile_photo: "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: UserProfileFormData) => {
    const success = await updateUserProfile(data);
    if (success) {
      // Formulário será atualizado automaticamente pelo hook
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando perfil...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Editar Perfil</CardTitle>
          </div>
          <CardDescription>
            Atualize suas informações pessoais e preferências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <UserProfileFormFields
                form={form}
              />

              <Separator />

              {/* Informações Somente Leitura */}
              {profile && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações da Conta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <p>{profile.email}</p>
                    </div>
                    {profile.phone && (
                      <div>
                        <span className="font-medium text-muted-foreground">Telefone:</span>
                        <p>{profile.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-muted-foreground">Membro desde:</span>
                      <p>
                        {profile.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
