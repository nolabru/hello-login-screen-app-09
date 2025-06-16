import { z } from "zod";

export const userProfileFormSchema = z.object({
  preferred_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .trim(),
  
  gender: z.enum(["Masculino", "Feminino", "Não binário"], {
    required_error: "Selecione um gênero",
  }),
  
  age_range: z.enum(["18-24", "25-34", "35-44", "45-54", "55+"], {
    required_error: "Selecione uma faixa etária",
  }),
  
  aia_objectives: z
    .array(z.string())
    .min(1, "Selecione pelo menos um objetivo")
    .max(5, "Selecione no máximo 5 objetivos"),
  
  mental_health_experience: z.enum(["Diariamente", "Já tentei", "Nunca fiz"], {
    required_error: "Selecione sua experiência com saúde mental",
  }),
  
  profile_photo: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileFormSchema>;

// Opções disponíveis para os campos de seleção
export const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Não binário", label: "Não binário" },
] as const;

export const AGE_RANGE_OPTIONS = [
  { value: "18-24", label: "18-24 anos" },
  { value: "25-34", label: "25-34 anos" },
  { value: "35-44", label: "35-44 anos" },
  { value: "45-54", label: "45-54 anos" },
  { value: "55+", label: "55+ anos" },
] as const;

export const AIA_OBJECTIVES_OPTIONS = [
  { value: "Acompanhar a minha vida", label: "Acompanhar a minha vida" },
  { value: "Libertar emoções", label: "Libertar emoções" },
  { value: "Melhorar o bem-estar mental", label: "Melhorar o bem-estar mental" },
  { value: "Processar os meus pensamentos", label: "Processar os meus pensamentos" },
  { value: "Praticar auto-reflexão", label: "Praticar auto-reflexão" },
] as const;

export const MENTAL_HEALTH_EXPERIENCE_OPTIONS = [
  { value: "Diariamente", label: "Diariamente" },
  { value: "Já tentei", label: "Já tentei" },
  { value: "Nunca fiz", label: "Nunca fiz" },
] as const;
