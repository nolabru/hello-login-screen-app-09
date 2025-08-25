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
