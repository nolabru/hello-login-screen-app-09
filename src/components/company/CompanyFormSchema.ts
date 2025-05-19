
import * as z from 'zod';

// Validation schema for the company registration form
export const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: 'Nome da empresa é obrigatório' }),
  legalName: z.string().min(2, { message: 'Razão social é obrigatória' }),
  corporateEmail: z.string().email({ message: 'Email corporativo válido é obrigatório' }),
  cnpj: z.string().min(14, { message: 'CNPJ válido é obrigatório' }),
  contactEmail: z.string().email({ message: 'Email de contato válido é obrigatório' }),
  contactPhone: z.string().min(10, { message: 'Telefone de contato válido é obrigatório' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
