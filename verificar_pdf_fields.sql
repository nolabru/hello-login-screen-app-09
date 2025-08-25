-- =====================================================
-- VERIFICAÇÃO RÁPIDA DOS CAMPOS PDF
-- =====================================================

-- 1. Verificar se os campos PDF existem
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
AND column_name IN ('pdf_url', 'pdf_size_bytes');

-- 2. Se não existirem, adicionar
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

-- 3. Verificar novamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
AND column_name IN ('pdf_url', 'pdf_size_bytes');
