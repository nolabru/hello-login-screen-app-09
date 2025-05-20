
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Schema validation types
export interface AddSingleEmployeeFormValues {
  nome: string;
  email: string;
  cpf?: string;
  senha: string;
}

export interface LinkEmployeeFormValues {
  email: string;
}

// Add a single employee to the company
export async function addSingleEmployee(
  values: AddSingleEmployeeFormValues,
  companyId: number
): Promise<boolean> {
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
      return false;
    }

    // Criar novo usuário com status pending
    const { data: newUser, error } = await supabase
      .from('user_profiles')
      .insert({
        nome: values.nome,
        email: values.email,
        cpf: values.cpf || '',
        senha: values.senha,
        id_empresa: companyId,
        status: false // Set status as pending (false) until first access
      })
      .select()
      .single();

    if (error) throw error;

    toast({
      title: 'Funcionário adicionado com sucesso',
      description: `${values.nome} foi adicionado à sua empresa. O status é pendente até o primeiro acesso.`,
    });

    return true;
  } catch (error) {
    console.error('Erro ao adicionar funcionário:', error);
    toast({
      variant: 'destructive',
      title: 'Erro ao adicionar funcionário',
      description: 'Ocorreu um erro ao adicionar o funcionário. Tente novamente.',
    });
    return false;
  }
}

// Link an existing employee to the company
export async function linkEmployee(
  values: LinkEmployeeFormValues,
  companyId: number
): Promise<boolean> {
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
      return false;
    }

    if (user.id_empresa === companyId) {
      toast({
        variant: 'destructive',
        title: 'Usuário já vinculado',
        description: 'Este usuário já está vinculado à sua empresa.',
      });
      return false;
    }

    // Atualizar o id_empresa do usuário
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        id_empresa: companyId,
        status: false // Set status as pending (false) until first access
      })
      .eq('id', user.id);

    if (error) throw error;

    toast({
      title: 'Funcionário vinculado com sucesso',
      description: `${user.nome} foi vinculado à sua empresa. O status é pendente até o primeiro acesso.`,
    });

    return true;
  } catch (error) {
    console.error('Erro ao vincular funcionário:', error);
    toast({
      variant: 'destructive',
      title: 'Erro ao vincular funcionário',
      description: 'Ocorreu um erro ao vincular o funcionário. Tente novamente.',
    });
    return false;
  }
}

// Process batch employee upload from CSV file
export async function processBatchUpload(
  file: File,
  companyId: number
): Promise<boolean> {
  try {
    const fileReader = new FileReader();
    
    return new Promise((resolve) => {
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
          resolve(false);
          return;
        }

        // Processar em lote com status pending para novos usuários
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(
            employees.map(emp => ({
              nome: emp.nome,
              email: emp.email,
              cpf: emp.cpf || '',
              senha: emp.senha,
              id_empresa: companyId,
              status: false // Set status as pending (false) until first access
            }))
          );

        if (error) throw error;

        toast({
          title: 'Funcionários adicionados com sucesso',
          description: `${employees.length} funcionários foram adicionados à sua empresa. O status é pendente até o primeiro acesso.`,
        });

        resolve(true);
      };

      fileReader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Erro ao ler arquivo',
          description: 'Ocorreu um erro ao ler o arquivo. Tente novamente.',
        });
        resolve(false);
      };

      fileReader.readAsText(file);
    });
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    toast({
      variant: 'destructive',
      title: 'Erro ao processar arquivo',
      description: 'Ocorreu um erro ao processar o arquivo. Verifique o formato e tente novamente.',
    });
    return false;
  }
}
