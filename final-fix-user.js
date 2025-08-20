import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

const MISSING_USER_ID = 'c7d93d0f-4c8a-4372-8b8d-ebe2dcd2bad7';
const BLUE_COMPANY_ID = '75af2e69-69c7-4d59-924d-dbec41ee01df';

console.log('🔧 Correção FINAL do usuário faltante...');
console.log('User ID:', MISSING_USER_ID);
console.log('Company ID:', BLUE_COMPANY_ID);
console.log();

async function finalFixUser() {
  try {
    // Verificar se ainda não existe
    console.log('📋 Verificação final...');
    
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', MISSING_USER_ID)
      .single();

    if (existingProfile) {
      console.log('✅ Usuário já existe! Correção não necessária.');
      console.log('Dados existentes:', existingProfile);
      return;
    }

    console.log('✅ Confirmado: usuário ainda não existe. Procedendo com inserção...');
    console.log();

    // Criar registro com campos obrigatórios baseados na estrutura real
    console.log('📋 Criando registro com estrutura correta...');
    
    const newUserProfile = {
      user_id: MISSING_USER_ID,
      company_id: BLUE_COMPANY_ID,
      preferred_name: 'Administrador',
      full_name: 'Administrador Blue Company',
      email: 'admin@bluesaude.com',
      gender: 'Não informado', // Campo obrigatório identificado
      age_range: '25-34', // Campo comum
      mental_health_experience: 'Às vezes', // Campo comum
      employee_status: 'active', // Status ativo
      phone_number: '(11) 99999-9999', // Telefone genérico
      aia_objectives: ['Acompanhar funcionários'], // Array como no exemplo
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Dados para inserção:', newUserProfile);
    
    const { data: insertedProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([newUserProfile])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      return;
    }

    console.log('✅ SUCESSO! User profile criado!');
    console.log('ID do perfil:', insertedProfile.id);
    console.log('User ID:', insertedProfile.user_id);
    console.log('Company ID:', insertedProfile.company_id);
    console.log('Nome:', insertedProfile.preferred_name);
    console.log('Email:', insertedProfile.email);
    console.log();

    // Verificação final
    console.log('📋 Verificação final - testando query original...');
    
    const { data: testProfile, error: testError } = await supabase
      .from('user_profiles')
      .select('user_id, company_id, preferred_name, email')
      .eq('user_id', MISSING_USER_ID)
      .single();

    if (testError) {
      console.error('❌ Query de teste falhou:', testError);
      return;
    }

    console.log('✅ Query de teste funcionando!');
    console.log('Dados retornados:', testProfile);
    console.log();

    console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🚀 O usuário pode agora acessar o dashboard da empresa!');
    console.log('📊 Dashboard URL: /company/dashboard');
    
  } catch (error) {
    console.error('💥 Erro na correção final:', error);
  }
}

// Executar correção final
finalFixUser();
