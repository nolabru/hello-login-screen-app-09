-- ============================================= 
-- CORREÇÃO IMEDIATA: RLS Error 403 Forbidden
-- Data: 08/01/2025
-- ============================================= 

-- OPÇÃO 1: DESABILITAR RLS TEMPORARIAMENTE (PARA TESTE)
-- Execute apenas uma das opções abaixo:

-- Desabilitar RLS (permite inserção sem restrições)
ALTER TABLE company_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants DISABLE ROW LEVEL SECURITY;

-- ============================================= 
-- OPÇÃO 2: RLS BÁSICO (SE PREFERIR MANTER SEGURANÇA)
-- Descomente as linhas abaixo se preferir manter RLS ativo:
-- ============================================= 

-- Remover políticas antigas que podem estar causando conflito
-- DROP POLICY IF EXISTS "Users can view activities from their company" ON company_activities;
-- DROP POLICY IF EXISTS "Users can insert activities for their company" ON company_activities;
-- DROP POLICY IF EXISTS "Users can update activities from their company" ON company_activities;

-- Criar política simples que permite acesso básico
-- CREATE POLICY "Allow authenticated users" ON company_activities
--     FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users" ON activity_participants
--     FOR ALL USING (auth.role() = 'authenticated');

-- ============================================= 
-- VERIFICAR SE FUNCIONOU:
-- ============================================= 

-- Para verificar o status RLS:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'company_activities';

-- Para ver políticas ativas:
-- SELECT * FROM pg_policies WHERE tablename = 'company_activities';
