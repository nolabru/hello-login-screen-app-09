
import * as z from 'zod';

// Esquema para adicionar um único funcionário
export const addSingleEmployeeSchema = z.object({
  nome: z.string().min(2, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email válido é obrigatório' }),
  department_id: z.string().optional().nullable(),
});

export type AddSingleEmployeeFormValues = z.infer<typeof addSingleEmployeeSchema>;

// Esquema para vincular um funcionário existente
export const linkEmployeeSchema = z.object({
  email: z.string().email({ message: 'Email válido é obrigatório' }),
});

export type LinkEmployeeFormValues = z.infer<typeof linkEmployeeSchema>;
