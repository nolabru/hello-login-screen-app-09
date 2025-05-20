
import * as z from 'zod';

// Schema para validação do formulário de adição individual
export const addSingleEmployeeSchema = z.object({
  nome: z.string().min(2, { message: 'Nome precisa ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }).optional(),
  senha: z.string().min(6, { message: 'Senha precisa ter pelo menos 6 caracteres' }),
});

// Schema para validação do formulário de vinculação
export const linkEmployeeSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

// Export the exact types that match the schema definitions
export type AddSingleEmployeeFormValues = z.infer<typeof addSingleEmployeeSchema>;
export type LinkEmployeeFormValues = z.infer<typeof linkEmployeeSchema>;
