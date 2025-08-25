-- Cria a tabela para armazenar os prompts de IA, se ela não existir
CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL UNIQUE,
    content text NOT NULL,
    version integer DEFAULT 1,
    is_active boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT ai_prompts_pkey PRIMARY KEY (id),
    CONSTRAINT ai_prompts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

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

-- Insere o prompt para a geração de relatórios de compliance
INSERT INTO public.ai_prompts (name, content, is_active, created_by)
VALUES (
    'generate_compliance_report',
    'Você é um especialista em RH e bem-estar corporativo. Sua tarefa é analisar os dados a seguir, que representam as métricas de um programa de saúde mental em uma empresa, e gerar um relatório de compliance. O relatório deve ser estruturado, profissional e fornecer insights acionáveis.

Estrutura do Relatório:
1.  **Resumo Executivo:** Um parágrafo conciso que resume os principais resultados e o estado geral do programa de bem-estar.
2.  **Pontos Fortes:** Uma lista de 2 a 3 pontos que destacam os sucessos do programa com base nos dados.
3.  **Pontos de Melhoria:** Uma lista de 2 a 3 áreas que precisam de atenção, identificadas a partir dos dados.
4.  **Plano de Ação Sugerido:** Uma lista de 3 ações práticas e realistas que a empresa pode tomar para melhorar o programa.

Analise os dados fornecidos e gere o conteúdo para cada uma dessas seções. Seja objetivo e baseie suas conclusões diretamente nos dados.',
    true,
    (SELECT id FROM auth.users LIMIT 1) -- Associa ao primeiro usuário como criador
) ON CONFLICT (name) DO NOTHING;
