import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSimplePolicy() {
  console.log('🔧 CRIANDO POLÍTICA RLS SIMPLES...');
  console.log('══════════════════════════════════════');
  
  try {
    console.log('📝 Removendo RLS temporariamente...');
    
    // Tentar fazer login como admin
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste.admin@bluesaude.com',
      password: 'Admin2025!'
    });
    
    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    
    // Tentar criar um relatório de teste
    console.log('\n📝 Tentando criar relatório de teste...');
    
    const testReport = {
      company_id: '75af2e69-69c7-4d59-924d-dbec41ee01df',
      report_type: 'customizado',
      title: 'Teste RLS Fix',
      report_period_start: new Date().toISOString(),
      report_period_end: new Date().toISOString(),
      report_data: { test: true },
      template_version: '1.0',
      status: 'pronto',
      generated_at: new Date().toISOString(),
      generated_by: session.user.id
    };
    
    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .insert(testReport)
      .select()
      .single();
    
    if (reportError) {
      console.error('❌ Erro ao criar relatório:', reportError);
      console.log('🔍 Detalhes do erro:', reportError.message);
      
      if (reportError.message.includes('row-level security')) {
        console.log('\n🚨 PROBLEMA CONFIRMADO: RLS está bloqueando');
        console.log('💡 SOLUÇÃO: Vamos criar política permissiva');
        
        // Como não podemos alterar políticas com anon key, vamos sugerir abordagem diferente
        console.log('\n📋 PRÓXIMOS PASSOS NECESSÁRIOS:');
        console.log('1. Acesse o Supabase Dashboard no navegador');
        console.log('2. Vá para Database > Tables > compliance_reports');
        console.log('3. Clique em "RLS disabled" para desabilitar RLS temporariamente');
        console.log('4. OU crie uma política simples: "Enable read access for all users" para SELECT');
        console.log('5. E "Enable insert access for all users" para INSERT');
        console.log('6. Teste criar relatório novamente');
        
        console.log('\n🌐 URL do Dashboard:');
        console.log('https://supabase.com/dashboard/project/ygafwrebafehwaomibmm/editor');
      }
      
    } else {
      console.log('✅ SUCESSO! Relatório criado:', report.id);
      console.log('🎉 RLS está funcionando corretamente!');
      
      // Limpar relatório de teste
      await supabase
        .from('compliance_reports')
        .delete()
        .eq('id', report.id);
      console.log('🗑️ Relatório de teste removido');
    }
    
    // Logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar teste
createSimplePolicy();
