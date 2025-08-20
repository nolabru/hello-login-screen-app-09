export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          alert_id: string | null
          approved_at: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          immediate_actions: Json | null
          long_term_actions: Json | null
          objectives: Json
          priority: string
          progress_percentage: number | null
          responsible_person: string | null
          review_frequency: string | null
          short_term_actions: Json | null
          stakeholders: Json | null
          started_at: string | null
          status: string | null
          success_metrics: Json
          target_completion_date: string | null
          title: string
        }
        Insert: {
          alert_id?: string | null
          approved_at?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          immediate_actions?: Json | null
          long_term_actions?: Json | null
          objectives: Json
          priority: string
          progress_percentage?: number | null
          responsible_person?: string | null
          review_frequency?: string | null
          short_term_actions?: Json | null
          stakeholders?: Json | null
          started_at?: string | null
          status?: string | null
          success_metrics: Json
          target_completion_date?: string | null
          title: string
        }
        Update: {
          alert_id?: string | null
          approved_at?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          immediate_actions?: Json | null
          long_term_actions?: Json | null
          objectives?: Json
          priority?: string
          progress_percentage?: number | null
          responsible_person?: string | null
          review_frequency?: string | null
          short_term_actions?: Json | null
          stakeholders?: Json | null
          started_at?: string | null
          status?: string | null
          success_metrics?: Json
          target_completion_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "mental_health_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_participants: {
        Row: {
          activity_id: string | null
          attended: boolean | null
          completion_certificate_url: string | null
          employee_id: string | null
          feedback: string | null
          id: string
          rating: number | null
          registered_at: string | null
        }
        Insert: {
          activity_id?: string | null
          attended?: boolean | null
          completion_certificate_url?: string | null
          employee_id?: string | null
          feedback?: string | null
          id?: string
          rating?: number | null
          registered_at?: string | null
        }
        Update: {
          activity_id?: string | null
          attended?: boolean | null
          completion_certificate_url?: string | null
          employee_id?: string | null
          feedback?: string | null
          id?: string
          rating?: number | null
          registered_at?: string | null
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
          },
        ]
      }
      ai_content_reports: {
        Row: {
          admin_name: string | null
          admin_notes: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          timestamp_of_incident: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_name?: string | null
          admin_notes?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          timestamp_of_incident: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_name?: string | null
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          timestamp_of_incident?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_content_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_content_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          category: string
          date: string
          id: string
          long_summary: string | null
          summary: string | null
          text: string
          title: string
        }
        Insert: {
          category: string
          date: string
          id?: string
          long_summary?: string | null
          summary?: string | null
          text: string
          title: string
        }
        Update: {
          category?: string
          date?: string
          id?: string
          long_summary?: string | null
          summary?: string | null
          text?: string
          title?: string
        }
        Relationships: []
      }
      call_sessions: {
        Row: {
          conversation_data: Json | null
          cost_usd: number | null
          duration_sec: number | null
          ended_at: string | null
          general_summary: string | null
          id: string
          input_tokens: number | null
          model_used: string | null
          mood: Database["public"]["Enums"]["mood_enum"] | null
          output_tokens: number | null
          pre_consultation: string | null
          started_at: string | null
          summary: string | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          conversation_data?: Json | null
          cost_usd?: number | null
          duration_sec?: number | null
          ended_at?: string | null
          general_summary?: string | null
          id?: string
          input_tokens?: number | null
          model_used?: string | null
          mood?: Database["public"]["Enums"]["mood_enum"] | null
          output_tokens?: number | null
          pre_consultation?: string | null
          started_at?: string | null
          summary?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          conversation_data?: Json | null
          cost_usd?: number | null
          duration_sec?: number | null
          ended_at?: string | null
          general_summary?: string | null
          id?: string
          input_tokens?: number | null
          model_used?: string | null
          mood?: Database["public"]["Enums"]["mood_enum"] | null
          output_tokens?: number | null
          pre_consultation?: string | null
          started_at?: string | null
          summary?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          ai_messages: string[] | null
          duration_sec: number | null
          end_time: string | null
          id: string
          start_time: string | null
          user_id: string
          user_messages: string[] | null
        }
        Insert: {
          ai_messages?: string[] | null
          duration_sec?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          user_id: string
          user_messages?: string[] | null
        }
        Update: {
          ai_messages?: string[] | null
          duration_sec?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          user_id?: string
          user_messages?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string
          corp_email: string
          created_at: string | null
          email: string | null
          id: string
          legal_name: string
          name: string
          phone: string | null
          status: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cnpj: string
          corp_email: string
          created_at?: string | null
          email?: string | null
          id?: string
          legal_name: string
          name: string
          phone?: string | null
          status?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cnpj?: string
          corp_email?: string
          created_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string
          name?: string
          phone?: string | null
          status?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      company_activities: {
        Row: {
          activity_report_url: string | null
          activity_type: string
          attendance_list_url: string | null
          company_id: string
          compliance_requirement: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effectiveness_score: number | null
          end_date: string | null
          evidence_files: Json | null
          facilitator_name: string | null
          facilitator_type: string
          id: string
          location: string | null
          mandatory: boolean | null
          max_participants: number | null
          participants_attended: number | null
          participants_registered: number | null
          satisfaction_score: number | null
          start_date: string
          status: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_report_url?: string | null
          activity_type: string
          attendance_list_url?: string | null
          company_id: string
          compliance_requirement?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effectiveness_score?: number | null
          end_date?: string | null
          evidence_files?: Json | null
          facilitator_name?: string | null
          facilitator_type: string
          id?: string
          location?: string | null
          mandatory?: boolean | null
          max_participants?: number | null
          participants_attended?: number | null
          participants_registered?: number | null
          satisfaction_score?: number | null
          start_date: string
          status?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_report_url?: string | null
          activity_type?: string
          attendance_list_url?: string | null
          company_id?: string
          compliance_requirement?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effectiveness_score?: number | null
          end_date?: string | null
          evidence_files?: Json | null
          facilitator_name?: string | null
          facilitator_type?: string
          id?: string
          location?: string | null
          mandatory?: boolean | null
          max_participants?: number | null
          participants_attended?: number | null
          participants_registered?: number | null
          satisfaction_score?: number | null
          start_date?: string
          status?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_departments: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
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
            foreignKeyName: "company_licenses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "license_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_psychologists: {
        Row: {
          company_id: string
          ended_at: string | null
          id: string
          psychologist_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          company_id: string
          ended_at?: string | null
          id?: string
          psychologist_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          ended_at?: string | null
          id?: string
          psychologist_id?: string
          started_at?: string | null
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
          },
        ]
      }
      compliance_reports: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          company_id: string
          generated_at: string | null
          generated_by: string | null
          id: string
          pdf_size_bytes: number | null
          pdf_url: string | null
          report_data: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          status: string | null
          template_version: string
          title: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          pdf_size_bytes?: number | null
          pdf_url?: string | null
          report_data: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          status?: string | null
          template_version: string
          title: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          pdf_size_bytes?: number | null
          pdf_url?: string | null
          report_data?: Json
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          status?: string | null
          template_version?: string
          title?: string
        }
        Relationships: []
      }
      deep_memory: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: number
          snippet: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: number
          snippet?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: number
          snippet?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deep_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deep_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      diary: {
        Row: {
          date: string
          emotion: string
          id: string
          user_id: string
          user_text: string
        }
        Insert: {
          date: string
          emotion: string
          id?: string
          user_id: string
          user_text: string
        }
        Update: {
          date?: string
          emotion?: string
          id?: string
          user_id?: string
          user_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "diary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      invitations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          patient_id: string
          psychologist_email: string
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          patient_id: string
          psychologist_email: string
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          psychologist_email?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invitations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
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
      meditation_tracks: {
        Row: {
          id: string
          long_summary: string
          subtitle: string
          summary: string
          title: string
        }
        Insert: {
          id?: string
          long_summary: string
          subtitle: string
          summary: string
          title: string
        }
        Update: {
          id?: string
          long_summary?: string
          subtitle?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      mental_health_alerts: {
        Row: {
          acknowledged_at: string | null
          action_plan_id: string | null
          affected_entity_id: string | null
          affected_entity_type: string
          alert_type: string
          assigned_to: string | null
          company_id: string
          current_value: number | null
          description: string
          escalation_level: number | null
          id: string
          notifications_sent: Json | null
          resolved_at: string | null
          severity: number | null
          status: string | null
          threshold_value: number | null
          title: string
          trend: string
          trigger_metric: string | null
          triggered_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          action_plan_id?: string | null
          affected_entity_id?: string | null
          affected_entity_type: string
          alert_type: string
          assigned_to?: string | null
          company_id: string
          current_value?: number | null
          description: string
          escalation_level?: number | null
          id?: string
          notifications_sent?: Json | null
          resolved_at?: string | null
          severity?: number | null
          status?: string | null
          threshold_value?: number | null
          title: string
          trend: string
          trigger_metric?: string | null
          triggered_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          action_plan_id?: string | null
          affected_entity_id?: string | null
          affected_entity_type?: string
          alert_type?: string
          assigned_to?: string | null
          company_id?: string
          current_value?: number | null
          description?: string
          escalation_level?: number | null
          id?: string
          notifications_sent?: Json | null
          resolved_at?: string | null
          severity?: number | null
          status?: string | null
          threshold_value?: number | null
          title?: string
          trend?: string
          trigger_metric?: string | null
          triggered_at?: string | null
        }
        Relationships: []
      }
      openai_model_prices: {
        Row: {
          id: number
          input_price_per_1k: number
          is_active: boolean | null
          model_name: string
          output_price_per_1k: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          input_price_per_1k: number
          is_active?: boolean | null
          model_name: string
          output_price_per_1k: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          input_price_per_1k?: number
          is_active?: boolean | null
          model_name?: string
          output_price_per_1k?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      phase_progress: {
        Row: {
          completed_at: string | null
          is_completed: boolean
          phase_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          is_completed?: boolean
          phase_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          is_completed?: boolean
          phase_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_progress_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "phase_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      phases: {
        Row: {
          created_at: string | null
          description: string
          duration: number
          id: string
          title: string
          track_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          duration?: number
          id?: string
          title: string
          track_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          duration?: number
          id?: string
          title?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phases_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "meditation_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      phrases: {
        Row: {
          id: string
          phrase: string
        }
        Insert: {
          id?: string
          phrase: string
        }
        Update: {
          id?: string
          phrase?: string
        }
        Relationships: []
      }
      psychologists: {
        Row: {
          bio: string | null
          created_at: string | null
          crp: string
          email: string
          id: string
          name: string
          phone: string | null
          specialization: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          crp: string
          email: string
          id?: string
          name: string
          phone?: string | null
          specialization: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          crp?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          specialization?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      psychologists_patients: {
        Row: {
          ended_at: string | null
          general_summary: string | null
          id: string
          patient_email: string | null
          patient_id: string
          pre_consultation: string | null
          psychologist_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          ended_at?: string | null
          general_summary?: string | null
          id?: string
          patient_email?: string | null
          patient_id: string
          pre_consultation?: string | null
          psychologist_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          ended_at?: string | null
          general_summary?: string | null
          id?: string
          patient_email?: string | null
          patient_id?: string
          pre_consultation?: string | null
          psychologist_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologists_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "psychologists_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "psychologists_patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          hour: number
          id: string
          is_active: boolean | null
          last_triggered: string | null
          minute: number
          notification_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hour: number
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          minute: number
          notification_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hour?: number
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          minute?: number
          notification_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_costs: {
        Row: {
          cost_usd: number
          created_at: string | null
          details: Json | null
          id: string
          service: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          cost_usd: number
          created_at?: string | null
          details?: Json | null
          id?: string
          service: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          details?: Json | null
          id?: string
          service?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_costs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_costs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_insights: {
        Row: {
          ai_advice: string | null
          analysis_cost_usd: number | null
          analysis_tokens: number | null
          created_at: string | null
          id: number
          long_summary: string | null
          note: string | null
          send_psychologist: boolean | null
          session_id: string
          topics: string[] | null
        }
        Insert: {
          ai_advice?: string | null
          analysis_cost_usd?: number | null
          analysis_tokens?: number | null
          created_at?: string | null
          id?: number
          long_summary?: string | null
          note?: string | null
          send_psychologist?: boolean | null
          session_id: string
          topics?: string[] | null
        }
        Update: {
          ai_advice?: string | null
          analysis_cost_usd?: number | null
          analysis_tokens?: number | null
          created_at?: string | null
          id?: number
          long_summary?: string | null
          note?: string | null
          send_psychologist?: boolean | null
          session_id?: string
          topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "session_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_insights_v2: {
        Row: {
          ai_advice: string | null
          analysis_cost_usd: number | null
          analysis_tokens: number | null
          created_at: string | null
          cross_session_insights: Json | null
          emotional_trajectory: Json | null
          entities: Json | null
          id: number
          long_summary: string | null
          patterns: Json | null
          processed_at: string | null
          processing_cost: Json | null
          processing_version: string | null
          risk_indicators: Json | null
          session_id: string | null
          therapeutic_recommendations: Json | null
          topics: string[] | null
        }
        Insert: {
          ai_advice?: string | null
          analysis_cost_usd?: number | null
          analysis_tokens?: number | null
          created_at?: string | null
          cross_session_insights?: Json | null
          emotional_trajectory?: Json | null
          entities?: Json | null
          id: number
          long_summary?: string | null
          patterns?: Json | null
          processed_at?: string | null
          processing_cost?: Json | null
          processing_version?: string | null
          risk_indicators?: Json | null
          session_id?: string | null
          therapeutic_recommendations?: Json | null
          topics?: string[] | null
        }
        Update: {
          ai_advice?: string | null
          analysis_cost_usd?: number | null
          analysis_tokens?: number | null
          created_at?: string | null
          cross_session_insights?: Json | null
          emotional_trajectory?: Json | null
          entities?: Json | null
          id?: number
          long_summary?: string | null
          patterns?: Json | null
          processed_at?: string | null
          processing_cost?: Json | null
          processing_version?: string | null
          risk_indicators?: Json | null
          session_id?: string | null
          therapeutic_recommendations?: Json | null
          topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_insights_v2_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session_insights_v2_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      short_memory: {
        Row: {
          content: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "short_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sound_progress: {
        Row: {
          last_listened_at: string | null
          listened_minutes: number
          progress_id: string
          sound_id: string
          user_id: string
        }
        Insert: {
          last_listened_at?: string | null
          listened_minutes: number
          progress_id?: string
          sound_id: string
          user_id: string
        }
        Update: {
          last_listened_at?: string | null
          listened_minutes?: number
          progress_id?: string
          sound_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sound_progress_sound_id_fkey"
            columns: ["sound_id"]
            isOneToOne: false
            referencedRelation: "sounds"
            referencedColumns: ["sound_id"]
          },
        ]
      }
      sounds: {
        Row: {
          created_at: string | null
          description: string | null
          sound_category: string
          sound_id: string
          sound_time: number
          sound_type: string
          sound_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          sound_category: string
          sound_id?: string
          sound_time: number
          sound_type: string
          sound_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          sound_category?: string
          sound_id?: string
          sound_time?: number
          sound_type?: string
          sound_url?: string | null
          title?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          is_completed: boolean | null
          track_id: string
          user_id: string
        }
        Insert: {
          is_completed?: boolean | null
          track_id?: string
          user_id?: string
        }
        Update: {
          is_completed?: boolean | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "meditation_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age_range: string
          aia_objectives: string[]
          company_id: string | null
          completed_minutes: number
          completed_phases: number
          created_at: string | null
          departament: string | null
          department_id: string | null
          email: string | null
          employee_status: string | null
          full_name: string | null
          gender: string
          id: string
          insight_preference: boolean | null
          mental_health_experience: string
          phone_number: string | null
          preferred_name: string
          profile_photo: string | null
          psychologist_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age_range: string
          aia_objectives: string[]
          company_id?: string | null
          completed_minutes?: number
          completed_phases?: number
          created_at?: string | null
          departament?: string | null
          department_id?: string | null
          email?: string | null
          employee_status?: string | null
          full_name?: string | null
          gender: string
          id?: string
          insight_preference?: boolean | null
          mental_health_experience: string
          phone_number?: string | null
          preferred_name: string
          profile_photo?: string | null
          psychologist_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age_range?: string
          aia_objectives?: string[]
          company_id?: string | null
          completed_minutes?: number
          completed_phases?: number
          created_at?: string | null
          departament?: string | null
          department_id?: string | null
          email?: string | null
          employee_status?: string | null
          full_name?: string | null
          gender?: string
          id?: string
          insight_preference?: boolean | null
          mental_health_experience?: string
          phone_number?: string | null
          preferred_name?: string
          profile_photo?: string | null
          psychologist_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
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
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          last_login_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_login_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_login_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_streaks_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
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
      patient_insights_view_v2: {
        Row: {
          created_at: string | null
          mood: Database["public"]["Enums"]["mood_enum"] | null
          patient_data: Json | null
          processing_version: string | null
          session_id: string | null
          summary: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_insights_v2_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session_insights_v2_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_insights_view_v2: {
        Row: {
          ai_advice: string | null
          analysis_cost_usd: number | null
          analysis_tokens: number | null
          conversation_data: Json | null
          created_at: string | null
          cross_session_insights: Json | null
          duration_sec: number | null
          emotional_trajectory: Json | null
          entities: Json | null
          id: number | null
          long_summary: string | null
          patient_email: string | null
          patient_name: string | null
          patterns: Json | null
          processed_at: string | null
          processing_cost: Json | null
          processing_version: string | null
          risk_indicators: Json | null
          session_id: string | null
          started_at: string | null
          therapeutic_recommendations: Json | null
          topics: string[] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_session_insights_v2_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session_insights_v2_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_completed_minutes: {
        Row: {
          completed_minutes: number | null
          user_id: string | null
        }
        Insert: {
          completed_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          completed_minutes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_user_sessions: {
        Row: {
          id: string | null
          mood: Database["public"]["Enums"]["mood_enum"] | null
          session_date: string | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          mood?: Database["public"]["Enums"]["mood_enum"] | null
          session_date?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          mood?: Database["public"]["Enums"]["mood_enum"] | null
          session_date?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "call_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_completed_minutes"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_reminders_by_time: {
        Args: { target_hour: number; target_minute: number }
        Returns: {
          hour: number
          id: string
          last_triggered: string
          minute: number
          notification_id: number
          user_id: string
        }[]
      }
      get_fragments: {
        Args: { session: string }
        Returns: string[]
      }
      invite_psychologist: {
        Args: { email: string }
        Returns: undefined
      }
      migrate_insights_to_v2: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_track_mark_previous_false: {
        Args: { p_track_id: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      mood_enum: "feliz" | "neutro" | "ansioso" | "triste" | "irritado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mood_enum: ["feliz", "neutro", "ansioso", "triste", "irritado"],
    },
  },
} as const
