-- =============================================
-- MIGRAÇÃO SEGURA: Apenas Tabelas Essenciais
-- Data: 08/01/2025
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
  target_audience TEXT,
  max_participants INTEGER,
  
  -- Participação
  participants_registered INTEGER DEFAULT 0,
  participants_attended INTEGER DEFAULT 0,
  
  -- Resultados
  satisfaction_score DECIMAL(3,2),
  effectiveness_score DECIMAL(3,2),
  
  -- Compliance
  mandatory BOOLEAN DEFAULT false,
  compliance_requirement TEXT,
  
  -- Evidências
  evidence_files JSONB DEFAULT '[]',
  attendance_list_url TEXT,
  activity_report_url TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 2. TABELA: activity_participants (Participantes das Atividades)
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES company_activities(id) ON DELETE CASCADE,
  employee_id UUID,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  completion_certificate_url TEXT
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_company_activities_company_id ON company_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_activities_start_date ON company_activities(start_date);
CREATE INDEX IF NOT EXISTS idx_company_activities_status ON company_activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id ON activity_participants(activity_id);

-- COMENTÁRIOS
COMMENT ON TABLE company_activities IS 'Atividades de saúde mental realizadas pelas empresas (workshops, palestras, etc.)';
COMMENT ON TABLE activity_participants IS 'Participantes das atividades de saúde mental';

-- Inserir atividade de teste (opcional - pode remover)
INSERT INTO company_activities (
  company_id,
  title,
  description,
  activity_type,
  facilitator_type,
  start_date,
  target_audience
) VALUES (
  '1',
  'Workshop de Mindfulness - TESTE',
  'Atividade de teste para verificar se o sistema está funcionando',
  'workshop',
  'interno',
  NOW() + INTERVAL '7 days',
  'todos'
) ON CONFLICT DO NOTHING;
