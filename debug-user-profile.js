import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo';

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = 'c7d93d0f-4c8a-4372-8b8d-ebe2dcd2bad7';

console.log('🔍 Iniciando diagnóstico do usuário...');
console.log('User ID:', USER_ID);
console.log();

// Teste 1: Verificar se o usuário existe na auth
console.log('📋 TESTE 1: Verificando usuário na tabela auth.users');
try {
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);
  console.log('Auth User:', authUser?.user ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
  if (authError) {
    console.log('Auth Error:', authError);
  } else if (authUser?.user) {
    console.log('Email:', authUser.user.email);
    console.log('User Metadata:', authUser.user.user_metadata);
  }
} catch (error) {
  console.log('Erro ao buscar auth:', error.message);
}
console.log();

// Teste 2: Buscar na user_profiles usando user_id (correto)
console.log('📋 TESTE 2: Buscando na user_profiles com user_id');
try {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('user_id, company_id, preferred_name, email')
    .eq('user_id', USER_ID)
    .single();

  console.log('Profile Data:', profile);
  if (profileError) {
    console.log('Profile Error:', profileError);
  }
} catch (error) {
  console.log('Erro ao buscar profile:', error.message);
}
console.log();

// Teste 3: Buscar ALL user_profiles para ver estrutura
console.log('📋 TESTE 3: Listando TODOS os user_profiles (primeiros 5)');
try {
  const { data: allProfiles, error: allError } = await supabase
    .from('user_profiles')
    .select('user_id, company_id, preferred_name, email')
    .limit(5);

  console.log('Total encontrados:', allProfiles?.length || 0);
  if (allProfiles) {
    allProfiles.forEach((profile, i) => {
      console.log(`Profile ${i + 1}:`, {
        user_id: profile.user_id,
        company_id: profile.company_id,
        preferred_name: profile.preferred_name,
        email: profile.email
      });
    });
  }
  if (allError) {
    console.log('All Profiles Error:', allError);
  }
} catch (error) {
  console.log('Erro ao buscar todos os profiles:', error.message);
}
console.log();

// Teste 4: Buscar companies para ver se existem
console.log('📋 TESTE 4: Verificando tabela companies');
try {
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, email')
    .limit(3);

  console.log('Total companies:', companies?.length || 0);
  if (companies) {
    companies.forEach((company, i) => {
      console.log(`Company ${i + 1}:`, {
        id: company.id,
        name: company.name,
        email: company.email
      });
    });
  }
  if (companiesError) {
    console.log('Companies Error:', companiesError);
  }
} catch (error) {
  console.log('Erro ao buscar companies:', error.message);
}
console.log();

// Teste 5: Teste com query SQL raw
console.log('📋 TESTE 5: Query SQL raw via RPC (se disponível)');
try {
  const { data: rawData, error: rawError } = await supabase
    .rpc('exec_sql', { query: `SELECT user_id, company_id FROM user_profiles WHERE user_id = '${USER_ID}'` });

  console.log('Raw SQL Result:', rawData);
  if (rawError) {
    console.log('Raw SQL Error:', rawError);
  }
} catch (error) {
  console.log('RPC não disponível ou erro:', error.message);
}

console.log();
console.log('🎯 Diagnóstico completo!');
