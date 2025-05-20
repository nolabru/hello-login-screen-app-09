
import * as z from 'zod';

// Esquema para adicionar um único funcionário
export const addSingleEmployeeSchema = z.object({
  nome: z.string().min(2, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email válido é obrigatório' }),
  cpf: z.string().min(11, { message: 'CPF válido é obrigatório' }),
  senha: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export type AddSingleEmployeeFormValues = z.infer<typeof addSingleEmployeeSchema>;

// Esquema para vincular um funcionário existente
export const linkEmployeeSchema = z.object({
  email: z.string().email({ message: 'Email válido é obrigatório' }),
});

export type LinkEmployeeFormValues = z.infer<typeof linkEmployeeSchema>;
