
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Upload } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
  companyId: number;
}

// Schema para validação do formulário de adição individual
const addSingleEmployeeSchema = z.object({
  nome: z.string().min(2, { message: 'Nome precisa ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }).optional(),
  senha: z.string().min(6, { message: 'Senha precisa ter pelo menos 6 caracteres' }),
});

// Schema para validação do formulário de vinculação
const linkEmployeeSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  onEmployeeAdded,
  companyId
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('add');
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addSingleForm = useForm<z.infer<typeof addSingleEmployeeSchema>>({
    resolver: zodResolver(addSingleEmployeeSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      senha: '',
    },
  });

  const linkForm = useForm<z.infer<typeof linkEmployeeSchema>>({
    resolver: zodResolver(linkEmployeeSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBatchFile(e.target.files[0]);
    }
  };

  const handleAddSingleEmployee = async (values: z.infer<typeof addSingleEmployeeSchema>) => {
    setIsLoading(true);
    try {
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', values.email)
        .single();

      if (existingUser) {
        toast({
          variant: 'destructive',
          title: 'Usuário já existe',
          description: 'Um usuário com este email já existe. Tente vincular o usuário existente.',
        });
        return;
      }

      // Criar novo usuário
      const { data: newUser, error } = await supabase
        .from('user_profiles')
        .insert({
          nome: values.nome,
          email: values.email,
          cpf: values.cpf || '',
          senha: values.senha,
          id_empresa: companyId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Funcionário adicionado com sucesso',
        description: `${values.nome} foi adicionado à sua empresa.`,
      });

      addSingleForm.reset();
      onEmployeeAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar funcionário',
        description: 'Ocorreu um erro ao adicionar o funcionário. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkEmployee = async (values: z.infer<typeof linkEmployeeSchema>) => {
    setIsLoading(true);
    try {
      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('id, nome, id_empresa')
        .eq('email', values.email)
        .single();

      if (userError || !user) {
        toast({
          variant: 'destructive',
          title: 'Usuário não encontrado',
          description: 'Não foi encontrado nenhum usuário com este email.',
        });
        return;
      }

      if (user.id_empresa === companyId) {
        toast({
          variant: 'destructive',
          title: 'Usuário já vinculado',
          description: 'Este usuário já está vinculado à sua empresa.',
        });
        return;
      }

      // Atualizar o id_empresa do usuário
      const { error } = await supabase
        .from('user_profiles')
        .update({ id_empresa: companyId })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Funcionário vinculado com sucesso',
        description: `${user.nome} foi vinculado à sua empresa.`,
      });

      linkForm.reset();
      onEmployeeAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao vincular funcionário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao vincular funcionário',
        description: 'Ocorreu um erro ao vincular o funcionário. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!batchFile) {
      toast({
        variant: 'destructive',
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo CSV para importar funcionários.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        
        // Skip header line and process each row
        const employees = lines.slice(1).filter(line => line.trim()).map(line => {
          const [nome, email, cpf, senha] = line.split(',').map(item => item.trim());
          return { nome, email, cpf, senha };
        });

        if (employees.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Arquivo vazio',
            description: 'O arquivo não contém dados válidos.',
          });
          return;
        }

        // Processar em lote
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(
            employees.map(emp => ({
              nome: emp.nome,
              email: emp.email,
              cpf: emp.cpf || '',
              senha: emp.senha,
              id_empresa: companyId
            }))
          );

        if (error) throw error;

        toast({
          title: 'Funcionários adicionados com sucesso',
          description: `${employees.length} funcionários foram adicionados à sua empresa.`,
        });

        setBatchFile(null);
        onEmployeeAdded();
        onOpenChange(false);
      };

      fileReader.readAsText(batchFile);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao processar arquivo',
        description: 'Ocorreu um erro ao processar o arquivo. Verifique o formato e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Funcionário</DialogTitle>
          <DialogDescription>
            Adicione funcionários individualmente ou em lote à sua empresa.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Adicionar Novo</TabsTrigger>
            <TabsTrigger value="link">Vincular Existente</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-4 space-y-4">
            <Tabs defaultValue="single">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Individual</TabsTrigger>
                <TabsTrigger value="batch">Em Lote</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-4 space-y-4">
                <Form {...addSingleForm}>
                  <form onSubmit={addSingleForm.handleSubmit(handleAddSingleEmployee)} className="space-y-4">
                    <FormField
                      control={addSingleForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addSingleForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addSingleForm.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="CPF" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addSingleForm.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input placeholder="Senha" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Processando...' : 'Adicionar Funcionário'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="batch" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Formato do arquivo CSV</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      O arquivo deve ter as seguintes colunas:
                    </p>
                    <code className="text-xs block bg-gray-100 p-2 rounded">
                      nome,email,cpf,senha
                    </code>
                    <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-200">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Exemplo:</h5>
                      <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
nome,email,cpf,senha
João Silva,joao.silva@email.com,12345678900,senha123
Maria Oliveira,maria@email.com,98765432100,senha456
Carlos Pereira,carlos@email.com,11122233344,senha789
                      </pre>
                    </div>
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="file">Arquivo CSV</Label>
                    <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
                  </div>
                  
                  <Button 
                    onClick={handleBatchUpload} 
                    className="w-full"
                    disabled={!batchFile || isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isLoading ? 'Processando...' : 'Importar Funcionários'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="space-y-4">
              <Form {...linkForm}>
                <form onSubmit={linkForm.handleSubmit(handleLinkEmployee)} className="space-y-4">
                  <FormField
                    control={linkForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do funcionário</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Vincular Funcionário'}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
