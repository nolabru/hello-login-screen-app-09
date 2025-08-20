import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

const BLUE_COMPANY_ID = '75af2e69-69c7-4d59-924d-dbec41ee01df';

// CREDENCIAIS DEFINIDAS
const ADMIN_EMAIL = 'admin.blue@bluesaude.com';
const ADMIN_PASSWORD = 'BlueAdmin123!';
const ADMIN_NAME = 'Administrador Blue';

console.log('🔐 Criando novo administrador da empresa...');
console.log('📧 Email:', ADMIN_EMAIL);
console.log('🔑 Senha:', ADMIN_PASSWORD);
console.log('🏢 Empresa: Blue Company');
console.log();

async function createAdminUser() {
  try {
    // STEP 1: Criar usuário no Supabase Auth
    console.log('📋 STEP 1: Criando usuário no Supabase Auth...');
    
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
      console.error('❌ Erro ao criar usuário no Auth:', authError);
      
      // Se já existe, tentar fazer login para obter o ID
      if (authError.message.includes('already registered')) {
        console.log('👤 Usuário já existe, tentando fazer login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        
        if (signInError) {
          console.error('❌ Erro no login:', signInError);
          console.log('💡 Tente usar uma senha diferente ou deletar o usuário existente.');
          return;
        }
        
        console.log('✅ Login bem-sucedido! Usando usuário existente.');
        authData.user = signInData.user;
      } else {
        return;
      }
    }
    
    if (!authData?.user) {
      console.error('❌ Falha ao criar/obter usuário');
      return;
    }
    
    const userId = authData.user.id;
    console.log('✅ Usuário criado no Auth!');
    console.log('🆔 User ID:', userId);
    console.log();
    
    // STEP 2: Verificar se já existe perfil para este usuário
    console.log('📋 STEP 2: Verificando se perfil já existe...');
    
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      console.log('✅ Perfil já existe! Atualizando para admin...');
      
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
      
      console.log('✅ Perfil atualizado com sucesso!');
    } else {
      // STEP 3: Criar perfil na user_profiles
      console.log('📋 STEP 3: Criando perfil na user_profiles...');
      
      const newUserProfile = {
        user_id: userId,
        company_id: BLUE_COMPANY_ID,
        preferred_name: ADMIN_NAME,
        full_name: ADMIN_NAME + ' da Blue Company',
        email: ADMIN_EMAIL,
        gender: 'Não informado',
        age_range: '30-40',
        mental_health_experience: 'Profissional',
        employee_status: 'active',
        phone_number: '(11) 99999-0001',
        aia_objectives: ['Administrar empresa', 'Supervisionar funcionários'],
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
      
      console.log('✅ Perfil criado com sucesso!');
      console.log('🆔 Profile ID:', insertedProfile.id);
    }
    
    // STEP 4: Verificação final
    console.log('📋 STEP 4: Verificação final...');
    
    const { data: finalProfile, error: finalError } = await supabase
      .from('user_profiles')
      .select('id, user_id, company_id, preferred_name, email, employee_status')
      .eq('user_id', userId)
      .single();

    if (finalError) {
      console.error('❌ Erro na verificação:', finalError);
      return;
    }

    console.log('✅ Verificação bem-sucedida!');
    console.log('👤 Dados finais:', finalProfile);
    console.log();

    // STEP 5: Fazer logout para limpar sessão
    console.log('📋 STEP 5: Fazendo logout...');
    await supabase.auth.signOut();
    
    console.log('🎉 ADMINISTRADOR CRIADO COM SUCESSO!');
    console.log();
    console.log('═══════════════════════════════════════');
    console.log('🔐 CREDENCIAIS PARA LOGIN:');
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
    console.log();
    console.log('✅ Você será direcionado para o dashboard da empresa!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar criação
createAdminUser();
