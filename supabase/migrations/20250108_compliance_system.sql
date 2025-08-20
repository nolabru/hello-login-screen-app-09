-- =============================================
-- MIGRAÇÃO: Sistema de Compliance e Relatórios
-- Data: 08/01/2025
-- Descrição: Tabelas para Lei 14.831/2024 e NR-1
-- =============================================

-- 1. TABELA: company_activities (Gestão de Atividades)
CREATE TABLE IF NOT EXISTS company_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('workshop', 'palestra', 'conversa', 'intervencao', 'treinamento', 'grupo_apoio', 'sessao_individual')),
  facilitator_name VARCHAR(255),
  facilitator_type TEXT NOT NULL CHECK (facilitator_type IN ('psicologo', 'interno', 'externo')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  target_audience TEXT, -- setor específico ou "todos"
  max_participants INTEGER,
  
  -- Participação
  participants_registered INTEGER DEFAULT 0,
  participants_attended INTEGER DEFAULT 0,
  
  -- Resultados
  satisfaction_score DECIMAL(3,2), -- 1.00 a 10.00
  effectiveness_score DECIMAL(3,2), -- 1.00 a 10.00
  
  -- Compliance
  mandatory BOOLEAN DEFAULT false,
  compliance_requirement TEXT, -- Lei 14.831, NR-1, etc
  
  -- Evidências
  evidence_files JSONB DEFAULT '[]', -- URLs dos arquivos
  attendance_list_url TEXT,
  activity_report_url TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. TABELA: activity_participants (Participantes das Atividades)
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES company_activities(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES user_profiles(id),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  completion_certificate_url TEXT
);

-- 3. TABELA: compliance_reports (Relatórios Gerados)
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('executivo_mensal', 'compliance_lei14831', 'nr1_psicossocial', 'customizado')),
  title VARCHAR(255) NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  -- Dados do Relatório
  report_data JSONB NOT NULL, -- Todos os dados calculados
  template_version VARCHAR(50) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'gerando' CHECK (status IN ('gerando', 'pronto', 'enviado', 'arquivado')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id),
  
  -- Arquivos
  pdf_url TEXT,
  pdf_size_bytes INTEGER,
  
  -- Aprovação
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT
);

-- 4. TABELA: mental_health_alerts (Central de Alertas)
CREATE TABLE IF NOT EXISTS mental_health_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('critico', 'moderado', 'preventivo', 'tendencia')),
  severity INTEGER CHECK (severity >= 1 AND severity <= 100),
  
  -- Contexto
  affected_entity_type TEXT NOT NULL CHECK (affected_entity_type IN ('colaborador', 'setor', 'empresa')),
  affected_entity_id TEXT, -- user_id, department_id, ou company_id
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Dados do Alerta
  trigger_metric VARCHAR(100), -- qual métrica disparou
  current_value DECIMAL(10,2),
  threshold_value DECIMAL(10,2),
  trend TEXT NOT NULL CHECK (trend IN ('melhorando', 'estavel', 'piorando')),
  
  -- Resposta
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_tratamento', 'resolvido', 'falso_positivo')),
  assigned_to UUID REFERENCES auth.users(id),
  action_plan_id UUID, -- referência para planos de ação
  
  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Notificações
  notifications_sent JSONB DEFAULT '[]', -- log de notificações
  escalation_level INTEGER DEFAULT 1 CHECK (escalation_level >= 1 AND escalation_level <= 3)
);

-- 5. TABELA: action_plans (Planos de Ação)
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  alert_id UUID REFERENCES mental_health_alerts(id),
  
  -- Identificação
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Objetivos
  objectives JSONB NOT NULL, -- array de objetivos
  success_metrics JSONB NOT NULL, -- métricas de sucesso
  
  -- Ações
  immediate_actions JSONB DEFAULT '[]', -- ações para 24h
  short_term_actions JSONB DEFAULT '[]', -- ações semanais
  long_term_actions JSONB DEFAULT '[]', -- ações mensais
  
  -- Responsabilidades
  responsible_person UUID REFERENCES auth.users(id),
  stakeholders JSONB DEFAULT '[]', -- outras pessoas envolvidas
  
  -- Prazos
  target_completion_date DATE,
  review_frequency TEXT DEFAULT 'semanal' CHECK (review_frequency IN ('diario', 'semanal', 'mensal')),
  
  -- Status
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aprovado', 'em_execucao', 'concluido', 'cancelado')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para company_activities
CREATE INDEX IF NOT EXISTS idx_company_activities_company_id ON company_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_activities_start_date ON company_activities(start_date);
CREATE INDEX IF NOT EXISTS idx_company_activities_status ON company_activities(status);
CREATE INDEX IF NOT EXISTS idx_company_activities_type ON company_activities(activity_type);

-- Índices para activity_participants
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_employee_id ON activity_participants(employee_id);

-- Índices para compliance_reports
CREATE INDEX IF NOT EXISTS idx_compliance_reports_company_id ON compliance_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports(status);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON compliance_reports(report_period_start, report_period_end);

-- Índices para mental_health_alerts
CREATE INDEX IF NOT EXISTS idx_mental_health_alerts_company_id ON mental_health_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_mental_health_alerts_status ON mental_health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_mental_health_alerts_type ON mental_health_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_mental_health_alerts_triggered ON mental_health_alerts(triggered_at);

-- Índices para action_plans
CREATE INDEX IF NOT EXISTS idx_action_plans_company_id ON action_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_alert_id ON action_plans(alert_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);

-- =============================================
-- TRIGGERS PARA AUDITORIA E ATUALIZAÇÃO
-- =============================================

-- Trigger para atualizar updated_at em company_activities
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_activities_updated_at
    BEFORE UPDATE ON company_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar contadores de participantes
CREATE OR REPLACE FUNCTION update_activity_participant_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contadores na tabela company_activities
    UPDATE company_activities 
    SET 
        participants_registered = (
            SELECT COUNT(*) 
            FROM activity_participants 
            WHERE activity_id = COALESCE(NEW.activity_id, OLD.activity_id)
        ),
        participants_attended = (
            SELECT COUNT(*) 
            FROM activity_participants 
            WHERE activity_id = COALESCE(NEW.activity_id, OLD.activity_id) 
            AND attended = true
        )
    WHERE id = COALESCE(NEW.activity_id, OLD.activity_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_counts_on_insert
    AFTER INSERT ON activity_participants
    FOR EACH ROW EXECUTE FUNCTION update_activity_participant_counts();

CREATE TRIGGER update_participant_counts_on_update
    AFTER UPDATE ON activity_participants
    FOR EACH ROW EXECUTE FUNCTION update_activity_participant_counts();

CREATE TRIGGER update_participant_counts_on_delete
    AFTER DELETE ON activity_participants
    FOR EACH ROW EXECUTE FUNCTION update_activity_participant_counts();

-- =============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE company_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Políticas para company_activities
CREATE POLICY "Users can view activities from their company" ON company_activities
    FOR SELECT USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert activities for their company" ON company_activities
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can update activities from their company" ON company_activities
    FOR UPDATE USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete activities from their company" ON company_activities
    FOR DELETE USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Políticas para activity_participants
CREATE POLICY "Users can view participants from their company activities" ON activity_participants
    FOR SELECT USING (
        activity_id IN (
            SELECT ca.id 
            FROM company_activities ca 
            JOIN user_profiles up ON up.company_id::text = ca.company_id 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can manage participants in their company activities" ON activity_participants
    FOR ALL USING (
        activity_id IN (
            SELECT ca.id 
            FROM company_activities ca 
            JOIN user_profiles up ON up.company_id::text = ca.company_id 
            WHERE up.id = auth.uid()
        )
    );

-- Políticas para compliance_reports
CREATE POLICY "Users can view reports from their company" ON compliance_reports
    FOR SELECT USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can manage reports for their company" ON compliance_reports
    FOR ALL USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Políticas para mental_health_alerts
CREATE POLICY "Users can view alerts from their company" ON mental_health_alerts
    FOR SELECT USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can manage alerts for their company" ON mental_health_alerts
    FOR ALL USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Políticas para action_plans
CREATE POLICY "Users can view action plans from their company" ON action_plans
    FOR SELECT USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Users can manage action plans for their company" ON action_plans
    FOR ALL USING (
        company_id IN (
            SELECT up.company_id::text 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- =============================================
-- INSERÇÃO DE DADOS INICIAIS (OPCIONAL)
-- =============================================

-- Inserir alguns alertas exemplo para demonstração
-- (pode ser removido em produção)
INSERT INTO mental_health_alerts (
    company_id,
    alert_type,
    severity,
    affected_entity_type,
    affected_entity_id,
    title,
    description,
    trigger_metric,
    current_value,
    threshold_value,
    trend
) VALUES 
(
    '1', -- company_id exemplo
    'moderado',
    65,
    'setor',
    '1',
    'Aumento de Estresse no Setor Vendas',
    'Detectado aumento significativo nos níveis de estresse no setor de vendas nas últimas 2 semanas.',
    'stress_level',
    65.0,
    50.0,
    'piorando'
),
(
    '1',
    'preventivo',
    40,
    'empresa',
    '1',
    'Redução no Engajamento Geral',
    'Observada queda de 15% no engajamento geral dos colaboradores.',
    'engagement_rate',
    70.0,
    80.0,
    'piorando'
) ON CONFLICT DO NOTHING;

-- =============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON TABLE company_activities IS 'Atividades de saúde mental realizadas pelas empresas (workshops, palestras, etc.)';
COMMENT ON TABLE activity_participants IS 'Participantes das atividades de saúde mental';
COMMENT ON TABLE compliance_reports IS 'Relatórios de compliance gerados automaticamente';
COMMENT ON TABLE mental_health_alerts IS 'Sistema de alertas para monitoramento de saúde mental';
COMMENT ON TABLE action_plans IS 'Planos de ação para resolução de alertas';

COMMENT ON COLUMN company_activities.compliance_requirement IS 'Ex: Lei 14.831/2024, NR-1, etc.';
COMMENT ON COLUMN compliance_reports.report_data IS 'JSON com todos os dados calculados do relatório';
COMMENT ON COLUMN mental_health_alerts.severity IS 'Nível de severidade de 1-100';
COMMENT ON COLUMN action_plans.objectives IS 'Array JSON de objetivos do plano';
