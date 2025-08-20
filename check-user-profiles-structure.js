import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela user_profiles...');
    
    // Buscar um registro exemplo para ver os campos disponíveis
    const { data: sampleProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar exemplo:', error);
      return;
    }
    
    console.log('✅ Campos disponíveis na user_profiles:');
    console.log(Object.keys(sampleProfile));
    console.log();
    console.log('📋 Exemplo de registro:');
    console.log(sampleProfile);
    
    // Testar se existe campo role
    const { data: testRole, error: roleError } = await supabase
      .from('user_profiles')
      .select('role')
      .limit(1);
    
    if (roleError) {
      console.log('❌ Campo "role" não existe:', roleError.message);
    } else {
      console.log('✅ Campo "role" existe!');
    }
    
    // Buscar nosso usuário específico
    console.log('\n🔍 Buscando usuário teste (b5fd4617-36c3-42f8-9e90-c8daad4d40e3):');
    
    const { data: testUser, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', 'b5fd4617-36c3-42f8-9e90-c8daad4d40e3')
      .single();
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário teste:', userError);
    } else {
      console.log('✅ Usuário teste encontrado:');
      console.log(testUser);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

checkStructure();
