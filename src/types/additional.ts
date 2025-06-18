// Tipos adicionais baseados no schema real

export interface Psychologist {
  id: string;
  crp: string;
  name: string;
  specialization: string;
  email: string;
  updated_at: string | null;
  created_at: string | null;
  bio: string | null;
  phone: string | null;
  status: string | boolean;
  user_id?: string | null;
}

export interface CompanyPsychologist {
  id: string;
  company_id: string;
  psychologist_id: string;
  started_at: string | null;
  ended_at: string | null;
  status: string;
}

export interface PsychologistPatient {
  id: string;
  psychologist_id: string;
  patient_id: string;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  patient_email: string | null;
}

export interface Invitation {
  id: string;
  code: string;
  psychologist_email: string;
  patient_id: string;
  status: string;
  created_at: string | null;
}

export interface Reminder {
  id: string;
  user_id: string;
  hour: number;
  minute: number;
  is_active: boolean;
  notification_id: number | null;
  last_triggered: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CallSession {
  id: string;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  conversation_data: any | null;
  mood: string | null;
  summary: string | null;
}

export interface SessionInsight {
  id: number;
  session_id: string | null;
  created_at: string | null;
  topics: string[] | null;
  ai_advice: string | null;
  long_summary: string | null;
}

export interface DeepMemory {
  id: number;
  user_id: string | null;
  embedding: unknown | null;
  snippet: string | null;
  created_at: string | null;
}

export interface ShortMemory {
  user_id: string;
  content: string | null;
  updated_at: string | null;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  last_login_date: string;
  created_at: string;
}

export interface AIContentReport {
  id: string;
  user_id: string;
  category: string;
  description: string;
  timestamp_of_incident: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
}
