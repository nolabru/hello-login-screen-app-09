import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygafwrebafehwaomibmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc5NDI2NCwiZXhwIjoyMDYyMzcwMjY0fQ.7wqGr7YZQqUmMq8pBL4rBSJf5rJNIRNh4QT7XJ6LJ_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableTypes() {
  console.log('🔍 Verificando tipos de dados das tabelas...');
  
  try {
    // Verificar tipos da tabela compliance_reports
    console.log('\n📋 1. Tipos da tabela compliance_reports:');
    const { data: complianceTypes } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT column_name, data_type, udt_name 
          FROM information_schema.columns 
          WHERE table_name = 'compliance_reports' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (complianceTypes) {
      complianceTypes.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
    }
    
    // Verificar tipos da tabela user_profiles
    console.log('\n📋 2. Tipos da tabela user_profiles:');
    const { data: profileTypes } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT column_name, data_type, udt_name 
          FROM information_schema.columns 
          WHERE table_name = 'user_profiles' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (profileTypes) {
      profileTypes.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
    }
    
    // Verificar tipos da tabela companies
    console.log('\n📋 3. Tipos da tabela companies:');
    const { data: companiesTypes } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT column_name, data_type, udt_name 
          FROM information_schema.columns 
          WHERE table_name = 'companies' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (companiesTypes) {
      companiesTypes.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
    }
    
    // Verificar tipo do auth.uid()
    console.log('\n📋 4. Tipo de auth.uid():');
    const { data: authType } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT pg_typeof(auth.uid()) as auth_uid_type;
        `
      });
    
    if (authType) {
      console.log(`  auth.uid(): ${authType[0]?.auth_uid_type || 'uuid'}`);
    }
    
    console.log('\n✅ Verificação de tipos concluída!');
    
  } catch (error) {
    console.error('💥 Erro ao verificar tipos:', error);
  }
}

// Executar verificação
checkTableTypes();
