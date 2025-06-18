
-- Fix the dangerous is_admin() function that always returns true
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND papel = 'admin'
    AND ativo = true
  );
END;
$$;

-- Create function to check if user can access opportunity
CREATE OR REPLACE FUNCTION public.can_access_oportunidade(oportunidade_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM oportunidades o
    JOIN usuarios u ON u.id = auth.uid()
    WHERE o.id = oportunidade_id
    AND (
      o.usuario_envio_id = auth.uid() OR 
      o.usuario_recebe_id = auth.uid() OR
      u.papel = 'admin'
    )
    AND u.ativo = true
  );
END;
$$;

-- Create function to check if user belongs to empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_empresa(empresa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND empresa_id = user_belongs_to_empresa.empresa_id
    AND ativo = true
  );
END;
$$;

-- Enable RLS on tables that don't have it
ALTER TABLE public.atividades_oportunidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositorio_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_oportunidade ENABLE ROW LEVEL SECURITY;

-- RLS Policies for atividades_oportunidade
CREATE POLICY "Users can view activities for their opportunities" ON public.atividades_oportunidade
FOR SELECT USING (public.can_access_oportunidade(oportunidade_id));

CREATE POLICY "Users can create activities for their opportunities" ON public.atividades_oportunidade
FOR INSERT WITH CHECK (public.can_access_oportunidade(oportunidade_id));

CREATE POLICY "Users can update activities for their opportunities" ON public.atividades_oportunidade
FOR UPDATE USING (public.can_access_oportunidade(oportunidade_id));

CREATE POLICY "Admins can delete activities" ON public.atividades_oportunidade
FOR DELETE USING (public.is_admin());

-- RLS Policies for empresa_clientes
CREATE POLICY "Users can view their company clients" ON public.empresa_clientes
FOR SELECT USING (
  public.user_belongs_to_empresa(empresa_proprietaria_id) OR 
  public.is_admin()
);

CREATE POLICY "Users can manage their company clients" ON public.empresa_clientes
FOR ALL USING (
  public.user_belongs_to_empresa(empresa_proprietaria_id) OR 
  public.is_admin()
);

-- RLS Policies for wishlist_items
CREATE POLICY "Users can view wishlist for their companies" ON public.wishlist_items
FOR SELECT USING (
  public.user_belongs_to_empresa(empresa_proprietaria_id) OR 
  public.user_belongs_to_empresa(empresa_interessada_id) OR
  public.is_admin()
);

CREATE POLICY "Users can manage wishlist for their companies" ON public.wishlist_items
FOR ALL USING (
  public.user_belongs_to_empresa(empresa_proprietaria_id) OR 
  public.is_admin()
);

-- RLS Policies for repositorio_materiais
CREATE POLICY "Users can view materials for their company" ON public.repositorio_materiais
FOR SELECT USING (
  public.user_belongs_to_empresa(empresa_id) OR 
  public.is_admin()
);

CREATE POLICY "Users can manage materials for their company" ON public.repositorio_materiais
FOR ALL USING (
  public.user_belongs_to_empresa(empresa_id) OR 
  public.is_admin()
);

-- RLS Policies for contatos_evento  
CREATE POLICY "Authenticated users can view event contacts" ON public.contatos_evento
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage event contacts" ON public.contatos_evento
FOR ALL TO authenticated USING (true);

-- RLS Policies for historico_oportunidade
CREATE POLICY "Users can view opportunity history they have access to" ON public.historico_oportunidade
FOR SELECT USING (public.can_access_oportunidade(oportunidade_id));

CREATE POLICY "System can insert opportunity history" ON public.historico_oportunidade
FOR INSERT WITH CHECK (public.can_access_oportunidade(oportunidade_id));
