-- Correção das políticas RLS para compliance_reports
-- Este script permite que usuários de empresas possam criar e gerenciar relatórios

-- Primeiro, verificar se RLS está habilitado na tabela compliance_reports
-- (deve estar habilitado para segurança)

-- 1. Criar política para permitir INSERT de relatórios
-- Usuários podem inserir relatórios apenas para sua própria empresa
CREATE POLICY "Users can insert compliance reports for their company" ON public.compliance_reports
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verificar se o usuário tem permissão para esta empresa
  company_id IN (
    SELECT up.company_id 
    FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() 
      AND up.employee_status = 'active'
  )
  OR
  -- OU se o usuário é owner da empresa
  company_id IN (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.user_id = auth.uid()
  )
);

-- 2. Criar política para permitir SELECT de relatórios
-- Usuários podem ver relatórios apenas de sua própria empresa
CREATE POLICY "Users can view compliance reports for their company" ON public.compliance_reports
FOR SELECT
TO authenticated
USING (
  -- Verificar se o usuário tem permissão para esta empresa
  company_id IN (
    SELECT up.company_id 
    FROM public.user_profiles up 
    WHERE up.user_id = auth.uid()
  )
  OR
  -- OU se o usuário é owner da empresa
  company_id IN (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.user_id = auth.uid()
  )
);

-- 3. Criar política para permitir UPDATE de relatórios
-- Usuários podem atualizar relatórios apenas de sua própria empresa
CREATE POLICY "Users can update compliance reports for their company" ON public.compliance_reports
FOR UPDATE
TO authenticated
USING (
  -- Verificar se o usuário tem permissão para esta empresa
  company_id IN (
    SELECT up.company_id 
    FROM public.user_profiles up 
    WHERE up.user_id = auth.uid()
  )
  OR
  -- OU se o usuário é owner da empresa
  company_id IN (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Mesmo critério para verificar se pode atualizar
  company_id IN (
    SELECT up.company_id 
    FROM public.user_profiles up 
    WHERE up.user_id = auth.uid()
  )
  OR
  company_id IN (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.user_id = auth.uid()
  )
);

-- 4. Criar política para permitir DELETE de relatórios
-- Apenas owners podem deletar relatórios (política mais restritiva)
CREATE POLICY "Owners can delete compliance reports for their company" ON public.compliance_reports
FOR DELETE
TO authenticated
USING (
  -- Apenas se o usuário é owner da empresa
  company_id IN (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.user_id = auth.uid()
  )
);

-- Verificar se RLS está habilitado (deve estar)
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- Nota: Se houver políticas antigas conflitantes, elas precisam ser removidas primeiro
-- Para listar políticas existentes: SELECT * FROM pg_policies WHERE tablename = 'compliance_reports';
-- Para remover política: DROP POLICY "policy_name" ON public.compliance_reports;

-- Exemplo de como verificar as políticas após aplicar:
-- SELECT 
--   policyname, 
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'compliance_reports';
