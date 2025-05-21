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
      ai_prompts: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          atualizado_em: string | null
          cnpj: string
          contact_email: string
          created_at: string | null
          email: string
          email_de_contato: string | null
          id: number
          name: string
          razao_social: string
          senha: string
          status: boolean
        }
        Insert: {
          atualizado_em?: string | null
          cnpj: string
          contact_email: string
          created_at?: string | null
          email: string
          email_de_contato?: string | null
          id?: number
          name: string
          razao_social: string
          senha: string
          status?: boolean
        }
        Update: {
          atualizado_em?: string | null
          cnpj?: string
          contact_email?: string
          created_at?: string | null
          email?: string
          email_de_contato?: string | null
          id?: number
          name?: string
          razao_social?: string
          senha?: string
          status?: boolean
        }
        Relationships: []
      }
      company_licenses: {
        Row: {
          company_id: number
          created_at: string | null
          expiry_date: string
          id: number
          payment_status: string
          plan_id: number
          start_date: string
          status: string
          total_licenses: number
          updated_at: string | null
          used_licenses: number | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          expiry_date: string
          id?: number
          payment_status?: string
          plan_id: number
          start_date: string
          status?: string
          total_licenses: number
          updated_at?: string | null
          used_licenses?: number | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          expiry_date?: string
          id?: number
          payment_status?: string
          plan_id?: number
          start_date?: string
          status?: string
          total_licenses?: number
          updated_at?: string | null
          used_licenses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_licenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_licenses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "license_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_psychologist_associations: {
        Row: {
          created_at: string | null
          id: number
          id_empresa: number
          id_psicologo: number
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          id_empresa: number
          id_psicologo: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          id_empresa?: number
          id_psicologo?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_psychologist_associations_id_empresa_fkey"
            columns: ["id_empresa"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_psychologist_associations_id_psicologo_fkey"
            columns: ["id_psicologo"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      license_plans: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: number
          max_users: number
          name: string
          price_monthly: number
          price_yearly: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          max_users: number
          name: string
          price_monthly: number
          price_yearly: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          max_users?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      psychologist_patient_notes: {
        Row: {
          atualizado_em: string | null
          conteudo: string
          created_at: string | null
          criado_em: string | null
          id: number
          id_psicologo: number
          id_usuario: number
          note: string | null
          patient_id: number | null
          psychologist_id: number | null
          updated_at: string | null
        }
        Insert: {
          atualizado_em?: string | null
          conteudo: string
          created_at?: string | null
          criado_em?: string | null
          id?: number
          id_psicologo: number
          id_usuario: number
          note?: string | null
          patient_id?: number | null
          psychologist_id?: number | null
          updated_at?: string | null
        }
        Update: {
          atualizado_em?: string | null
          conteudo?: string
          created_at?: string | null
          criado_em?: string | null
          id?: number
          id_psicologo?: number
          id_usuario?: number
          note?: string | null
          patient_id?: number | null
          psychologist_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_patient_notes_id_psicologo_fkey"
            columns: ["id_psicologo"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patient_notes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologists: {
        Row: {
          atualizado_em: string | null
          bio: string | null
          created_at: string | null
          crp: string
          email: string
          especialidade: string | null
          experiencia: string | null
          id: number
          idade: number | null
          name: string | null
          nome: string
          phone: string | null
          senha: string
          specialization: string | null
          status: boolean
        }
        Insert: {
          atualizado_em?: string | null
          bio?: string | null
          created_at?: string | null
          crp: string
          email: string
          especialidade?: string | null
          experiencia?: string | null
          id?: number
          idade?: number | null
          name?: string | null
          nome: string
          phone?: string | null
          senha: string
          specialization?: string | null
          status?: boolean
        }
        Update: {
          atualizado_em?: string | null
          bio?: string | null
          created_at?: string | null
          crp?: string
          email?: string
          especialidade?: string | null
          experiencia?: string | null
          id?: number
          idade?: number | null
          name?: string | null
          nome?: string
          phone?: string | null
          senha?: string
          specialization?: string | null
          status?: boolean
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age_range: string | null
          atualizado_em: string | null
          cpf: string
          created_at: string | null
          email: string
          experience: string | null
          gender: string | null
          genero: string | null
          id: number
          id_empresa: number | null
          idade: number | null
          license_status: string | null
          name: string | null
          nome: string
          objective: string | null
          phone: string | null
          questionario_inicial: string | null
          senha: string
          sobrenome: string | null
          status: boolean
        }
        Insert: {
          age_range?: string | null
          atualizado_em?: string | null
          cpf: string
          created_at?: string | null
          email: string
          experience?: string | null
          gender?: string | null
          genero?: string | null
          id?: number
          id_empresa?: number | null
          idade?: number | null
          license_status?: string | null
          name?: string | null
          nome: string
          objective?: string | null
          phone?: string | null
          questionario_inicial?: string | null
          senha: string
          sobrenome?: string | null
          status?: boolean
        }
        Update: {
          age_range?: string | null
          atualizado_em?: string | null
          cpf?: string
          created_at?: string | null
          email?: string
          experience?: string | null
          gender?: string | null
          genero?: string | null
          id?: number
          id_empresa?: number | null
          idade?: number | null
          license_status?: string | null
          name?: string | null
          nome?: string
          objective?: string | null
          phone?: string | null
          questionario_inicial?: string | null
          senha?: string
          sobrenome?: string | null
          status?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_empresa_fkey"
            columns: ["id_empresa"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_psychologist_associations: {
        Row: {
          atualizado_em: string | null
          created_at: string | null
          historico: string | null
          hora_criacao: string | null
          id: number | null
          id_psicologo: number
          id_relacao: number
          id_usuario: number
          notes: string | null
          psychologist_id: number | null
          status: string
          user_id: number | null
        }
        Insert: {
          atualizado_em?: string | null
          created_at?: string | null
          historico?: string | null
          hora_criacao?: string | null
          id?: number | null
          id_psicologo: number
          id_relacao?: number
          id_usuario: number
          notes?: string | null
          psychologist_id?: number | null
          status?: string
          user_id?: number | null
        }
        Update: {
          atualizado_em?: string | null
          created_at?: string | null
          historico?: string | null
          hora_criacao?: string | null
          id?: number | null
          id_psicologo?: number
          id_relacao?: number
          id_usuario?: number
          notes?: string | null
          psychologist_id?: number | null
          status?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_psychologist_associations_id_psicologo_fkey"
            columns: ["id_psicologo"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_psychologist_associations_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_company_by_email: {
        Args: { email_param: string; password_param: string }
        Returns: {
          id: string
          name: string
          email: string
          company_email: string
        }[]
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: Database["public"]["CompositeTypes"]["admin_check_result"]
      }
      is_company_admin: {
        Args: { company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_plan_type: "company" | "individual" | "inactive"
    }
    CompositeTypes: {
      admin_check_result: {
        is_admin: boolean | null
      }
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_plan_type: ["company", "individual", "inactive"],
    },
  },
} as const
