-- =====================================================
-- CONFIGURAÇÃO DO STORAGE PARA RELATÓRIOS PDF
-- =====================================================

-- 1. Criar bucket para relatórios PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-pdfs',
  'report-pdfs',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas de acesso ao bucket
-- Política para usuários autenticados da empresa
CREATE POLICY "Users can upload reports to their company bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-pdfs' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
);

-- Política para usuários visualizarem relatórios da sua empresa
CREATE POLICY "Users can view reports from their company" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-pdfs' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
);

-- Política para usuários atualizarem relatórios da sua empresa
CREATE POLICY "Users can update reports from their company" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'report-pdfs' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
);

-- Política para usuários deletarem relatórios da sua empresa
CREATE POLICY "Users can delete reports from their company" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-pdfs' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
);

-- 3. Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'report-pdfs';

-- 4. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
