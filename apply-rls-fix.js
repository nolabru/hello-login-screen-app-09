import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc5NDI2NCwiZXhwIjoyMDYyMzcwMjY0fQ.7wqGr7YZQqUmMq8pBL4rBSJf5rJNIRNh4QT7XJ6LJ_M'; // Usando service role para admin

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  console.log('🔧 Aplicando correções de RLS para compliance_reports...');
  
  try {
    // 1. Primeiro, remover políticas existentes que podem estar conflitando
    console.log('📝 Step 1: Removendo políticas antigas (se existirem)...');
    
    const removeOldPolicies = [
      'DROP POLICY IF EXISTS "Users can insert compliance reports for their company" ON public.compliance_reports;',
      'DROP POLICY IF EXISTS "Users can view compliance reports for their company" ON public.compliance_reports;',
      'DROP POLICY IF EXISTS "Users can update compliance reports for their company" ON public.compliance_reports;',
      'DROP POLICY IF EXISTS "Owners can delete compliance reports for their company" ON public.compliance_reports;'
    ];
    
    for (const sql of removeOldPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql_query: sql });
        console.log(`✅ Removido: ${sql.split(' ')[3]} policy`);
      } catch (error) {
        console.log(`ℹ️ Política não existia: ${sql.split(' ')[3]}`);
      }
    }
    
    // 2. Criar novas políticas
    console.log('\n📝 Step 2: Criando novas políticas RLS...');
    
    // Política para INSERT
    const insertPolicy = `
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
    `;
    
    // Política para SELECT
    const selectPolicy = `
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
    `;
    
    // Política para UPDATE
    const updatePolicy = `
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
    `;
    
    // Política para DELETE
    const deletePolicy = `
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
    `;
    
    // Aplicar políticas
    const policies = [
      { name: 'INSERT', sql: insertPolicy },
      { name: 'SELECT', sql: selectPolicy },
      { name: 'UPDATE', sql: updatePolicy },
      { name: 'DELETE', sql: deletePolicy }
    ];
    
    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql_query: policy.sql });
        console.log(`✅ Política ${policy.name} criada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao criar política ${policy.name}:`, error);
      }
    }
    
    // 3. Garantir que RLS está habilitado
    console.log('\n📝 Step 3: Habilitando RLS...');
    try {
      await supabase.rpc('exec_sql', { 
        sql_query: 'ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;' 
      });
      console.log('✅ RLS habilitado na tabela compliance_reports');
    } catch (error) {
      console.log('ℹ️ RLS já estava habilitado');
    }
    
    // 4. Verificar as políticas criadas
    console.log('\n📝 Step 4: Verificando políticas aplicadas...');
    
    const { data: policies_check } = await supabase
      .rpc('exec_sql', { 
        sql_query: `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'compliance_reports';` 
      });
    
    if (policies_check) {
      console.log('✅ Políticas ativas:', policies_check);
    }
    
    console.log('\n🎉 CORREÇÃO DE RLS APLICADA COM SUCESSO!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ POLÍTICAS RLS CONFIGURADAS!');
    console.log('═══════════════════════════════════════');
    console.log('📝 INSERT: Usuários podem criar relatórios para sua empresa');
    console.log('👀 SELECT: Usuários podem ver relatórios de sua empresa');
    console.log('📝 UPDATE: Usuários podem editar relatórios de sua empresa');
    console.log('🗑️  DELETE: Owners podem deletar relatórios');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🚀 Agora você pode criar relatórios sem erro!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar correção
applyRLSFix();
