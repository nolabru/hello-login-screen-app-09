-- =============================================
-- MIGRAÇÃO: Sistema de Seleção de Departamentos para Atividades
-- Data: 08/01/2025
-- Descrição: Permite seleção múltipla de departamentos nas atividades
-- =============================================

-- 1. TABELA: activity_target_departments (Relacionamento Atividade-Departamentos)
CREATE TABLE IF NOT EXISTS activity_target_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES company_activities(id) ON DELETE CASCADE,
  department_id UUID REFERENCES company_departments(id) ON DELETE CASCADE,
  is_all_departments BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_activity_target_departments_activity_id 
  ON activity_target_departments(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_target_departments_department_id 
  ON activity_target_departments(department_id);

CREATE INDEX IF NOT EXISTS idx_activity_target_departments_all_depts 
  ON activity_target_departments(is_all_departments) 
  WHERE is_all_departments = true;

-- 3. CONSTRAINTS E VALIDAÇÕES
-- Garantir que cada atividade tenha pelo menos uma seleção (departamento ou "todos")
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_all_departments_per_activity
  ON activity_target_departments(activity_id)
  WHERE is_all_departments = true;

-- Evitar duplicatas de department_id por atividade
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_department_per_activity
  ON activity_target_departments(activity_id, department_id)
  WHERE department_id IS NOT NULL;

-- 4. FUNÇÕES AUXILIARES
-- Função para verificar se uma atividade é para todos os departamentos
CREATE OR REPLACE FUNCTION activity_is_for_all_departments(activity_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM activity_target_departments 
        WHERE activity_id = activity_uuid 
        AND is_all_departments = true
    );
END;
$$ LANGUAGE plpgsql;

-- Função para obter lista de departamentos de uma atividade
CREATE OR REPLACE FUNCTION get_activity_departments(activity_uuid UUID)
RETURNS TABLE(department_id UUID, department_name TEXT, is_all_departments BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        atd.department_id,
        COALESCE(cd.name, 'Todos os Setores') as department_name,
        atd.is_all_departments
    FROM activity_target_departments atd
    LEFT JOIN company_departments cd ON cd.id = atd.department_id
    WHERE atd.activity_id = activity_uuid
    ORDER BY 
        atd.is_all_departments DESC,
        cd.name ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERS DE VALIDAÇÃO
-- Trigger para garantir consistência: se is_all_departments = true, não pode ter department_id específicos
CREATE OR REPLACE FUNCTION validate_activity_department_selection()
RETURNS TRIGGER AS $$
BEGIN
    -- Se marcou "todos os departamentos", remover seleções específicas
    IF NEW.is_all_departments = true THEN
        DELETE FROM activity_target_departments 
        WHERE activity_id = NEW.activity_id 
        AND is_all_departments = false;
        
        -- Garantir que department_id seja NULL quando is_all_departments = true
        NEW.department_id := NULL;
    END IF;
    
    -- Se está adicionando departamento específico, remover "todos os departamentos"
    IF NEW.department_id IS NOT NULL THEN
        DELETE FROM activity_target_departments 
        WHERE activity_id = NEW.activity_id 
        AND is_all_departments = true;
        
        NEW.is_all_departments := false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_activity_department_selection
    BEFORE INSERT OR UPDATE ON activity_target_departments
    FOR EACH ROW
    EXECUTE FUNCTION validate_activity_department_selection();

-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY)
ALTER TABLE activity_target_departments ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver relacionamentos de atividades da sua empresa
CREATE POLICY "Users can view activity departments from their company" ON activity_target_departments
    FOR SELECT USING (
        activity_id IN (
            SELECT ca.id 
            FROM company_activities ca 
            JOIN user_profiles up ON up.company_id::text = ca.company_id 
            WHERE up.user_id = auth.uid()
        )
    );

-- Usuários podem gerenciar relacionamentos de atividades da sua empresa
CREATE POLICY "Users can manage activity departments for their company" ON activity_target_departments
    FOR ALL USING (
        activity_id IN (
            SELECT ca.id 
            FROM company_activities ca 
            JOIN user_profiles up ON up.company_id::text = ca.company_id 
            WHERE up.user_id = auth.uid()
        )
    );

-- 7. MIGRAÇÃO DE DADOS EXISTENTES
-- Converter dados do campo target_audience para o novo sistema
DO $$
DECLARE
    activity_record RECORD;
    dept_record RECORD;
    company_id_var TEXT;
BEGIN
    -- Processar cada atividade existente que tem target_audience
    FOR activity_record IN 
        SELECT id, company_id, target_audience 
        FROM company_activities 
        WHERE target_audience IS NOT NULL 
        AND target_audience != ''
    LOOP
        company_id_var := activity_record.company_id;
        
        -- Se target_audience contém "todos" (case insensitive)
        IF LOWER(activity_record.target_audience) LIKE '%todos%' 
        OR LOWER(activity_record.target_audience) LIKE '%all%'
        OR activity_record.target_audience = 'todos' THEN
            
            INSERT INTO activity_target_departments (
                activity_id, 
                is_all_departments
            ) VALUES (
                activity_record.id, 
                true
            ) ON CONFLICT DO NOTHING;
            
        ELSE
            -- Tentar encontrar departamento por nome similar
            FOR dept_record IN
                SELECT id, name 
                FROM company_departments 
                WHERE company_id::text = company_id_var
                AND (
                    LOWER(name) = LOWER(activity_record.target_audience)
                    OR LOWER(name) LIKE '%' || LOWER(activity_record.target_audience) || '%'
                    OR LOWER(activity_record.target_audience) LIKE '%' || LOWER(name) || '%'
                )
            LOOP
                INSERT INTO activity_target_departments (
                    activity_id, 
                    department_id
                ) VALUES (
                    activity_record.id, 
                    dept_record.id
                ) ON CONFLICT DO NOTHING;
                
                EXIT; -- Usar apenas o primeiro match
            END LOOP;
            
            -- Se não encontrou nenhum departamento, marcar como "todos"
            IF NOT EXISTS (
                SELECT 1 FROM activity_target_departments 
                WHERE activity_id = activity_record.id
            ) THEN
                INSERT INTO activity_target_departments (
                    activity_id, 
                    is_all_departments
                ) VALUES (
                    activity_record.id, 
                    true
                );
            END IF;
        END IF;
    END LOOP;
    
    -- Para atividades sem target_audience, assumir "todos os departamentos"
    INSERT INTO activity_target_departments (
        activity_id, 
        is_all_departments
    )
    SELECT 
        id,
        true
    FROM company_activities 
    WHERE (target_audience IS NULL OR target_audience = '')
    AND NOT EXISTS (
        SELECT 1 FROM activity_target_departments 
        WHERE activity_id = company_activities.id
    );
END
$$;

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE activity_target_departments IS 'Relacionamento N:N entre atividades e departamentos, com suporte a "todos os departamentos"';
COMMENT ON COLUMN activity_target_departments.is_all_departments IS 'Quando true, a atividade é direcionada para todos os departamentos da empresa';
COMMENT ON COLUMN activity_target_departments.department_id IS 'ID do departamento específico (NULL quando is_all_departments = true)';

-- 9. VIEW AUXILIAR PARA CONSULTAS MAIS FÁCEIS
CREATE OR REPLACE VIEW activity_departments_view AS
SELECT 
    ca.id as activity_id,
    ca.title as activity_title,
    ca.company_id,
    CASE 
        WHEN bool_or(atd.is_all_departments) THEN 'Todos os Setores'
        ELSE string_agg(cd.name, ', ' ORDER BY cd.name)
    END as target_departments,
    bool_or(atd.is_all_departments) as is_all_departments,
    array_agg(
        CASE 
            WHEN atd.department_id IS NOT NULL THEN cd.name 
            ELSE NULL 
        END
        ORDER BY cd.name
    ) FILTER (WHERE cd.name IS NOT NULL) as department_names
FROM company_activities ca
LEFT JOIN activity_target_departments atd ON ca.id = atd.activity_id
LEFT JOIN company_departments cd ON atd.department_id = cd.id
GROUP BY ca.id, ca.title, ca.company_id;

COMMENT ON VIEW activity_departments_view IS 'View simplificada para consultar atividades com seus departamentos alvo';

-- 10. ESTATÍSTICAS E ANÁLISES
-- View para relatórios por departamento
CREATE OR REPLACE VIEW activity_stats_by_department AS
SELECT 
    cd.company_id,
    cd.id as department_id,
    cd.name as department_name,
    COUNT(DISTINCT ca.id) as total_activities,
    COUNT(DISTINCT CASE WHEN ca.status = 'concluida' THEN ca.id END) as completed_activities,
    SUM(ca.participants_registered) as total_registered,
    SUM(ca.participants_attended) as total_attended,
    CASE 
        WHEN SUM(ca.participants_registered) > 0 
        THEN ROUND((SUM(ca.participants_attended)::numeric / SUM(ca.participants_registered)) * 100, 2)
        ELSE 0 
    END as attendance_rate
FROM company_departments cd
LEFT JOIN activity_target_departments atd ON cd.id = atd.department_id
LEFT JOIN company_activities ca ON atd.activity_id = ca.id
GROUP BY cd.company_id, cd.id, cd.name
UNION ALL
-- Adicionar estatísticas para "Todos os Departamentos"
SELECT 
    ca.company_id,
    NULL as department_id,
    'Todos os Setores' as department_name,
    COUNT(DISTINCT ca.id) as total_activities,
    COUNT(DISTINCT CASE WHEN ca.status = 'concluida' THEN ca.id END) as completed_activities,
    SUM(ca.participants_registered) as total_registered,
    SUM(ca.participants_attended) as total_attended,
    CASE 
        WHEN SUM(ca.participants_registered) > 0 
        THEN ROUND((SUM(ca.participants_attended)::numeric / SUM(ca.participants_registered)) * 100, 2)
        ELSE 0 
    END as attendance_rate
FROM company_activities ca
JOIN activity_target_departments atd ON ca.id = atd.activity_id
WHERE atd.is_all_departments = true
GROUP BY ca.company_id;

COMMENT ON VIEW activity_stats_by_department IS 'Estatísticas de atividades agrupadas por departamento para relatórios';

-- Fim da migração
