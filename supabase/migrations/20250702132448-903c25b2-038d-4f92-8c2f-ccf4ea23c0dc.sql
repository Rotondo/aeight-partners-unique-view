-- Habilitar RLS na tabela repositorio_links
ALTER TABLE public.repositorio_links ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários autenticados vejam todos os links
CREATE POLICY "Usuários autenticados podem ver links" 
ON public.repositorio_links 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados insiram links
CREATE POLICY "Usuários autenticados podem inserir links" 
ON public.repositorio_links 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados atualizem links
CREATE POLICY "Usuários autenticados podem atualizar links" 
ON public.repositorio_links 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Permitir que apenas admins deletem links
CREATE POLICY "Apenas admins podem deletar links" 
ON public.repositorio_links 
FOR DELETE 
USING (is_admin());