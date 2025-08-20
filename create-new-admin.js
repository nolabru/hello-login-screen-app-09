import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

const BLUE_COMPANY_ID = '75af2e69-69c7-4d59-924d-dbec41ee01df';

// NOVAS CREDENCIAIS (diferente email)
const ADMIN_EMAIL = 'teste.admin@bluesaude.com';
const ADMIN_PASSWORD = 'Admin2025!';
const ADMIN_NAME = 'Admin Teste';

console.log('🆕 Criando novo usuário administrador...');
console.log('📧 Email:', ADMIN_EMAIL);
console.log('🔑 Senha:', ADMIN_PASSWORD);
console.log('🏢 Empresa: Blue Company');
console.log();

async function createAndTestUser() {
  try {
    // STEP 1: Criar usuário 
    console.log('📋 STEP 1: Criando usuário...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: { 
          user_type: 'company',
          name: ADMIN_NAME,
          role: 'admin'
        }
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('👤 Usuário já existe, tentando fazer login direto...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        
        if (!signInError && signInData.user) {
          console.log('✅ Login bem-sucedido com usuário existente!');
          authData.user = signInData.user;
        } else {
          console.error('❌ Erro no login:', signInError?.message);
          return;
        }
      } else {
        console.error('❌ Erro ao criar usuário:', authError.message);
        return;
      }
    } else {
      console.log('✅ Usuário criado no Auth!');
    }
    
    if (!authData?.user) {
      console.error('❌ Falha ao criar/obter usuário');
      return;
    }
    
    const userId = authData.user.id;
    console.log('🆔 User ID:', userId);
    console.log('✉️ Email confirmado:', authData.user.email_confirmed_at ? 'SIM' : 'NÃO');
    console.log();
    
    // STEP 2: Criar/Atualizar perfil
    console.log('📋 STEP 2: Criando perfil...');
    
    // Primeiro verificar se já existe
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      console.log('✅ Perfil já existe, atualizando...');
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          company_id: BLUE_COMPANY_ID,
          employee_status: 'active',
          preferred_name: ADMIN_NAME,
          email: ADMIN_EMAIL
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError);
        return;
      }
      
      console.log('✅ Perfil atualizado!');
    } else {
      console.log('🆕 Criando novo perfil...');
      
      const newUserProfile = {
        user_id: userId,
        company_id: BLUE_COMPANY_ID,
        preferred_name: ADMIN_NAME,
        full_name: ADMIN_NAME + ' da Blue Company',
        email: ADMIN_EMAIL,
        gender: 'Não informado',
        age_range: '25-35',
        mental_health_experience: 'Profissional',
        employee_status: 'active',
        phone_number: '(11) 99999-0002',
        aia_objectives: ['Administrar sistema', 'Supervisionar equipes'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertedProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([newUserProfile])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError);
        return;
      }
      
      console.log('✅ Perfil criado!');
      console.log('🆔 Profile ID:', insertedProfile.id);
    }
    
    // STEP 3: Testar login imediatamente
    console.log('📋 STEP 3: Testando login...');
    
    // Fazer logout primeiro para limpar sessão
    await supabase.auth.signOut();
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (loginError) {
      console.error('❌ Erro no teste de login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('⚠️  Email ainda precisará ser confirmado');
        console.log('💡 Se a verificação foi desabilitada, pode levar alguns minutos para propagar');
      }
    } else {
      console.log('✅ LOGIN FUNCIONA PERFEITAMENTE!');
      console.log('User ID:', loginData.user.id);
      console.log('Email confirmado:', loginData.user.email_confirmed_at ? 'SIM' : 'NÃO');
      
      // Fazer logout após teste
      await supabase.auth.signOut();
    }
    
    console.log();
    console.log('🎉 NOVO USUÁRIO CRIADO COM SUCESSO!');
    console.log();
    console.log('═══════════════════════════════════════');
    console.log('🔐 NOVAS CREDENCIAIS PARA LOGIN:');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email   :', ADMIN_EMAIL);
    console.log('🔑 Senha   :', ADMIN_PASSWORD);
    console.log('🏢 Empresa : Blue Company');
    console.log('👑 Tipo    : Administrador');
    console.log('🌐 URL     : http://localhost:8082');
    console.log('═══════════════════════════════════════');
    console.log();
    console.log('📝 INSTRUÇÕES:');
    console.log('1. Acesse: http://localhost:8082');
    console.log('2. Selecione a aba "Empresas"');
    console.log('3. Digite o email e senha acima');
    console.log('4. Clique em "Entrar como Empresa"');
    
    if (loginError && loginError.message.includes('Email not confirmed')) {
      console.log();
      console.log('⚠️  OBSERVAÇÃO:');
      console.log('Se ainda aparecer erro de email não confirmado,');
      console.log('aguarde alguns minutos para as configurações propagarem');
      console.log('ou verifique se a configuração foi salva corretamente no Supabase.');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar criação e teste
createAndTestUser();
