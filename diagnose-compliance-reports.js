import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseComplianceReports() {
    console.log('🔍 DIAGNÓSTICO COMPLETO - TABELA compliance_reports\n');

    try {
        // 1. Verificar se a tabela existe
        console.log('📋 1. Verificando existência da tabela...');
        const { data: tableExists, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public');

        if (tableError) {
            console.error('❌ Erro ao verificar tabela:', tableError);
            return;
        }

        if (tableExists.length === 0) {
            console.log('❌ Tabela compliance_reports NÃO EXISTE!');
            return;
        }

        console.log('✅ Tabela compliance_reports existe');

        // 2. Verificar estrutura da tabela
        console.log('\n📋 2. Verificando estrutura da tabela...');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public')
            .order('ordinal_position');

        if (columnsError) {
            console.error('❌ Erro ao verificar colunas:', columnsError);
            return;
        }

        console.log('📊 Estrutura atual da tabela:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // 3. Verificar constraints
        console.log('\n📋 3. Verificando constraints...');
        const { data: constraints, error: constraintsError } = await supabase
            .from('information_schema.table_constraints')
            .select('constraint_name, constraint_type')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public');

        if (constraintsError) {
            console.error('❌ Erro ao verificar constraints:', constraintsError);
            return;
        }

        console.log('🔒 Constraints encontradas:');
        if (constraints.length === 0) {
            console.log('  - Nenhuma constraint encontrada');
        } else {
            constraints.forEach(constraint => {
                console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
            });
        }

        // 4. Verificar foreign keys
        console.log('\n📋 4. Verificando foreign keys...');
        const { data: foreignKeys, error: fkError } = await supabase
            .from('information_schema.key_column_usage')
            .select(`
        constraint_name,
        column_name,
        referenced_table_name,
        referenced_column_name
      `)
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public')
            .not('referenced_table_name', 'is', null);

        if (fkError) {
            console.error('❌ Erro ao verificar foreign keys:', fkError);
            return;
        }

        console.log('🔗 Foreign keys encontradas:');
        if (foreignKeys.length === 0) {
            console.log('  - Nenhuma foreign key encontrada');
        } else {
            foreignKeys.forEach(fk => {
                console.log(`  - ${fk.constraint_name}: ${fk.column_name} -> ${fk.referenced_table_name}.${fk.referenced_column_name}`);
            });
        }

        // 5. Verificar RLS
        console.log('\n📋 5. Verificando Row Level Security...');
        const { data: rlsStatus, error: rlsError } = await supabase
            .from('information_schema.tables')
            .select('is_secure')
            .eq('table_name', 'compliance_reports')
            .eq('table_schema', 'public')
            .single();

        if (rlsError) {
            console.error('❌ Erro ao verificar RLS:', rlsError);
            return;
        }

        console.log(`🔐 RLS habilitado: ${rlsStatus.is_secure === 'YES' ? 'SIM' : 'NÃO'}`);

        // 6. Verificar políticas RLS
        if (rlsStatus.is_secure === 'YES') {
            console.log('\n📋 6. Verificando políticas RLS...');
            const { data: policies, error: policiesError } = await supabase
                .from('pg_policies')
                .select('policyname, cmd, qual, with_check')
                .eq('tablename', 'compliance_reports');

            if (policiesError) {
                console.error('❌ Erro ao verificar políticas:', policiesError);
            } else {
                console.log('📜 Políticas RLS encontradas:');
                if (policies.length === 0) {
                    console.log('  - Nenhuma política encontrada');
                } else {
                    policies.forEach(policy => {
                        console.log(`  - ${policy.policyname}: ${policy.cmd}`);
                        if (policy.qual) console.log(`    Qual: ${policy.qual}`);
                        if (policy.with_check) console.log(`    With Check: ${policy.with_check}`);
                    });
                }
            }
        }

        // 7. Verificar índices
        console.log('\n📋 7. Verificando índices...');
        const { data: indexes, error: indexesError } = await supabase
            .from('pg_indexes')
            .select('indexname, indexdef')
            .eq('tablename', 'compliance_reports')
            .eq('schemaname', 'public');

        if (indexesError) {
            console.error('❌ Erro ao verificar índices:', indexesError);
            return;
        }

        console.log('📈 Índices encontrados:');
        if (indexes.length === 0) {
            console.log('  - Nenhum índice encontrado');
        } else {
            indexes.forEach(index => {
                console.log(`  - ${index.indexname}: ${index.indexdef}`);
            });
        }

        // 8. Testar inserção
        console.log('\n📋 8. Testando inserção...');
        try {
            const testData = {
                company_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
                report_type: 'customizado',
                title: 'Teste de Diagnóstico',
                report_period_start: '2024-01-01',
                report_period_end: '2024-01-31',
                report_data: { test: true },
                template_version: '1.0'
            };

            const { data: insertResult, error: insertError } = await supabase
                .from('compliance_reports')
                .insert(testData)
                .select()
                .single();

            if (insertError) {
                console.log('❌ Erro na inserção:', insertError.message);
            } else {
                console.log('✅ Inserção bem-sucedida! ID:', insertResult.id);

                // Limpar teste
                await supabase
                    .from('compliance_reports')
                    .delete()
                    .eq('id', insertResult.id);
                console.log('🧹 Registro de teste removido');
            }
        } catch (error) {
            console.log('❌ Erro no teste de inserção:', error.message);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar diagnóstico
diagnoseComplianceReports();
