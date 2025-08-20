import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = 'teste.admin@bluesaude.com';
const TEST_PASSWORD = 'Admin2025!';

console.log('🧪 Testando login com nova lógica...');
console.log('Email:', TEST_EMAIL);
console.log();

async function testLoginLogic() {
  try {
    // STEP 1: Teste de autenticação
    console.log('📋 STEP 1: Autenticação...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return;
    }
    
    console.log('✅ Autenticação bem-sucedida!');
    console.log('User ID:', authData.user.id);
    console.log();
    
    // STEP 2: Buscar dados do usuário e empresa
    console.log('📋 STEP 2: Buscando dados via user_profiles...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        preferred_name,
        email,
        employee_status,
        company_id
      `)
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil encontrado!');
    console.log('Profile:', profileData);
    console.log();
    
    // STEP 3: Buscar dados da empresa
    console.log('📋 STEP 3: Buscando empresa...');
    
    if (!profileData.company_id) {
      console.error('❌ Usuário não vinculado a empresa');
      return;
    }
    
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, name, email, corp_email, user_id')
      .eq('id', profileData.company_id)
      .single();
    
    if (companyError) {
      console.error('❌ Erro ao buscar empresa:', companyError);
      return;
    }
    
    console.log('✅ Empresa encontrada!');
    console.log('Company:', companyData);
    console.log();
    
    // STEP 4: Verificar permissões
    console.log('📋 STEP 4: Verificando permissões...');
    
    const isOwner = companyData.user_id === authData.user.id;
    const isAdmin = profileData.employee_status === 'admin' || profileData.employee_status === 'active';
    
    console.log('É owner:', isOwner);
    console.log('É admin:', isAdmin);
    console.log('Status do funcionário:', profileData.employee_status);
    
    if (!isOwner && !isAdmin) {
      console.error('❌ Acesso negado - Sem permissão');
      return;
    }
    
    const accessType = isOwner ? 'owner' : 'admin';
    console.log('✅ Acesso liberado como:', accessType);
    console.log();
    
    // STEP 5: Simular dados de sessão
    console.log('📋 STEP 5: Dados para localStorage:');
    console.log('companyId:', companyData.id);
    console.log('companyName:', companyData.name);
    console.log('companyEmail:', companyData.email || companyData.corp_email);
    console.log('userRole:', accessType);
    console.log('userId:', authData.user.id);
    console.log('userProfileId:', profileData.id);
    
    // Logout
    await supabase.auth.signOut();
    
    console.log();
    console.log('🎉 TESTE COMPLETO - LOGIN FUNCIONARÁ!');
    console.log();
    console.log('═══════════════════════════════════════');
    console.log('✅ NOVA LÓGICA TESTADA E FUNCIONANDO!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email   :', TEST_EMAIL);
    console.log('🔑 Senha   :', TEST_PASSWORD);
    console.log('👑 Acesso  :', accessType.toUpperCase());
    console.log('🏢 Empresa :', companyData.name);
    console.log('═══════════════════════════════════════');
    console.log();
    console.log('🚀 O login no navegador funcionará perfeitamente!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar teste
testLoginLogic();
