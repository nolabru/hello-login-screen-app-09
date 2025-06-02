import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserRound, Mail, Phone, FileText } from 'lucide-react';

// Define the form schema for psychologist profile
const profileSchema = z.object({
  nome: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres'
  }),
  email: z.string().email({
    message: 'Email inválido'
  }),
  crp: z.string().min(4, {
    message: 'CRP inválido'
  }),
  phone: z.string().optional(),
  especialidade: z.string().optional(),
  bio: z.string().optional()
});
type ProfileFormValues = z.infer<typeof profileSchema>;
const PsychologistSettings = () => {
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [psychologistData, setPsychologistData] = useState<ProfileFormValues | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: '',
      email: '',
      crp: '',
      phone: '',
      especialidade: '',
      bio: ''
    }
  });

  // Fetch psychologist data on component mount
  useEffect(() => {
    const fetchPsychologistData = async () => {
      setIsLoading(true);
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          toast({
            title: "Erro",
            description: "Usuário não autenticado",
            variant: "destructive"
          });
          return;
        }

        // Converting string to number with parseInt
        const psychologistIdNumber = parseInt(psychologistId, 10);
        const {
          data,
          error
        } = await supabase.from('psychologists').select('nome, email, crp, phone, especialidade, bio').eq('id', psychologistIdNumber).single();
        if (error) {
          throw error;
        }
        if (data) {
          setPsychologistData(data);
          form.reset({
            nome: data.nome || '',
            email: data.email || '',
            crp: data.crp || '',
            phone: data.phone || '',
            especialidade: data.especialidade || '',
            bio: data.bio || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do psicólogo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPsychologistData();
  }, [toast, form]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Usuário não autenticado');
      }

      // Converting string to number with parseInt
      const psychologistIdNumber = parseInt(psychologistId, 10);
      const {
        error
      } = await supabase.from('psychologists').update({
        nome: values.nome,
        email: values.email,
        crp: values.crp,
        phone: values.phone || null,
        especialidade: values.especialidade || null,
        bio: values.bio || null,
        atualizado_em: new Date().toISOString()
      }).eq('id', psychologistIdNumber);
      if (error) {
        throw error;
      }
      localStorage.setItem('psychologistName', values.nome);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-medium text-neutral-700">Configurações</h1>
        <p className="text-gray-500 mb-6">Gerencie suas informações pessoais e preferências da conta.</p>
        
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-neutral-700 text-xl font-medium">Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !psychologistData ? <div className="text-center py-6">Carregando informações...</div> : <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="nome" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <UserRound size={16} className="text-portal-purple" />
                            Nome completo
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="email" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Mail size={16} className="text-portal-purple" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="crp" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FileText size={16} className="text-portal-purple" />
                            CRP
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="phone" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Phone size={16} className="text-portal-purple" />
                            Telefone
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                  
                  <FormField control={form.control} name="especialidade" render={({
                field
              }) => <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-portal-purple" />
                          Especialidade
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="bio" render={({
                field
              }) => <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <UserRound size={16} className="text-portal-purple" />
                          Biografia
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Biografia Profissional (Opcional)" className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Form>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>;
};
export default PsychologistSettings;