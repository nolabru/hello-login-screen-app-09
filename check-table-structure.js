import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Investigando estrutura real da tabela user_profiles...');

async function checkTableStructure() {
  try {
    // Primeiro vamos ver um registro existente para saber exatamente quais campos existem
    console.log('📋 Verificando registro existente do João Vitor...');
    
    const { data: existingUser, error: existingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', '28068eac-7340-4660-aa06-9216f5805fe1')
      .single();

    if (existingError) {
      console.error('❌ Erro ao buscar usuário existente:', existingError);
      return;
    }

    if (existingUser) {
      console.log('✅ Estrutura do registro existente:');
      console.log('Campos disponíveis:', Object.keys(existingUser));
      console.log('Dados do registro:', existingUser);
      console.log();
      
      // Agora vamos tentar inserir usando apenas os campos que sabemos que existem
      console.log('📋 Tentando inserir com campos conhecidos...');
      
      const MISSING_USER_ID = 'c7d93d0f-4c8a-4372-8b8d-ebe2dcd2bad7';
      const BLUE_COMPANY_ID = '75af2e69-69c7-4d59-924d-dbec41ee01df';
      
      // Usar campos baseados no registro existente
      const newUserProfile = {};
      
      // Adicionar campos obrigatórios um por vez
      if ('user_id' in existingUser) newUserProfile.user_id = MISSING_USER_ID;
      if ('company_id' in existingUser) newUserProfile.company_id = BLUE_COMPANY_ID;
      if ('email' in existingUser) newUserProfile.email = 'admin@bluesaude.com';
      if ('password' in existingUser) newUserProfile.password = 'temp123';
      if ('status' in existingUser) newUserProfile.status = true;
      
      // Campos com nomes alternativos possíveis
      if ('name' in existingUser) {
        newUserProfile.name = 'Administrador Blue Company';
      } else if ('preferred_name' in existingUser) {
        newUserProfile.preferred_name = 'Administrador Blue Company';
      } else if ('full_name' in existingUser) {
        newUserProfile.full_name = 'Administrador Blue Company';
      }
      
      console.log('Dados que tentaremos inserir:', newUserProfile);
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([newUserProfile])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir:', insertError);
        
        // Tentar com campos ainda mais básicos
        console.log('📋 Tentando com campos mínimos...');
        const minimalProfile = {
          user_id: MISSING_USER_ID,
          email: 'admin@bluesaude.com',
          password: 'temp123'
        };
        
        if ('company_id' in existingUser) {
          minimalProfile.company_id = BLUE_COMPANY_ID;
        }
        
        console.log('Dados mínimos:', minimalProfile);
        
        const { data: minimalInsert, error: minimalError } = await supabase
          .from('user_profiles')
          .insert([minimalProfile])
          .select()
          .single();
          
        if (minimalError) {
          console.error('❌ Erro mesmo com dados mínimos:', minimalError);
        } else {
          console.log('✅ Inserção mínima bem-sucedida!');
          console.log('Profile criado:', minimalInsert);
        }
        return;
      }

      console.log('✅ User profile criado com sucesso!');
      console.log('Profile inserido:', insertedProfile);
      
    } else {
      console.error('❌ Nenhum registro encontrado para comparação');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar verificação
checkTableStructure();
