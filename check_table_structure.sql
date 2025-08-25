-- =====================================================
-- VERIFICAÇÃO DA ESTRUTURA DA TABELA COMPLIANCE_REPORTS
-- =====================================================

-- 1. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se os campos pdf_url e pdf_size_bytes existem
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'compliance_reports' 
AND table_schema = 'public'
AND column_name IN ('pdf_url', 'pdf_size_bytes');

-- 3. Verificar dados de um relatório específico (substitua o ID)
-- SELECT * FROM compliance_reports WHERE id = 'SEU_ID_AQUI';

-- 4. Verificar todos os relatórios com PDF
SELECT 
  id,
  title,
  pdf_url,
  pdf_size_bytes,
  generated_at,
  status
FROM compliance_reports 
WHERE pdf_url IS NOT NULL
ORDER BY generated_at DESC;

-- 5. Verificar relatórios sem PDF
SELECT 
  id,
  title,
  pdf_url,
  pdf_size_bytes,
  generated_at,
  status
FROM compliance_reports 
WHERE pdf_url IS NULL
ORDER BY generated_at DESC;
