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
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres'
  }),
  email: z.string().email({
    message: 'Email inválido'
  }),
  crp: z.string().min(4, {
    message: 'CRP inválido'
  }),
  phone: z.string().optional(),
  specialization: z.string().optional(),
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
      name: '',
      email: '',
      crp: '',
      phone: '',
      specialization: '',
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

        // Use the ID directly as string (UUID)
        const {
          data,
          error
        } = await supabase.from('psychologists').select('name, email, crp, phone, specialization, bio').eq('id', psychologistId).single();
        if (error) {
          throw error;
        }
        if (data) {
          setPsychologistData(data);
          form.reset({
            name: data.name || '',
            email: data.email || '',
            crp: data.crp || '',
            phone: data.phone || '',
            specialization: data.specialization || '',
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

      // Use the ID directly as string (UUID)
      const {
        error
      } = await supabase.from('psychologists').update({
        name: values.name,
        email: values.email,
        crp: values.crp,
        phone: values.phone || null,
        specialization: values.specialization || null,
        bio: values.bio || null,
        updated_at: new Date().toISOString()
      }).eq('id', psychologistId);
      if (error) {
        throw error;
      }
      localStorage.setItem('psychologistName', values.name);
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
        <p className="text-gray-500 mb-6">Gerencie suas informações pessoais e preferências da conta</p>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-neutral-700 text-xl font-medium">Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !psychologistData ? <div className="text-center py-6">Carregando informações...</div> : <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <UserRound size={16} className="text-portal-purple" />
                            Nome Completo
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
                  
                  <FormField control={form.control} name="specialization" render={({
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
                    <Button type="submit" disabled={isLoading} className="bg-portal-purple hover:bg-portal-purple-dark">
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
