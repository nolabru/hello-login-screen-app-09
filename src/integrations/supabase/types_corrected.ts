export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_content_reports: {
        Row: {
          id: string
          user_id: string
          category: string
          description: string
          timestamp_of_incident: string
          status: string
          created_at: string
          updated_at: string
          reviewed_by: string | null
          reviewed_at: string | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          description: string
          timestamp_of_incident: string
          status?: string
          created_at?: string
          updated_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          description?: string
          timestamp_of_incident?: string
          status?: string
          created_at?: string
          updated_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_content_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      ai_prompts: {
        Row: {
          id: string
          name: string
          content: string
          version: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          content: string
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          content?: string
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      call_sessions: {
        Row: {
          id: string
          user_id: string | null
          started_at: string
          ended_at: string | null
          duration_sec: number | null
          conversation_data: Json | null
          mood: string | null
          summary: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration_sec?: number | null
          conversation_data?: Json | null
          mood?: string | null
          summary?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration_sec?: number | null
          conversation_data?: Json | null
          mood?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      companies: {
        Row: {
          id: string
          cnpj: string
          legal_name: string
          email: string | null
          updated_at: string | null
          name: string
          created_at: string | null
          corp_email: string
          phone: string | null
          status: boolean
          user_id: string | null
        }
        Insert: {
          id?: string
          cnpj: string
          legal_name: string
          email?: string | null
          updated_at?: string | null
          name: string
          created_at?: string | null
          corp_email: string
          phone?: string | null
          status?: boolean
          user_id?: string | null
        }
        Update: {
          id?: string
          cnpj?: string
          legal_name?: string
          email?: string | null
          updated_at?: string | null
          name?: string
          created_at?: string | null
          corp_email?: string
          phone?: string | null
          status?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      company_licenses: {
        Row: {
          id: number
          company_id: string
          plan_id: number
          total_licenses: number
          used_licenses: number
          start_date: string
          expiry_date: string
          status: string
          payment_status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          company_id: string
          plan_id: number
          total_licenses: number
          used_licenses?: number
          start_date: string
          expiry_date: string
          status?: string
          payment_status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          company_id?: string
          plan_id?: number
          total_licenses?: number
          used_licenses?: number
          start_date?: string
          expiry_date?: string
          status?: string
          payment_status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_licenses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "license_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      company_psychologists: {
        Row: {
          id: string
          company_id: string
          psychologist_id: string
          started_at: string | null
          ended_at: string | null
          status: string
        }
        Insert: {
          id?: string
          company_id: string
          psychologist_id: string
          started_at?: string | null
          ended_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          company_id?: string
          psychologist_id?: string
          started_at?: string | null
          ended_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_psychologists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_psychologists_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          }
        ]
      }
      deep_memory: {
        Row: {
          id: number
          user_id: string | null
          embedding: unknown | null
          snippet: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          embedding?: unknown | null
          snippet?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          embedding?: unknown | null
          snippet?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deep_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          code: string
          psychologist_email: string
          patient_id: string
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          code: string
          psychologist_email: string
          patient_id: string
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          psychologist_email?: string
          patient_id?: string
          status?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      license_plans: {
        Row: {
          id: number
          name: string
          description: string | null
          max_users: number
          price_monthly: number
          price_yearly: number
          active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          max_users: number
          price_monthly: number
          price_yearly: number
          active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          max_users?: number
          price_monthly?: number
          price_yearly?: number
          active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      psychologists: {
        Row: {
          id: string
          crp: string
          name: string
          specialization: string
          email: string
          updated_at: string | null
          created_at: string | null
          bio: string | null
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          id?: string
          crp: string
          name: string
          specialization: string
          email: string
          updated_at?: string | null
          created_at?: string | null
          bio?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          crp?: string
          name?: string
          specialization?: string
          email?: string
          updated_at?: string | null
          created_at?: string | null
          bio?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      psychologists_patients: {
        Row: {
          id: string
          psychologist_id: string
          patient_id: string
          started_at: string | null
          ended_at: string | null
          status: string
          patient_email: string | null
        }
        Insert: {
          id?: string
          psychologist_id: string
          patient_id: string
          started_at?: string | null
          ended_at?: string | null
          status?: string
          patient_email?: string | null
        }
        Update: {
          id?: string
          psychologist_id?: string
          patient_id?: string
          started_at?: string | null
          ended_at?: string | null
          status?: string
          patient_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologists_patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologists_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          hour: number
          minute: number
          is_active: boolean
          notification_id: number | null
          last_triggered: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          hour: number
          minute: number
          is_active?: boolean
          notification_id?: number | null
          last_triggered?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          hour?: number
          minute?: number
          is_active?: boolean
          notification_id?: number | null
          last_triggered?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      session_insights: {
        Row: {
          id: number
          session_id: string | null
          created_at: string | null
          topics: string[] | null
          ai_advice: string | null
          long_summary: string | null
        }
        Insert: {
          id?: number
          session_id?: string | null
          created_at?: string | null
          topics?: string[] | null
          ai_advice?: string | null
          long_summary?: string | null
        }
        Update: {
          id?: number
          session_id?: string | null
          created_at?: string | null
          topics?: string[] | null
          ai_advice?: string | null
          long_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      short_memory: {
        Row: {
          user_id: string
          content: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          content?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          content?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "short_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string | null
          preferred_name: string
          gender: string
          age_range: string
          aia_objectives: string[]
          mental_health_experience: string
          created_at: string | null
          updated_at: string | null
          profile_photo: string | null
          full_name: string | null
          phone_number: string | null
          psychologist_id: string | null
          company_id: string | null
          email: string | null
          employee_status: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          preferred_name: string
          gender: string
          age_range: string
          aia_objectives: string[]
          mental_health_experience: string
          created_at?: string | null
          updated_at?: string | null
          profile_photo?: string | null
          full_name?: string | null
          phone_number?: string | null
          psychologist_id?: string | null
          company_id?: string | null
          email?: string | null
          employee_status?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          preferred_name?: string
          gender?: string
          age_range?: string
          aia_objectives?: string[]
          mental_health_experience?: string
          created_at?: string | null
          updated_at?: string | null
          profile_photo?: string | null
          full_name?: string | null
          phone_number?: string | null
          psychologist_id?: string | null
          company_id?: string | null
          email?: string | null
          employee_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_companie_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          }
        ]
      }
      user_streaks: {
        Row: {
          user_id: string
          current_streak: number
          last_login_date: string
          created_at: string
        }
        Insert: {
          user_id: string
          current_streak?: number
          last_login_date?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          current_streak?: number
          last_login_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
