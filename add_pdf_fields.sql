-- =====================================================
-- ADICIONAR CAMPOS PDF À TABELA COMPLIANCE_REPORTS
-- =====================================================

-- 1. Verificar se os campos já existem
DO $$
BEGIN
    -- Verificar se pdf_url existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compliance_reports' 
        AND column_name = 'pdf_url'
    ) THEN
        RAISE NOTICE '➕ Adicionando campo pdf_url...';
        ALTER TABLE compliance_reports ADD COLUMN pdf_url TEXT;
    ELSE
        RAISE NOTICE '✅ Campo pdf_url já existe';
    END IF;

    -- Verificar se pdf_size_bytes existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compliance_reports' 
        AND column_name = 'pdf_size_bytes'
    ) THEN
        RAISE NOTICE '➕ Adicionando campo pdf_size_bytes...';
        ALTER TABLE compliance_reports ADD COLUMN pdf_size_bytes INTEGER;
    ELSE
        RAISE NOTICE '✅ Campo pdf_size_bytes já existe';
    END IF;
END $$;

-- 2. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
AND column_name IN ('pdf_url', 'pdf_size_bytes')
ORDER BY column_name;

-- 3. Verificar dados existentes
SELECT 
    COUNT(*) as total_reports,
    COUNT(pdf_url) as reports_with_pdf,
    COUNT(pdf_size_bytes) as reports_with_size
FROM compliance_reports;

-- 4. Mostrar alguns relatórios com PDF
SELECT 
    id,
    title,
    pdf_url,
    pdf_size_bytes,
    generated_at
FROM compliance_reports 
WHERE pdf_url IS NOT NULL
ORDER BY generated_at DESC
LIMIT 5;
