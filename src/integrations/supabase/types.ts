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
      company_departments: {
        Row: {
          id: string
          company_id: string
          name: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_company_departments_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      company_activities: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          activity_type: string
          facilitator_name: string | null
          facilitator_type: string
          start_date: string
          end_date: string | null
          location: string | null
          target_audience: string | null
          max_participants: number | null
          participants_registered: number
          participants_attended: number
          satisfaction_score: number | null
          effectiveness_score: number | null
          mandatory: boolean
          compliance_requirement: string | null
          evidence_files: Json
          attendance_list_url: string | null
          activity_report_url: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          activity_type: string
          facilitator_name?: string | null
          facilitator_type: string
          start_date: string
          end_date?: string | null
          location?: string | null
          target_audience?: string | null
          max_participants?: number | null
          participants_registered?: number
          participants_attended?: number
          satisfaction_score?: number | null
          effectiveness_score?: number | null
          mandatory?: boolean
          compliance_requirement?: string | null
          evidence_files?: Json
          attendance_list_url?: string | null
          activity_report_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          activity_type?: string
          facilitator_name?: string | null
          facilitator_type?: string
          start_date?: string
          end_date?: string | null
          location?: string | null
          target_audience?: string | null
          max_participants?: number | null
          participants_registered?: number
          participants_attended?: number
          satisfaction_score?: number | null
          effectiveness_score?: number | null
          mandatory?: boolean
          compliance_requirement?: string | null
          evidence_files?: Json
          attendance_list_url?: string | null
          activity_report_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_participants: {
        Row: {
          id: string
          activity_id: string
          employee_id: number
          registered_at: string
          attended: boolean
          feedback: string | null
          rating: number | null
          completion_certificate_url: string | null
        }
        Insert: {
          id?: string
          activity_id: string
          employee_id: number
          registered_at?: string
          attended?: boolean
          feedback?: string | null
          rating?: number | null
          completion_certificate_url?: string | null
        }
        Update: {
          id?: string
          activity_id?: string
          employee_id?: number
          registered_at?: string
          attended?: boolean
          feedback?: string | null
          rating?: number | null
          completion_certificate_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "company_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      compliance_reports: {
        Row: {
          id: string
          company_id: string
          report_type: string
          title: string
          report_period_start: string
          report_period_end: string
          report_data: Json
          template_version: string
          status: string
          generated_at: string
          generated_by: string | null
          pdf_url: string | null
          pdf_size_bytes: number | null
          approved_by: string | null
          approved_at: string | null
          approval_notes: string | null
        }
        Insert: {
          id?: string
          company_id: string
          report_type: string
          title: string
          report_period_start: string
          report_period_end: string
          report_data: Json
          template_version: string
          status?: string
          generated_at?: string
          generated_by?: string | null
          pdf_url?: string | null
          pdf_size_bytes?: number | null
          approved_by?: string | null
          approved_at?: string | null
          approval_notes?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          report_type?: string
          title?: string
          report_period_start?: string
          report_period_end?: string
          report_data?: Json
          template_version?: string
          status?: string
          generated_at?: string
          generated_by?: string | null
          pdf_url?: string | null
          pdf_size_bytes?: number | null
          approved_by?: string | null
          approved_at?: string | null
          approval_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      mental_health_alerts: {
        Row: {
          id: string
          company_id: string
          alert_type: string
          severity: number | null
          affected_entity_type: string
          affected_entity_id: string | null
          title: string
          description: string
          trigger_metric: string | null
          current_value: number | null
          threshold_value: number | null
          trend: string
          status: string
          assigned_to: string | null
          action_plan_id: string | null
          triggered_at: string
          acknowledged_at: string | null
          resolved_at: string | null
          notifications_sent: Json
          escalation_level: number
        }
        Insert: {
          id?: string
          company_id: string
          alert_type: string
          severity?: number | null
          affected_entity_type: string
          affected_entity_id?: string | null
          title: string
          description: string
          trigger_metric?: string | null
          current_value?: number | null
          threshold_value?: number | null
          trend: string
          status?: string
          assigned_to?: string | null
          action_plan_id?: string | null
          triggered_at?: string
          acknowledged_at?: string | null
          resolved_at?: string | null
          notifications_sent?: Json
          escalation_level?: number
        }
        Update: {
          id?: string
          company_id?: string
          alert_type?: string
          severity?: number | null
          affected_entity_type?: string
          affected_entity_id?: string | null
          title?: string
          description?: string
          trigger_metric?: string | null
          current_value?: number | null
          threshold_value?: number | null
          trend?: string
          status?: string
          assigned_to?: string | null
          action_plan_id?: string | null
          triggered_at?: string
          acknowledged_at?: string | null
          resolved_at?: string | null
          notifications_sent?: Json
          escalation_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "mental_health_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      action_plans: {
        Row: {
          id: string
          company_id: string
          alert_id: string | null
          title: string
          description: string | null
          priority: string
          objectives: Json
          success_metrics: Json
          immediate_actions: Json
          short_term_actions: Json
          long_term_actions: Json
          responsible_person: string | null
          stakeholders: Json
          target_completion_date: string | null
          review_frequency: string
          status: string
          progress_percentage: number
          created_at: string
          approved_at: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          alert_id?: string | null
          title: string
          description?: string | null
          priority: string
          objectives: Json
          success_metrics: Json
          immediate_actions?: Json
          short_term_actions?: Json
          long_term_actions?: Json
          responsible_person?: string | null
          stakeholders?: Json
          target_completion_date?: string | null
          review_frequency?: string
          status?: string
          progress_percentage?: number
          created_at?: string
          approved_at?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          alert_id?: string | null
          title?: string
          description?: string | null
          priority?: string
          objectives?: Json
          success_metrics?: Json
          immediate_actions?: Json
          short_term_actions?: Json
          long_term_actions?: Json
          responsible_person?: string | null
          stakeholders?: Json
          target_completion_date?: string | null
          review_frequency?: string
          status?: string
          progress_percentage?: number
          created_at?: string
          approved_at?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "mental_health_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_responsible_person_fkey"
            columns: ["responsible_person"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
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
          department_id: string | null
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
          department_id?: string | null
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
          department_id?: string | null
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
          {
            foreignKeyName: "fk_user_profiles_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "company_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          questions: Json
          target_department: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string
          start_date: string | null
          end_date: string | null
          notification_sent: boolean
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          questions: Json
          target_department?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by: string
          start_date?: string | null
          end_date?: string | null
          notification_sent?: boolean
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          questions?: Json
          target_department?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          start_date?: string | null
          end_date?: string | null
          notification_sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      questionnaire_responses: {
        Row: {
          id: string
          questionnaire_id: string
          user_id: string
          company_id: string
          department: string | null
          responses: Json
          completion_status: string
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          user_id: string
          company_id: string
          department?: string | null
          responses: Json
          completion_status?: string
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          questionnaire_id?: string
          user_id?: string
          company_id?: string
          department?: string | null
          responses?: Json
          completion_status?: string
          submitted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "questionnaire_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      questionnaire_analytics: {
        Row: {
          id: string
          questionnaire_id: string
          company_id: string
          total_responses: number
          completion_rate: number
          average_score: number | null
          department_breakdown: Json
          response_trends: Json
          generated_at: string
          period_start: string
          period_end: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          company_id: string
          total_responses?: number
          completion_rate?: number
          average_score?: number | null
          department_breakdown?: Json
          response_trends?: Json
          generated_at?: string
          period_start: string
          period_end: string
        }
        Update: {
          id?: string
          questionnaire_id?: string
          company_id?: string
          total_responses?: number
          completion_rate?: number
          average_score?: number | null
          department_breakdown?: Json
          response_trends?: Json
          generated_at?: string
          period_start?: string
          period_end?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_analytics_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_analytics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
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
