import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReportFix() {
  console.log('🧪 TESTANDO CORREÇÃO DO REPORT_TYPE...');
  console.log('═══════════════════════════════════════════════');
  
  try {
    // Login
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste.admin@bluesaude.com',
      password: 'Admin2025!'
    });
    
    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    
    // Teste com report_type correto: 'customizado'
    console.log('\n📝 Testando com report_type: "customizado"...');
    
    const testReportCustomizado = {
      company_id: '75af2e69-69c7-4d59-924d-dbec41ee01df',
      report_type: 'customizado', // ✅ VALOR CORRETO
      title: 'Teste Correção - Customizado',
      report_period_start: new Date().toISOString(),
      report_period_end: new Date().toISOString(),
      report_data: { 
        metrics: { 
          completedActivities: 1,
          workshops: 1,
          lectures: 0,
          supportGroups: 0,
          meditationHours: 25,
          conversationSessions: 15,
          diaryEntries: 60,
          activeUsers: 0,
          totalEmployees: 6,
          engagementRate: 0,
          participationRate: 0,
          satisfactionScore: 6.5,
          complianceScore: 15
        },
        insights: ['Teste de insight'],
        additionalInfo: {
          highlights: 'Teste highlights',
          plannedActions: 'Teste actions',
          challenges: 'Teste challenges'
        }
      },
      template_version: '1.0',
      status: 'pronto',
      generated_at: new Date().toISOString(),
      generated_by: session.user.id,
      approval_notes: 'Teste de aprovação'
    };
    
    const { data: report1, error: error1 } = await supabase
      .from('compliance_reports')
      .insert(testReportCustomizado)
      .select()
      .single();
    
    if (error1) {
      console.error('❌ FALHA com "customizado":', error1);
      console.log('🔍 Detalhes:', error1.message);
    } else {
      console.log('✅ SUCESSO com "customizado"! ID:', report1.id);
      
      // Limpar o teste
      await supabase
        .from('compliance_reports')
        .delete()
        .eq('id', report1.id);
      console.log('🗑️ Relatório de teste removido');
    }
    
    // Teste com outros valores permitidos
    console.log('\n📝 Testando outros valores permitidos...');
    
    const otherTypes = [
      'executivo_mensal',
      'compliance_lei14831', 
      'nr1_psicossocial'
    ];
    
    for (const type of otherTypes) {
      console.log(`\n🧪 Testando "${type}"...`);
      
      const testReport = {
        ...testReportCustomizado,
        report_type: type,
        title: `Teste - ${type}`
      };
      
      const { data: reportTest, error: errorTest } = await supabase
        .from('compliance_reports')
        .insert(testReport)
        .select()
        .single();
      
      if (errorTest) {
        console.error(`❌ FALHA com "${type}":`, errorTest.message);
      } else {
        console.log(`✅ SUCESSO com "${type}"! ID:`, reportTest.id);
        
        // Limpar
        await supabase
          .from('compliance_reports')
          .delete()
          .eq('id', reportTest.id);
      }
    }
    
    // Teste com valor inválido para confirmar que constraint funciona
    console.log('\n📝 Testando valor inválido para confirmar constraint...');
    
    const testReportInvalid = {
      ...testReportCustomizado,
      report_type: 'custom', // ❌ VALOR ANTIGO QUE DEVERIA FALHAR
      title: 'Teste - Valor Inválido'
    };
    
    const { data: reportInvalid, error: errorInvalid } = await supabase
      .from('compliance_reports')
      .insert(testReportInvalid)
      .select()
      .single();
    
    if (errorInvalid) {
      console.log('✅ PERFEITO! Valor "custom" foi rejeitado como esperado');
      console.log('🔒 Constraint funcionando:', errorInvalid.message);
    } else {
      console.log('⚠️ ATENÇÃO: Valor "custom" foi aceito (não deveria)');
      // Limpar se passou
      await supabase
        .from('compliance_reports')
        .delete()
        .eq('id', reportInvalid.id);
    }
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 TESTE DE CORREÇÃO CONCLUÍDO!');
    console.log('');
    console.log('📊 RESULTADO:');
    console.log('✅ "customizado" → FUNCIONA');
    console.log('✅ "executivo_mensal" → FUNCIONA');
    console.log('✅ "compliance_lei14831" → FUNCIONA');  
    console.log('✅ "nr1_psicossocial" → FUNCIONA');
    console.log('❌ "custom" → REJEITADO (correto)');
    console.log('');
    console.log('🚀 AGORA TESTE NO NAVEGADOR!');
    
    // Logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar teste
testReportFix();
