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
      call_sessions: {
        Row: {
          id: string
          user_id: string
          mood: string | null
          started_at: string
          summary: string | null
        }
        Insert: {
          id?: string
          user_id: string
          mood?: string | null
          started_at?: string
          summary?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string | null
          started_at?: string
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
          cnpj: string
          corp_email: string
          created_at: string | null
          email: string
          id: number
          legal_name: string
          name: string
          password: string
          phone: string | null
          status: boolean
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          corp_email: string
          created_at?: string | null
          email: string
          id?: number
          legal_name: string
          name: string
          password: string
          phone?: string | null
          status?: boolean
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          corp_email?: string
          created_at?: string | null
          email?: string
          id?: number
          legal_name?: string
          name?: string
          password?: string
          phone?: string | null
          status?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      company_licenses: {
        Row: {
          company_id: string
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
          company_id: string
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
          company_id?: string
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
          admin_name: string | null
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
          admin_name?: string | null
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
          admin_name?: string | null
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
          version: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          content: string
          version?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          content?: string
          version?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
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
      session_insights: {
        Row: {
          id: number
          session_id: string
          created_at: string
          topics: string[]
          ai_advice: string
          long_summary: string
        }
        Insert: {
          id?: number
          session_id: string
          created_at?: string
          topics?: string[]
          ai_advice?: string
          long_summary?: string
        }
        Update: {
          id?: number
          session_id?: string
          created_at?: string
          topics?: string[]
          ai_advice?: string
          long_summary?: string
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
      psychologists: {
        Row: {
          bio: string | null
          created_at: string | null
          crp: string
          email: string
          id: string
          name: string
          password: string
          phone: string | null
          specialization: string | null
          status: boolean
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          crp: string
          email: string
          id?: string
          name: string
          password: string
          phone?: string | null
          specialization?: string | null
          status?: boolean
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          crp?: string
          email?: string
          id?: string
          name?: string
          password?: string
          phone?: string | null
          specialization?: string | null
          status?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age_range: string | null
          cpf: string
          created_at: string | null
          email: string
          experience: string | null
          gender: string | null
          id: number
          user_id: string
          company_id: string | null
          license_status: string | null
          name: string
          objective: string | null
          password: string
          phone: string | null
          status: boolean
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          cpf: string
          created_at?: string | null
          email: string
          experience?: string | null
          gender?: string | null
          id?: number
          user_id?: string
          company_id?: string | null
          license_status?: string | null
          name: string
          objective?: string | null
          password: string
          phone?: string | null
          status?: boolean
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          cpf?: string
          created_at?: string | null
          email?: string
          experience?: string | null
          gender?: string | null
          id?: number
          user_id?: string
          company_id?: string | null
          license_status?: string | null
          name?: string
          objective?: string | null
          password?: string
          phone?: string | null
          status?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
