
export interface UserProfile {
  id: string;
  user_id: string | null;
  preferred_name: string;
  gender: string;
  age_range: string;
  aia_objectives: string[];
  mental_health_experience: string;
  created_at: string | null;
  updated_at: string | null;
  profile_photo: string | null;
  full_name: string | null;
  phone_number: string | null;
  psychologist_id: string | null;
  company_id: string | null;
  email: string | null;
  employee_status: string;
  // Campos legacy para compatibilidade
  nome?: string;
  id_empresa?: string | null;
  license_status?: string | null;
}

// Interface para compatibilidade com código existente (DEPRECATED)
export interface UserProfileLegacy {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  status: boolean;
  phone: string | null;
  id_empresa: string | null;
  license_status: string | null;
}
