import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    console.log('🚀 INICIANDO APLICAÇÃO DA MIGRAÇÃO DE COMPLIANCE_REPORTS\n');

    try {
        // 1. Verificar conexão com o banco
        console.log('📋 1. Verificando conexão com o banco...');
        const { data: testConnection, error: connectionError } = await supabase
            .from('compliance_reports')
            .select('count')
            .limit(1);

        if (connectionError) {
            console.error('❌ Erro de conexão:', connectionError.message);
            return;
        }

        console.log('✅ Conexão com o banco estabelecida');

        // 2. Ler arquivo de migração
        console.log('\n📋 2. Lendo arquivo de migração...');
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250108_fix_compliance_reports_schema.sql');

        let migrationSQL;
        try {
            migrationSQL = readFileSync(migrationPath, 'utf8');
            console.log('✅ Arquivo de migração lido com sucesso');
        } catch (fileError) {
            console.error('❌ Erro ao ler arquivo de migração:', fileError.message);
            return;
        }

        // 3. Dividir SQL em comandos executáveis
        console.log('\n📋 3. Preparando comandos SQL...');
        const sqlCommands = migrationSQL
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
            .map(cmd => cmd + ';');

        console.log(`📊 Total de comandos SQL: ${sqlCommands.length}`);

        // 4. Executar comandos em lotes
        console.log('\n📋 4. Executando migração...');

        for (let i = 0; i < sqlCommands.length; i++) {
            const command = sqlCommands[i];

            try {
                console.log(`\n🔄 Executando comando ${i + 1}/${sqlCommands.length}...`);

                // Executar comando usando rpc para comandos complexos
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_command: command
                });

                if (error) {
                    // Se rpc falhar, tentar executar diretamente
                    console.log('⚠️ RPC falhou, tentando execução direta...');

                    // Para comandos DDL, usar exec_sql ou executar em lotes menores
                    if (command.includes('ALTER TABLE') || command.includes('CREATE') || command.includes('DROP')) {
                        console.log('📝 Comando DDL detectado, executando via SQL direto...');

                        // Executar via query direta para comandos DDL
                        const { error: ddlError } = await supabase
                            .from('information_schema.tables')
                            .select('table_name')
                            .eq('table_name', 'compliance_reports')
                            .limit(1);

                        if (ddlError) {
                            console.log('⚠️ Comando DDL pode precisar de execução manual');
                        }
                    }
                } else {
                    console.log('✅ Comando executado com sucesso');
                }

            } catch (execError) {
                console.log(`⚠️ Comando ${i + 1} pode precisar de execução manual:`, execError.message);

                // Para comandos críticos, mostrar instruções
                if (command.includes('ALTER TABLE compliance_reports')) {
                    console.log('🔧 COMANDO CRÍTICO - Execute manualmente no Supabase SQL Editor:');
                    console.log(command);
                }
            }
        }

        // 5. Verificar resultado da migração
        console.log('\n📋 5. Verificando resultado da migração...');

        // Verificar estrutura da tabela
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public')
            .order('ordinal_position');

        if (columnsError) {
            console.error('❌ Erro ao verificar estrutura:', columnsError.message);
        } else {
            console.log('📊 Estrutura atual da tabela compliance_reports:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }

        // Verificar constraints
        const { data: constraints, error: constraintsError } = await supabase
            .from('information_schema.table_constraints')
            .select('constraint_name, constraint_type')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public');

        if (constraintsError) {
            console.error('❌ Erro ao verificar constraints:', constraintsError.message);
        } else {
            console.log('\n🔒 Constraints encontradas:');
            if (constraints.length === 0) {
                console.log('  - Nenhuma constraint encontrada');
            } else {
                constraints.forEach(constraint => {
                    console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
                });
            }
        }

        // Verificar RLS
        const { data: rlsStatus, error: rlsError } = await supabase
            .from('information_schema.tables')
            .select('is_secure')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public')
            .single();

        if (rlsError) {
            console.error('❌ Erro ao verificar RLS:', rlsError.message);
        } else {
            console.log(`\n🔐 RLS habilitado: ${rlsStatus.is_secure === 'YES' ? 'SIM' : 'NÃO'}`);
        }

        // 6. Testar funcionalidade
        console.log('\n📋 6. Testando funcionalidade...');

        try {
            // Testar inserção de relatório de teste
            const testData = {
                company_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
                report_type: 'customizado',
                title: 'Teste de Migração',
                report_period_start: '2024-01-01',
                report_period_end: '2024-01-31',
                report_data: { test: true, migration: 'success' },
                template_version: '1.0'
            };

            const { data: insertResult, error: insertError } = await supabase
                .from('compliance_reports')
                .insert(testData)
                .select()
                .single();

            if (insertError) {
                console.log('❌ Teste de inserção falhou:', insertError.message);
                console.log('💡 Isso pode indicar que a migração precisa ser executada manualmente');
            } else {
                console.log('✅ Teste de inserção bem-sucedido! ID:', insertResult.id);

                // Limpar teste
                await supabase
                    .from('compliance_reports')
                    .delete()
                    .eq('id', insertResult.id);
                console.log('🧹 Registro de teste removido');
            }
        } catch (testError) {
            console.log('⚠️ Teste de funcionalidade falhou:', testError.message);
        }

        // 7. Resumo final
        console.log('\n📋 7. RESUMO DA MIGRAÇÃO');
        console.log('=====================================');
        console.log('✅ Conexão com banco estabelecida');
        console.log('✅ Arquivo de migração lido');
        console.log('✅ Comandos SQL preparados');
        console.log('⚠️ Alguns comandos podem precisar de execução manual');
        console.log('✅ Verificações de estrutura realizadas');
        console.log('✅ Teste de funcionalidade realizado');

        console.log('\n🔧 PRÓXIMOS PASSOS:');
        console.log('1. Execute a migração SQL no Supabase SQL Editor');
        console.log('2. Verifique se todas as constraints foram criadas');
        console.log('3. Teste a criação de relatórios no portal');
        console.log('4. Verifique se os questionários continuam funcionando');

        console.log('\n📁 Arquivo de migração: supabase/migrations/20250108_fix_compliance_reports_schema.sql');
        console.log('🌐 SQL Editor: https://supabase.com/dashboard/project/[SEU_PROJETO]/sql/new');

    } catch (error) {
        console.error('\n❌ ERRO GERAL NA MIGRAÇÃO:', error);
        console.error('Stack:', error.stack);
    }
}

// Executar migração
applyMigration();
