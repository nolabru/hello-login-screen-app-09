
import * as z from 'zod';

// Validation schema for the psychologist registration form
export const psychologistFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email válido é obrigatório' }),
  phone: z.string().optional(),
  crp: z.string()
    .length(7, { message: 'CRP deve conter exatamente 7 caracteres' })
    .regex(/^\d+$/, { message: 'CRP deve conter apenas números' }),
  specialization: z.string().min(2, { message: 'Especialização é obrigatória' }),
  biography: z.string().optional(),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export type PsychologistFormValues = z.infer<typeof psychologistFormSchema>;
