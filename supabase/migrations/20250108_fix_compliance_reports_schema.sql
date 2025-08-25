-- =====================================================
-- MIGRAÇÃO: CORREÇÃO CRÍTICA DO SCHEMA compliance_reports
-- DATA: 2025-01-08
-- OBJETIVO: Corrigir tipo de dados e constraints usando estratégia híbrida
-- ESTRATÉGIA: Compatível com questionários (user.id) e relatórios (companies.id)
-- CORREÇÃO: Remove políticas RLS existentes antes de alterar tipo da coluna
-- =====================================================

-- 1. BACKUP DOS DADOS EXISTENTES (se houver)
-- Criar tabela temporária para backup
CREATE TABLE IF NOT EXISTS compliance_reports_backup AS 
SELECT * FROM compliance_reports;

-- 2. VERIFICAR DADOS EXISTENTES ANTES DA MIGRAÇÃO
DO $$
DECLARE
    invalid_company_ids RECORD;
    total_reports INTEGER;
BEGIN
    -- Contar relatórios existentes
    SELECT COUNT(*) INTO total_reports FROM compliance_reports;
    RAISE NOTICE '📊 Total de relatórios existentes: %', total_reports;
    
    -- Verificar se há company_ids que não são UUIDs válidos
    FOR invalid_company_ids IN 
        SELECT company_id 
        FROM compliance_reports 
        WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    LOOP
        RAISE NOTICE '⚠️ Company ID inválido encontrado: %', invalid_company_ids.company_id;
    END LOOP;
END $$;

-- 3. VERIFICAÇÃO SIMPLES DE POLÍTICAS RLS (RLS DESABILITADO EM DESENVOLVIMENTO)
-- Como estamos em desenvolvimento e RLS está desabilitado, fazemos apenas verificação básica

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verificando se existem políticas RLS que possam impedir a alteração...';
    
    -- Contar políticas existentes nas tabelas relacionadas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('compliance_reports', 'action_plans', 'mental_health_alerts', 'company_activities', 'company_departments')
    AND schemaname = 'public';
    
    IF policy_count > 0 THEN
        RAISE NOTICE '⚠️ Encontradas % políticas RLS. Removendo-as...', policy_count;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can view their company reports" ON compliance_reports;
        DROP POLICY IF EXISTS "Users can insert reports for their company" ON compliance_reports;
        DROP POLICY IF EXISTS "Users can update their company reports" ON compliance_reports;
        DROP POLICY IF EXISTS "Users can delete their company reports" ON compliance_reports;
        
        DROP POLICY IF EXISTS "Users can view activities from their company" ON company_activities;
        DROP POLICY IF EXISTS "Users can insert activities for their company" ON company_activities;
        DROP POLICY IF EXISTS "Users can update their company activities" ON company_activities;
        DROP POLICY IF EXISTS "Users can delete their company activities" ON company_activities;
        DROP POLICY IF EXISTS "Users can update activities from their company" ON company_activities;
        
        DROP POLICY IF EXISTS "Users can view activities from their company" ON action_plans;
        DROP POLICY IF EXISTS "Users can insert activities for their company" ON action_plans;
        DROP POLICY IF EXISTS "Users can update their company activities" ON action_plans;
        DROP POLICY IF EXISTS "Users can delete their company activities" ON action_plans;
        DROP POLICY IF EXISTS "Users can update activities from their company" ON action_plans;
        
        DROP POLICY IF EXISTS "Users can view alerts from their company" ON mental_health_alerts;
        DROP POLICY IF EXISTS "Users can insert alerts for their company" ON mental_health_alerts;
        DROP POLICY IF EXISTS "Users can update their company alerts" ON mental_health_alerts;
        DROP POLICY IF EXISTS "Users can delete their company alerts" ON mental_health_alerts;
        
        DROP POLICY IF EXISTS "Users can view departments from their company" ON company_departments;
        DROP POLICY IF EXISTS "Users can insert departments for their company" ON company_departments;
        DROP POLICY IF EXISTS "Users can update their company departments" ON company_departments;
        DROP POLICY IF EXISTS "Users can delete their company departments" ON company_departments;
        
        RAISE NOTICE '✅ Políticas RLS removidas com sucesso!';
    ELSE
        RAISE NOTICE '✅ Nenhuma política RLS encontrada. Prosseguindo...';
    END IF;
END $$;

-- 4. CORREÇÃO DO TIPO DA COLUNA company_id (TEXT -> UUID)
-- Primeiro, vamos limpar dados inválidos e depois alterar o tipo

-- 4.1. Verificar se existem dados inválidos na coluna company_id
DO $$
DECLARE
    invalid_data_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verificando dados inválidos na coluna company_id...';
    
    -- Contar registros com company_id inválido (não UUID)
    SELECT COUNT(*) INTO invalid_data_count
    FROM compliance_reports 
    WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_data_count > 0 THEN
        RAISE NOTICE '⚠️ Encontrados % registros com company_id inválido. Limpando...', invalid_data_count;
        
        -- Deletar registros com company_id inválido
        DELETE FROM compliance_reports 
        WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
        
        RAISE NOTICE '✅ Registros inválidos removidos!';
    ELSE
        RAISE NOTICE '✅ Todos os company_id são UUIDs válidos!';
    END IF;
END $$;

-- 4.2. Verificar e limpar dados inválidos em outras tabelas
DO $$
DECLARE
    invalid_data_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verificando dados inválidos em outras tabelas...';
    
    -- company_activities
    SELECT COUNT(*) INTO invalid_data_count
    FROM company_activities 
    WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_data_count > 0 THEN
        RAISE NOTICE '⚠️ Encontrados % registros inválidos em company_activities. Limpando...', invalid_data_count;
        DELETE FROM company_activities 
        WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    END IF;
    
    -- action_plans
    SELECT COUNT(*) INTO invalid_data_count
    FROM action_plans 
    WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_data_count > 0 THEN
        RAISE NOTICE '⚠️ Encontrados % registros inválidos em action_plans. Limpando...', invalid_data_count;
        DELETE FROM action_plans 
        WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    END IF;
    
    -- mental_health_alerts
    SELECT COUNT(*) INTO invalid_data_count
    FROM mental_health_alerts 
    WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_data_count > 0 THEN
        RAISE NOTICE '⚠️ Encontrados % registros inválidos em mental_health_alerts. Limpando...', invalid_data_count;
        DELETE FROM mental_health_alerts 
        WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    END IF;
    
    -- company_departments
    SELECT COUNT(*) INTO invalid_data_count
    FROM company_departments 
    WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_data_count > 0 THEN
        RAISE NOTICE '⚠️ Encontrados % registros inválidos em company_departments. Limpando...', invalid_data_count;
        DELETE FROM company_departments 
        WHERE company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    END IF;
    
    RAISE NOTICE '✅ Limpeza de dados inválidos concluída!';
END $$;

-- 4.3. Agora sim, alterar o tipo da coluna company_id
DO $$
BEGIN
    RAISE NOTICE '🔧 Alterando tipo da coluna company_id de TEXT para UUID...';
END $$;

-- Alterar compliance_reports
ALTER TABLE compliance_reports 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

-- Alterar action_plans
ALTER TABLE action_plans 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

-- Alterar mental_health_alerts
ALTER TABLE mental_health_alerts 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

-- Alterar company_activities
ALTER TABLE company_activities 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

-- Alterar company_departments
ALTER TABLE company_departments 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

DO $$
BEGIN
    RAISE NOTICE '✅ Tipo da coluna company_id alterado com sucesso para UUID em todas as tabelas!';
END $$;

-- 5. ADICIONAR FOREIGN KEY CONSTRAINT PARA companies
-- Primeiro, verificar se a tabela companies existe e tem dados
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
        RAISE EXCEPTION 'Tabela companies não encontrada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM companies LIMIT 1) THEN
        RAISE NOTICE 'Tabela companies está vazia - criando dados de exemplo';
        
        -- Inserir empresa padrão se não existir
        INSERT INTO companies (id, cnpj, legal_name, name, corp_email, status)
        VALUES (
            gen_random_uuid(),
            '00.000.000/0001-00',
            'Empresa Padrão',
            'Empresa Padrão',
            'admin@empresa.com',
            true
        );
    END IF;
END $$;

-- Adicionar foreign key constraint para companies
ALTER TABLE compliance_reports 
ADD CONSTRAINT compliance_reports_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 6. CORRIGIR OUTRAS TABELAS RELACIONADAS (usando estratégia híbrida)
-- action_plans.company_id - FK para companies (como questionários)
ALTER TABLE action_plans 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

ALTER TABLE action_plans 
ADD CONSTRAINT action_plans_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- mental_health_alerts.company_id - FK para companies (como questionários)
ALTER TABLE mental_health_alerts 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

ALTER TABLE mental_health_alerts 
ADD CONSTRAINT mental_health_alerts_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- company_activities.company_id - FK para companies (como questionários)
ALTER TABLE company_activities 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

ALTER TABLE company_activities 
ADD CONSTRAINT company_activities_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- company_departments.company_id - FK para companies (como questionários)
ALTER TABLE company_departments 
ALTER COLUMN company_id TYPE UUID USING company_id::UUID;

ALTER TABLE company_departments 
ADD CONSTRAINT company_departments_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 7. HABILITAR ROW LEVEL SECURITY (RLS) COM ESTRATÉGIA HÍBRIDA
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS COMPATÍVEIS COM AMBAS FUNCIONALIDADES
-- Política para usuários autenticados verem relatórios da sua empresa
-- Usa a mesma lógica dos questionários: verifica tanto user_profiles quanto companies
CREATE POLICY "Users can view their company reports" ON compliance_reports
    FOR SELECT USING (
        -- Estratégia 1: Usuário tem perfil com company_id (como questionários)
        company_id IN (
            SELECT company_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        -- Estratégia 2: Usuário é dono da empresa (como questionários)
        company_id = auth.uid()
        OR
        -- Estratégia 3: Usuário tem acesso direto à empresa
        EXISTS (
            SELECT 1 FROM companies 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

-- Política para usuários autenticados inserirem relatórios para sua empresa
CREATE POLICY "Users can insert reports for their company" ON compliance_reports
    FOR INSERT WITH CHECK (
        -- Estratégia 1: Usuário tem perfil com company_id
        company_id IN (
            SELECT company_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        -- Estratégia 2: Usuário é dono da empresa
        company_id = auth.uid()
        OR
        -- Estratégia 3: Usuário tem acesso direto à empresa
        EXISTS (
            SELECT 1 FROM companies 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

-- Política para usuários autenticados atualizarem relatórios da sua empresa
CREATE POLICY "Users can update their company reports" ON compliance_reports
    FOR UPDATE USING (
        -- Estratégia 1: Usuário tem perfil com company_id
        company_id IN (
            SELECT company_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        -- Estratégia 2: Usuário é dono da empresa
        company_id = auth.uid()
        OR
        -- Estratégia 3: Usuário tem acesso direto à empresa
        EXISTS (
            SELECT 1 FROM companies 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

-- Política para usuários autenticados deletarem relatórios da sua empresa
CREATE POLICY "Users can delete their company reports" ON compliance_reports
    FOR DELETE USING (
        -- Estratégia 1: Usuário tem perfil com company_id
        company_id IN (
            SELECT company_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        -- Estratégia 2: Usuário é dono da empresa
        company_id = auth.uid()
        OR
        -- Estratégia 3: Usuário tem acesso direto à empresa
        EXISTS (
            SELECT 1 FROM companies 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

-- 9. RECRIAR POLÍTICAS RLS PARA OUTRAS TABELAS (ESTRATÉGIA HÍBRIDA)

-- 9.1 Políticas para action_plans
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company action plans" ON action_plans
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert action plans for their company" ON action_plans
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company action plans" ON action_plans
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their company action plans" ON action_plans
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

-- 9.2 Políticas para mental_health_alerts
ALTER TABLE mental_health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company alerts" ON mental_health_alerts
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert alerts for their company" ON mental_health_alerts
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company alerts" ON mental_health_alerts
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their company alerts" ON mental_health_alerts
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

-- 9.3 Políticas para company_activities
ALTER TABLE company_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company activities" ON company_activities
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert activities for their company" ON company_activities
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company activities" ON company_activities
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their company activities" ON company_activities
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

-- 9.4 Políticas para company_departments
ALTER TABLE company_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company departments" ON company_departments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert departments for their company" ON company_departments
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company departments" ON company_departments
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their company departments" ON company_departments
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR company_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid()
        )
    );

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
-- Índice para company_id (muito usado em queries)
CREATE INDEX IF NOT EXISTS idx_compliance_reports_company_id 
ON compliance_reports(company_id);

-- Índice para report_type (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_compliance_reports_report_type 
ON compliance_reports(report_type);

-- Índice para status (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status 
ON compliance_reports(status);

-- Índice para datas (usado em filtros de período)
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period 
ON compliance_reports(report_period_start, report_period_end);

-- Índice para generated_by (usado em queries de usuário)
CREATE INDEX IF NOT EXISTS idx_compliance_reports_generated_by 
ON compliance_reports(generated_by);

-- 11. CRIAR ÍNDICES PARA OUTRAS TABELAS CORRIGIDAS
-- action_plans
CREATE INDEX IF NOT EXISTS idx_action_plans_company_id 
ON action_plans(company_id);

-- mental_health_alerts
CREATE INDEX IF NOT EXISTS idx_mental_health_alerts_company_id 
ON mental_health_alerts(company_id);

-- company_activities
CREATE INDEX IF NOT EXISTS idx_company_activities_company_id 
ON company_activities(company_id);

-- company_departments
CREATE INDEX IF NOT EXISTS idx_company_departments_company_id 
ON company_departments(company_id);

-- 12. VERIFICAR E CORRIGIR DADOS INCONSISTENTES
-- Verificar se há relatórios órfãos (sem empresa válida)
DELETE FROM compliance_reports 
WHERE company_id NOT IN (SELECT id FROM companies);

-- 13. CRIAR VIEWS ÚTEIS PARA RELATÓRIOS (COMPATÍVEIS COM AMBAS FUNCIONALIDADES)
-- View para relatórios com informações da empresa
CREATE OR REPLACE VIEW compliance_reports_with_company AS
SELECT 
    cr.*,
    c.name as company_name,
    c.cnpj as company_cnpj,
    c.legal_name as company_legal_name,
    up.preferred_name as generated_by_name,
    -- Campo adicional para compatibilidade com questionários
    CASE 
        WHEN up.company_id IS NOT NULL THEN up.company_id
        ELSE cr.company_id
    END as effective_company_id
FROM compliance_reports cr
LEFT JOIN companies c ON cr.company_id = c.id
LEFT JOIN user_profiles up ON cr.generated_by = up.user_id;

-- View para métricas de relatórios por empresa
CREATE OR REPLACE VIEW compliance_reports_metrics AS
SELECT 
    cr.company_id,
    c.name as company_name,
    COUNT(*) as total_reports,
    COUNT(CASE WHEN cr.status = 'pronto' THEN 1 END) as completed_reports,
    COUNT(CASE WHEN cr.status = 'gerando' THEN 1 END) as generating_reports,
    COUNT(CASE WHEN cr.status = 'enviado' THEN 1 END) as sent_reports,
    COUNT(CASE WHEN cr.status = 'arquivado' THEN 1 END) as archived_reports,
    COUNT(CASE WHEN cr.generated_at IS NOT NULL THEN 1 END) as reports_with_timestamp
FROM compliance_reports cr
LEFT JOIN companies c ON cr.company_id = c.id
GROUP BY cr.company_id, c.name;

-- 14. CRIAR FUNÇÕES ÚTEIS (COMPATÍVEIS COM AMBAS FUNCIONALIDADES)
-- Função para gerar relatório de compliance básico
CREATE OR REPLACE FUNCTION generate_compliance_report(
    p_company_id UUID,
    p_report_type TEXT DEFAULT 'customizado',
    p_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '1 month',
    p_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_report_id UUID;
    v_report_data JSONB;
    v_effective_company_id UUID;
BEGIN
    -- ESTRATÉGIA HÍBRIDA: Verificar acesso usando a mesma lógica dos questionários
    
    -- Estratégia 1: Usuário tem perfil com company_id
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND company_id = p_company_id
    ) THEN
        v_effective_company_id := p_company_id;
        RAISE NOTICE 'Usando company_id de user_profiles: %', v_effective_company_id;
    
    -- Estratégia 2: Usuário é dono da empresa
    ELSIF p_company_id = auth.uid() THEN
        v_effective_company_id := p_company_id;
        RAISE NOTICE 'Usando company_id como user.id: %', v_effective_company_id;
    
    -- Estratégia 3: Usuário tem acesso direto à empresa
    ELSIF EXISTS (
        SELECT 1 FROM companies 
        WHERE id = p_company_id AND user_id = auth.uid()
    ) THEN
        v_effective_company_id := p_company_id;
        RAISE NOTICE 'Usando company_id de companies: %', v_effective_company_id;
    
    ELSE
        RAISE EXCEPTION 'Acesso negado a esta empresa';
    END IF;
    
    -- Coletar dados para o relatório
    v_report_data := jsonb_build_object(
        'company_info', (
            SELECT jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'cnpj', c.cnpj,
                'legal_name', c.legal_name
            )
            FROM companies c
            WHERE c.id = v_effective_company_id
        ),
        'period', jsonb_build_object(
            'start', p_period_start,
            'end', p_period_end
        ),
        'generated_at', NOW(),
        'generated_by', auth.uid(),
        'access_strategy', CASE 
            WHEN EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND company_id = p_company_id) 
            THEN 'user_profiles'
            WHEN p_company_id = auth.uid() 
            THEN 'user_id'
            ELSE 'companies_direct'
        END
    );
    
    -- Inserir o relatório
    INSERT INTO compliance_reports (
        company_id,
        report_type,
        title,
        report_period_start,
        report_period_end,
        report_data,
        template_version,
        status,
        generated_by
    ) VALUES (
        v_effective_company_id,
        p_report_type,
        'Relatório de Compliance - ' || p_report_type || ' - ' || 
        TO_CHAR(p_period_start, 'DD/MM/YYYY') || ' a ' || TO_CHAR(p_period_end, 'DD/MM/YYYY'),
        p_period_start,
        p_period_end,
        v_report_data,
        '1.0',
        'gerando',
        auth.uid()
    ) RETURNING id INTO v_report_id;
    
    RETURN v_report_id;
END;
$$;

-- 15. CRIAR TRIGGERS PARA AUDITORIA
-- Trigger para log de alterações em compliance_reports
CREATE TABLE IF NOT EXISTS compliance_reports_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION compliance_reports_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO compliance_reports_audit_log (report_id, action, new_data, changed_by)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO compliance_reports_audit_log (report_id, action, old_data, new_data, changed_by)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO compliance_reports_audit_log (report_id, action, old_data, changed_by)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER compliance_reports_audit
    AFTER INSERT OR UPDATE OR DELETE ON compliance_reports
    FOR EACH ROW EXECUTE FUNCTION compliance_reports_audit_trigger();

-- 16. VERIFICAÇÃO FINAL
-- Verificar se todas as alterações foram aplicadas corretamente
DO $$
DECLARE
    v_column_type TEXT;
    v_fk_exists BOOLEAN;
    v_rls_enabled BOOLEAN;
    v_policies_count INTEGER;
BEGIN
    -- Verificar tipo da coluna company_id
    SELECT data_type INTO v_column_type
    FROM information_schema.columns
    WHERE table_name = 'compliance_reports' AND column_name = 'company_id';
    
    IF v_column_type != 'uuid' THEN
        RAISE EXCEPTION 'company_id ainda não é do tipo UUID';
    END IF;
    
    -- Verificar se foreign key existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'compliance_reports' 
        AND constraint_name = 'compliance_reports_company_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) INTO v_fk_exists;
    
    IF NOT v_fk_exists THEN
        RAISE EXCEPTION 'Foreign key para companies não foi criada';
    END IF;
    
    -- Verificar se RLS está habilitado (usando pg_tables que é mais confiável)
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'compliance_reports' 
        AND rowsecurity = true
    ) INTO v_rls_enabled;
    
    IF NOT v_rls_enabled THEN
        RAISE EXCEPTION 'RLS não está habilitado';
    END IF;
    
    -- Verificar se políticas RLS foram criadas
    SELECT COUNT(*) INTO v_policies_count
    FROM pg_policies
    WHERE tablename = 'compliance_reports';
    
    IF v_policies_count < 4 THEN
        RAISE EXCEPTION 'Políticas RLS não foram criadas corretamente. Encontradas: %', v_policies_count;
    END IF;
    
    RAISE NOTICE '✅ Todas as correções foram aplicadas com sucesso!';
    RAISE NOTICE '📊 Estratégia híbrida implementada para compatibilidade com questionários e relatórios';
    RAISE NOTICE '🔐 RLS habilitado com % políticas', v_policies_count;
    RAISE NOTICE '🔗 Foreign keys criadas para todas as tabelas relacionadas';
    RAISE NOTICE '🔄 Políticas RLS existentes foram removidas e recriadas com estratégia híbrida';
END $$;

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA - COMPATÍVEL COM AMBAS FUNCIONALIDADES
-- CORREÇÃO: Políticas RLS removidas antes de alterar tipo da coluna
-- =====================================================
