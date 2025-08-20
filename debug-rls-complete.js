import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc5NDI2NCwiZXhwIjoyMDYyMzcwMjY0fQ.7wqGr7YZQqUmMq8pBL4rBSJf5rJNIRNh4QT7XJ6LJ_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// IDs do logs
const USER_ID = 'b5fd4617-36c3-42f8-9e90-c8daad4d40e3';
const COMPANY_ID = '75af2e69-69c7-4d59-924d-dbec41ee01df';

async function debugRLSComplete() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE RLS - compliance_reports');
  console.log('═══════════════════════════════════════════════════');
  
  try {
    // 1. Verificar políticas ativas
    console.log('\n📋 1. POLÍTICAS RLS ATIVAS:');
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            policyname, 
            cmd,
            permissive,
            roles,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'compliance_reports'
          ORDER BY cmd;
        `
      });
    
    if (policyError) {
      console.error('❌ Erro ao buscar políticas:', policyError);
    } else if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`\n  📝 ${policy.policyname} (${policy.cmd})`);
        console.log(`     Roles: ${policy.roles || 'N/A'}`);
        console.log(`     Using: ${policy.qual || 'N/A'}`);
        console.log(`     Check: ${policy.with_check || 'N/A'}`);
      });
    } else {
      console.log('⚠️  NENHUMA POLÍTICA ENCONTRADA! Isso explica o erro.');
    }
    
    // 2. Verificar dados do usuário específico
    console.log('\n📋 2. DADOS DO USUÁRIO TESTE:');
    const { data: userProfile, error: userError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            user_id,
            company_id,
            employee_status,
            preferred_name,
            email
          FROM user_profiles 
          WHERE user_id = '${USER_ID}';
        `
      });
    
    if (userError) {
      console.error('❌ Erro ao buscar user_profile:', userError);
    } else if (userProfile && userProfile.length > 0) {
      const user = userProfile[0];
      console.log(`  👤 User ID: ${user.user_id}`);
      console.log(`  🏢 Company ID: ${user.company_id}`);
      console.log(`  📊 Employee Status: ${user.employee_status}`);
      console.log(`  👋 Nome: ${user.preferred_name}`);
      console.log(`  📧 Email: ${user.email}`);
    }
    
    // 3. Verificar dados da empresa
    console.log('\n📋 3. DADOS DA EMPRESA:');
    const { data: company, error: companyError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            id,
            name,
            user_id as owner_id,
            email,
            corp_email
          FROM companies 
          WHERE id = '${COMPANY_ID}';
        `
      });
    
    if (companyError) {
      console.error('❌ Erro ao buscar company:', companyError);
    } else if (company && company.length > 0) {
      const comp = company[0];
      console.log(`  🏢 Company ID: ${comp.id}`);
      console.log(`  🏷️  Nome: ${comp.name}`);
      console.log(`  👑 Owner ID: ${comp.owner_id}`);
      console.log(`  📧 Email: ${comp.email}`);
      console.log(`  🏢 Corp Email: ${comp.corp_email}`);
      console.log(`  🔍 É owner? ${comp.owner_id === USER_ID ? 'SIM' : 'NÃO'}`);
    }
    
    // 4. Testar condições das políticas manualmente
    console.log('\n📋 4. TESTE MANUAL DAS CONDIÇÕES:');
    
    // Condição 1: user_profiles + employee_status
    const { data: condition1, error: cond1Error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT company_id 
          FROM user_profiles 
          WHERE user_id = '${USER_ID}' 
            AND employee_status = 'active';
        `
      });
    
    console.log(`  ✅ Condição 1 (employee_status='active'): ${condition1 && condition1.length > 0 ? 'PASSOU' : 'FALHOU'}`);
    
    // Condição 2: companies + owner
    const { data: condition2, error: cond2Error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT id 
          FROM companies 
          WHERE id = '${COMPANY_ID}' 
            AND user_id = '${USER_ID}';
        `
      });
    
    console.log(`  ✅ Condição 2 (owner da empresa): ${condition2 && condition2.length > 0 ? 'PASSOU' : 'FALHOU'}`);
    
    // 5. Verificar se RLS está habilitado
    console.log('\n📋 5. STATUS DO RLS:');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename = 'compliance_reports' 
            AND schemaname = 'public';
        `
      });
    
    if (rlsStatus && rlsStatus.length > 0) {
      console.log(`  🔒 RLS Habilitado: ${rlsStatus[0].rowsecurity ? 'SIM' : 'NÃO'}`);
    }
    
    // 6. Sugestões de correção
    console.log('\n📋 6. ANÁLISE E PRÓXIMOS PASSOS:');
    
    if (!policies || policies.length === 0) {
      console.log('  🚨 PROBLEMA: Nenhuma política RLS encontrada');
      console.log('  💡 SOLUÇÃO: Recriar políticas RLS');
    }
    
    if (condition1 && condition1.length === 0 && condition2 && condition2.length === 0) {
      console.log('  🚨 PROBLEMA: Usuário não passa em nenhuma condição');
      console.log('  💡 SOLUÇÃO: Ajustar employee_status ou tornar owner');
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ DIAGNÓSTICO COMPLETO CONCLUÍDO');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar diagnóstico
debugRLSComplete();
