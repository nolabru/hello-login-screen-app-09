-- Cria a tabela para armazenar os prompts de IA, se ela não existir
CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    content text NOT NULL,
    version integer DEFAULT 1,
    is_active boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT ai_prompts_pkey PRIMARY KEY (id),
    CONSTRAINT ai_prompts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Adiciona a restrição UNIQUE à coluna 'name' para evitar duplicatas
ALTER TABLE public.ai_prompts ADD CONSTRAINT ai_prompts_name_unique UNIQUE (name);

-- Habilita a Row Level Security para a tabela de prompts
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes para garantir um estado limpo
DROP POLICY IF EXISTS "Allow authenticated users to read prompts" ON public.ai_prompts;

-- Cria a nova política que permite a leitura por qualquer usuário autenticado
CREATE POLICY "Allow authenticated users to read prompts"
ON public.ai_prompts
FOR SELECT
TO authenticated
USING (true);
