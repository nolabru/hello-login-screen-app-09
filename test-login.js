import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'admin.blue@bluesaude.com';
const ADMIN_PASSWORD = 'BlueAdmin123!';

console.log('🧪 Testando login após mudanças no Supabase...');
console.log('Email:', ADMIN_EMAIL);
console.log('Senha:', ADMIN_PASSWORD);
console.log();

async function testLogin() {
  try {
    console.log('📋 Testando login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.log('Status:', error.status);
      console.log('Código:', error.code);
      
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('email not confirmed') || 
          error.message.includes('not confirmed')) {
        console.log('💡 Email ainda não confirmado - isso era esperado antes da mudança');
      }
      return;
    }
    
    console.log('✅ LOGIN BEM-SUCEDIDO!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'SIM' : 'NÃO');
    console.log('User metadata:', data.user.user_metadata);
    console.log();
    
    // Verificar user_profiles
    console.log('📋 Verificando user_profiles...');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, company_id, preferred_name, email, employee_status')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil encontrado!');
    console.log('Profile ID:', profile.id);
    console.log('Nome:', profile.preferred_name);
    console.log('Company ID:', profile.company_id);
    console.log('Status:', profile.employee_status);
    console.log();
    
    // Verificar empresa
    console.log('📋 Verificando dados da empresa...');
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, email')
      .eq('id', profile.company_id)
      .single();
    
    if (companyError) {
      console.error('❌ Erro ao buscar empresa:', companyError);
      return;
    }
    
    console.log('✅ Empresa encontrada!');
    console.log('Nome:', company.name);
    console.log('Email:', company.email);
    console.log();
    
    // Logout
    await supabase.auth.signOut();
    
    console.log('🎉 TESTE COMPLETO - TUDO FUNCIONANDO!');
    console.log();
    console.log('═══════════════════════════════════════');
    console.log('✅ LOGIN TESTADO E FUNCIONANDO!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email   : admin.blue@bluesaude.com');
    console.log('🔑 Senha   : BlueAdmin123!');
    console.log('🏢 Empresa : Blue Company');
    console.log('👑 Status  : Administrador Ativo');
    console.log('🌐 URL     : http://localhost:8082');
    console.log('═══════════════════════════════════════');
    console.log();
    console.log('📝 VOCÊ PODE FAZER LOGIN AGORA:');
    console.log('1. Acesse: http://localhost:8082');
    console.log('2. Selecione a aba "Empresas"');
    console.log('3. Digite email e senha acima');
    console.log('4. Clique em "Entrar como Empresa"');
    console.log();
    console.log('🚀 Login funcionará sem problemas de verificação!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar teste
testLogin();
