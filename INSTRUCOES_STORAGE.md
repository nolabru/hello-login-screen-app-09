# 📁 INSTRUÇÕES PARA CONFIGURAR STORAGE NO SUPABASE

## 🚨 PROBLEMA IDENTIFICADO
O sistema está tentando fazer upload de PDFs para um bucket `report-pdfs` que não existe, causando o erro:
```
StorageApiError: Bucket not found
```

## 🔧 SOLUÇÃO 1: CRIAR BUCKET NO SUPABASE (RECOMENDADO)

### **Passo 1: Acessar o Supabase Dashboard**
1. Vá para [supabase.com](https://supabase.com)
2. Acesse seu projeto
3. Clique em **Storage** no menu lateral

### **Passo 2: Criar Novo Bucket**
1. Clique em **"New bucket"**
2. Configure:
   - **Name:** `report-pdfs`
   - **Public bucket:** ✅ Marcar como público
   - **File size limit:** 10MB
   - **Allowed MIME types:** `application/pdf`

### **Passo 3: Configurar Políticas de Acesso**
1. Clique no bucket `report-pdfs`
2. Vá para **Policies**
3. Clique em **"New Policy"**
4. Use o template **"Enable read access to everyone"**
5. Repita para **"Enable insert for authenticated users only"**

## 🔧 SOLUÇÃO 2: USAR BUCKET EXISTENTE (ALTERNATIVA)

### **Se preferir não criar novo bucket:**
O sistema já foi atualizado para usar o bucket `profiles` como fallback.

## 🧪 TESTE APÓS CONFIGURAÇÃO

1. **Execute o script SQL** (opcional):
   ```sql
   -- Copie e cole no SQL Editor do Supabase
   -- Arquivo: supabase/storage_setup.sql
   ```

2. **Teste a geração de relatório:**
   - Acesse o wizard de relatórios
   - Complete todos os steps
   - Confirme a geração
   - Verifique se o PDF é criado e salvo

## 📋 VERIFICAÇÃO

### **No Supabase Dashboard:**
- ✅ Bucket `report-pdfs` existe
- ✅ Políticas de acesso configuradas
- ✅ Arquivos PDF aparecem após upload

### **No Console do Navegador:**
- ✅ Sem erros de "Bucket not found"
- ✅ Upload bem-sucedido
- ✅ URL do PDF retornada

## 🆘 EM CASO DE PROBLEMAS

### **Erro persistente:**
1. Verifique se o bucket foi criado corretamente
2. Confirme as políticas de acesso
3. Teste com um arquivo pequeno primeiro

### **Logs úteis:**
- Console do navegador
- Logs do Supabase
- Network tab do DevTools

## 📝 NOTAS IMPORTANTES

- **Bucket público:** Permite acesso direto aos PDFs
- **Políticas:** Controlam quem pode fazer upload/download
- **Fallback:** Sistema usa `profiles` se `report-pdfs` não existir
- **Segurança:** Arquivos são organizados por `company_id`
