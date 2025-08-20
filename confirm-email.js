import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc5NDI2NCwiZXhwIjoyMDYyMzcwMjY0fQ.VH-n1AaOjUWqmW1QCYLgMOrkgQNLI3b8JLH0nFMvfmY'; // Service key para admin

// Criar cliente com service key para operações de admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin.blue@bluesaude.com';

console.log('📧 Confirmando email para remover verificação...');
console.log('Email:', ADMIN_EMAIL);
console.log();

async function confirmEmailAndTest() {
  try {
    // STEP 1: Buscar o usuário pelo email
    console.log('📋 STEP 1: Buscando usuário por email...');
    
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }
    
    const targetUser = users.users.find(user => user.email === ADMIN_EMAIL);
    
    if (!targetUser) {
      console.error('❌ Usuário não encontrado:', ADMIN_EMAIL);
      console.log('Usuários disponíveis:', users.users.map(u => u.email));
      return;
    }
    
    console.log('✅ Usuário encontrado!');
    console.log('User ID:', targetUser.id);
    console.log('Email confirmado:', targetUser.email_confirmed_at ? 'SIM' : 'NÃO');
    console.log('Criado em:', targetUser.created_at);
    console.log();

    // STEP 2: Confirmar email se ainda não foi confirmado
    if (!targetUser.email_confirmed_at) {
      console.log('📋 STEP 2: Confirmando email...');
      
      const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.error('❌ Erro ao confirmar email:', updateError);
        return;
      }
      
      console.log('✅ Email confirmado com sucesso!');
      console.log('Resultado:', updateResult.user.email_confirmed_at ? 'CONFIRMADO' : 'AINDA PENDENTE');
    } else {
      console.log('✅ Email já estava confirmado!');
    }
    console.log();

    // STEP 3: Testar login
    console.log('📋 STEP 3: Testando login...');
    
    // Usar cliente normal para teste de login
    const supabaseClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo');
    
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: 'BlueAdmin123!'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      console.log('Código do erro:', loginError.status);
      
      // Verificar se ainda é erro de email não confirmado
      if (loginError.message.includes('Email not confirmed') || loginError.message.includes('not confirmed')) {
        console.log('⚠️  Ainda há problema com confirmação de email');
        console.log('💡 Pode ser necessário aguardar alguns segundos ou tentar novamente');
      }
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('User ID:', loginData.user.id);
    console.log('Email:', loginData.user.email);
    console.log('Email confirmado em:', loginData.user.email_confirmed_at);
    console.log();

    // STEP 4: Verificar dados do perfil
    console.log('📋 STEP 4: Verificando perfil do usuário...');
    
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('preferred_name, company_id, email, employee_status')
      .eq('user_id', loginData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil encontrado!');
    console.log('Nome:', profile.preferred_name);
    console.log('Email:', profile.email);
    console.log('Company ID:', profile.company_id);
    console.log('Status:', profile.employee_status);
    console.log();

    // STEP 5: Logout para limpar sessão
    await supabaseClient.auth.signOut();
    
    console.log('🎉 SUCESSO TOTAL!');
    console.log();
    console.log('═══════════════════════════════════════');
    console.log('✅ EMAIL CONFIRMADO E LOGIN FUNCIONANDO!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email   : admin.blue@bluesaude.com');
    console.log('🔑 Senha   : BlueAdmin123!');
    console.log('🌐 URL     : http://localhost:8082');
    console.log('═══════════════════════════════════════');
    console.log();
    console.log('📝 INSTRUÇÕES:');
    console.log('1. Acesse: http://localhost:8082');
    console.log('2. Selecione a aba "Empresas"');
    console.log('3. Digite o email e senha acima');
    console.log('4. NÃO haverá mais solicitação de verificação!');
    console.log('5. Clique em "Entrar como Empresa"');
    console.log();
    console.log('🚀 Você será direcionado diretamente para o dashboard!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar confirmação
confirmEmailAndTest();
