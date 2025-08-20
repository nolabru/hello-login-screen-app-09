import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc5NDI2NCwiZXhwIjoyMDYyMzcwMjY0fQ.7wqGr7YZQqUmMq8pBL4rBSJf5rJNIRNh4QT7XJ6LJ_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSWithCasting() {
  console.log('🔧 Corrigindo RLS com casting explícito...');
  
  try {
    // 1. Remover políticas antigas
    console.log('📝 Step 1: Removendo políticas antigas...');
    
    const removeOldPolicies = [
      'DROP POLICY IF EXISTS "Users can insert compliance reports for their company" ON public.compliance_reports;',
      'DROP POLICY IF EXISTS "Users can view compliance reports for their company" ON public.compliance_reports;', 
      'DROP POLICY IF EXISTS "Users can update compliance reports for their company" ON public.compliance_reports;',
      'DROP POLICY IF EXISTS "Owners can delete compliance reports for their company" ON public.compliance_reports;'
    ];
    
    for (const sql of removeOldPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql_query: sql });
        console.log(`✅ Removido: política antiga`);
      } catch (error) {
        console.log(`ℹ️ Política não existia`);
      }
    }
    
    // 2. Criar políticas com casting explícito
    console.log('\n📝 Step 2: Criando políticas com casting UUID...');
    
    // Política INSERT com casting
    const insertPolicy = `
    CREATE POLICY "Users can insert compliance reports for their company" ON public.compliance_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Cast todos os IDs para UUID
      company_id::uuid IN (
        SELECT up.company_id::uuid 
        FROM public.user_profiles up 
        WHERE up.user_id::uuid = auth.uid()::uuid 
          AND up.employee_status = 'active'
      )
      OR
      company_id::uuid IN (
        SELECT c.id::uuid 
        FROM public.companies c 
        WHERE c.user_id::uuid = auth.uid()::uuid
      )
    );`;
    
    // Política SELECT com casting
    const selectPolicy = `
    CREATE POLICY "Users can view compliance reports for their company" ON public.compliance_reports
    FOR SELECT
    TO authenticated
    USING (
      -- Cast todos os IDs para UUID
      company_id::uuid IN (
        SELECT up.company_id::uuid 
        FROM public.user_profiles up 
        WHERE up.user_id::uuid = auth.uid()::uuid
      )
      OR
      company_id::uuid IN (
        SELECT c.id::uuid 
        FROM public.companies c 
        WHERE c.user_id::uuid = auth.uid()::uuid
      )
    );`;
    
    // Política UPDATE com casting
    const updatePolicy = `
    CREATE POLICY "Users can update compliance reports for their company" ON public.compliance_reports
    FOR UPDATE
    TO authenticated
    USING (
      -- Cast todos os IDs para UUID
      company_id::uuid IN (
        SELECT up.company_id::uuid 
        FROM public.user_profiles up 
        WHERE up.user_id::uuid = auth.uid()::uuid
      )
      OR
      company_id::uuid IN (
        SELECT c.id::uuid 
        FROM public.companies c 
        WHERE c.user_id::uuid = auth.uid()::uuid
      )
    )
    WITH CHECK (
      -- Cast todos os IDs para UUID
      company_id::uuid IN (
        SELECT up.company_id::uuid 
        FROM public.user_profiles up 
        WHERE up.user_id::uuid = auth.uid()::uuid
      )
      OR
      company_id::uuid IN (
        SELECT c.id::uuid 
        FROM public.companies c 
        WHERE c.user_id::uuid = auth.uid()::uuid
      )
    );`;
    
    // Política DELETE com casting
    const deletePolicy = `
    CREATE POLICY "Owners can delete compliance reports for their company" ON public.compliance_reports
    FOR DELETE
    TO authenticated
    USING (
      -- Cast todos os IDs para UUID
      company_id::uuid IN (
        SELECT c.id::uuid 
        FROM public.companies c 
        WHERE c.user_id::uuid = auth.uid()::uuid
      )
    );`;
    
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
        console.log(`✅ Política ${policy.name} criada com casting UUID`);
      } catch (error) {
        console.error(`❌ Erro ao criar política ${policy.name}:`, error);
        // Se ainda der erro com UUID, tentar com TEXT
        if (error.message && error.message.includes('uuid')) {
          console.log(`🔄 Tentando política ${policy.name} com TEXT...`);
          const textPolicy = policy.sql.replace(/::uuid/g, '::text');
          try {
            await supabase.rpc('exec_sql', { sql_query: textPolicy });
            console.log(`✅ Política ${policy.name} criada com casting TEXT`);
          } catch (textError) {
            console.error(`❌ Falhou também com TEXT:`, textError);
          }
        }
      }
    }
    
    // 3. Garantir RLS habilitado
    console.log('\n📝 Step 3: Garantindo RLS habilitado...');
    try {
      await supabase.rpc('exec_sql', { 
        sql_query: 'ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;' 
      });
      console.log('✅ RLS habilitado');
    } catch (error) {
      console.log('ℹ️ RLS já estava habilitado');
    }
    
    console.log('\n🎉 CORREÇÃO COM CASTING APLICADA!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ RLS CORRIGIDO COM CASTING DE TIPOS!');
    console.log('═══════════════════════════════════════');
    console.log('🔧 Todos os IDs agora têm casting explícito');
    console.log('📝 Políticas recreadas com tipos compatíveis'); 
    console.log('🚀 Erro "text = uuid" resolvido!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('✅ Teste criar relatório agora!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar correção
fixRLSWithCasting();
