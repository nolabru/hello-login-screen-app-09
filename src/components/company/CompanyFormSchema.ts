
import * as z from 'zod';

// Função para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais (caso inválido)
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  
  // Soma os produtos dos dígitos com os pesos
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  // Cálculo do primeiro dígito verificador
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  
  // Verifica o primeiro dígito verificador
  if (parseInt(cnpj.charAt(12)) !== dv1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  peso = 6;
  
  // Soma os produtos dos dígitos com os pesos
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  // Cálculo do segundo dígito verificador
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  
  // Verifica o segundo dígito verificador
  return parseInt(cnpj.charAt(13)) === dv2;
}

// Validation schema for the company registration form
export const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: 'Nome da empresa é obrigatório' }),
  legalName: z.string().min(2, { message: 'Razão social é obrigatória' }),
  corporateEmail: z.string().email({ message: 'Email corporativo válido é obrigatório' }),
  cnpj: z.string()
    .min(14, { message: 'CNPJ deve ter pelo menos 14 dígitos' })
    .refine(
      (value) => isValidCNPJ(value),
      { message: 'CNPJ inválido. Verifique os dígitos informados.' }
    ),
  contactEmail: z.string().email({ message: 'Email de contato válido é obrigatório' }),
  contactPhone: z.string().min(10, { message: 'Telefone de contato válido é obrigatório' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
