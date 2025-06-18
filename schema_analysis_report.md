# 🔍 ANÁLISE DE INCONSISTÊNCIAS - SCHEMA vs TIPOS TYPESCRIPT

## ❌ DIFERENÇAS CRÍTICAS IDENTIFICADAS

### 1. **TABELA `companies`**

#### Schema Real:
```sql
id uuid NOT NULL DEFAULT gen_random_uuid()
user_id uuid (FK para auth.users)
```

#### Tipos TypeScript Atuais:
```typescript
id: number  // ❌ INCORRETO - deveria ser string (uuid)
// ❌ FALTANDO user_id
// ❌ TEM password (não existe no schema real)
```

#### ✅ Correção Necessária:
- `id` deve ser `string` (uuid)
- Adicionar `user_id: string | null`
- Remover campo `password`

---

### 2. **TABELA `psychologists`**

#### Schema Real:
```sql
id uuid NOT NULL DEFAULT gen_random_uuid()
status text DEFAULT 'active'
user_id uuid (FK para auth.users)
```

#### Tipos TypeScript Atuais:
```typescript
id: string  // ✅ CORRETO
status: boolean  // ❌ INCORRETO - deveria ser string
// ❌ FALTANDO user_id
// ❌ TEM password (não existe no schema real)
```

#### ✅ Correção Necessária:
- `status` deve ser `string` ao invés de `boolean`
- Adicionar `user_id: string | null`
- Remover campo `password`

---

### 3. **TABELA `user_profiles`**

#### Schema Real:
```sql
id uuid NOT NULL DEFAULT gen_random_uuid()
preferred_name character varying NOT NULL
aia_objectives ARRAY NOT NULL
company_id uuid (FK para companies)
psychologist_id uuid (FK para psychologists)
employee_status text DEFAULT 'pending'
```

#### Tipos TypeScript Atuais:
```typescript
id: number  // ❌ INCORRETO - deveria ser string (uuid)
name: string  // ❌ INCORRETO - deveria ser preferred_name
// ❌ FALTANDO aia_objectives: string[]
// ❌ FALTANDO full_name, profile_photo
// ❌ FALTANDO employee_status
// ❌ TEM password (não existe no schema real)
company_id: string | null  // ✅ CORRETO (mas chamado id_empresa)
```

#### ✅ Correção Necessária:
- `id` deve ser `string` (uuid)
- Renomear `name` para `preferred_name`
- Adicionar `aia_objectives: string[]`
- Adicionar `full_name`, `profile_photo`, `employee_status`
- Remover campo `password`

---

### 4. **TABELA `company_licenses`**

#### Schema Real:
```sql
company_id uuid NOT NULL (FK para companies)
```

#### Tipos TypeScript Atuais:
```typescript
company_id: string  // ✅ CORRETO, mas companies.id é uuid
```

#### ✅ Correção Necessária:
- Manter `company_id: string` mas garantir que companies.id seja string

---

### 5. **TABELAS FALTANDO NOS TIPOS:**

#### ❌ Não existem tipos para:
- `ai_prompts` (necessário para AdminSettings)
- `company_psychologists`
- `psychologists_patients`
- `invitations`
- `reminders`
- `deep_memory`
- `short_memory`
- `user_streaks`

---

## 🚨 PROBLEMAS IDENTIFICADOS NO CÓDIGO

### 1. **AdminDashboard.tsx**
- Usa `psychologists.nome` mas schema tem `psychologists.name`
- Usa `companies.id` como number mas é uuid

### 2. **AdminPsychologists.tsx**
- Usa `psychologists.nome` (incorreto)
- Usa `psychologists.status` como boolean (incorreto)

### 3. **AdminCompanies.tsx**
- Usa `companies.id` como number (incorreto)
- Usa `companies.razao_social` mas schema tem `legal_name`

### 4. **AdminUsers.tsx**
- Usa `user_profiles.nome` mas schema tem `preferred_name`
- Usa `user_profiles.id_empresa` mas schema tem `company_id`

### 5. **AdminEmployees.tsx**
- Mesmos problemas de nomenclatura

---

## 📋 PLANO DE CORREÇÃO

### PRIORIDADE ALTA:
1. ✅ Atualizar tipos TypeScript para corresponder ao schema
2. ✅ Corrigir queries SQL nas páginas admin
3. ✅ Implementar tipos para tabelas faltantes

### PRIORIDADE MÉDIA:
4. ✅ Atualizar interfaces customizadas (user.ts, company.ts, license.ts)
5. ✅ Corrigir relacionamentos FK

### PRIORIDADE BAIXA:
6. ✅ Adicionar validações de tipo mais rigorosas
7. ✅ Implementar migrations se necessário
