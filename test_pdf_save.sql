-- =====================================================
-- TESTE DE SALVAMENTO DE PDF
-- =====================================================

-- 1. Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar campos PDF se não existirem
DO $$
BEGIN
    -- Adicionar pdf_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compliance_reports' 
        AND column_name = 'pdf_url'
    ) THEN
        ALTER TABLE compliance_reports ADD COLUMN pdf_url TEXT;
        RAISE NOTICE '✅ Campo pdf_url adicionado';
    ELSE
        RAISE NOTICE '✅ Campo pdf_url já existe';
    END IF;

    -- Adicionar pdf_size_bytes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compliance_reports' 
        AND column_name = 'pdf_size_bytes'
    ) THEN
        ALTER TABLE compliance_reports ADD COLUMN pdf_size_bytes INTEGER;
        RAISE NOTICE '✅ Campo pdf_size_bytes adicionado';
    ELSE
        RAISE NOTICE '✅ Campo pdf_size_bytes já existe';
    END IF;
END $$;

-- 3. Testar inserção de dados PDF
DO $$
DECLARE
    test_report_id UUID;
BEGIN
    -- Buscar um relatório existente para teste
    SELECT id INTO test_report_id 
    FROM compliance_reports 
    LIMIT 1;
    
    IF test_report_id IS NOT NULL THEN
        -- Atualizar com dados de teste
        UPDATE compliance_reports 
        SET 
            pdf_url = 'https://exemplo.com/teste.pdf',
            pdf_size_bytes = 1024
        WHERE id = test_report_id;
        
        RAISE NOTICE '✅ Relatório de teste atualizado com ID: %', test_report_id;
    ELSE
        RAISE NOTICE '⚠️ Nenhum relatório encontrado para teste';
    END IF;
END $$;

-- 4. Verificar se os dados foram salvos
SELECT 
    id,
    title,
    pdf_url,
    pdf_size_bytes,
    generated_at
FROM compliance_reports 
ORDER BY generated_at DESC
LIMIT 5;

-- 5. Verificar se os campos PDF existem agora
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
AND column_name IN ('pdf_url', 'pdf_size_bytes')
ORDER BY column_name;
