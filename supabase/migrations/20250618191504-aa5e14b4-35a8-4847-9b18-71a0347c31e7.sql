
-- Remover políticas existentes se existirem e recriar
DROP POLICY IF EXISTS "Authenticated users can view events" ON eventos;
DROP POLICY IF EXISTS "Authenticated users can create events" ON eventos;
DROP POLICY IF EXISTS "Users can update their own events" ON eventos;
DROP POLICY IF EXISTS "Admins can delete events" ON eventos;

-- Políticas para eventos
CREATE POLICY "Authenticated users can view events" ON eventos
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create events" ON eventos
FOR INSERT TO authenticated WITH CHECK (usuario_responsavel_id = auth.uid());

CREATE POLICY "Users can update their own events" ON eventos
FOR UPDATE TO authenticated USING (usuario_responsavel_id = auth.uid());

CREATE POLICY "Admins can delete events" ON eventos
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND papel = 'admin'
    AND ativo = true
  )
);

-- Remover políticas de contatos_evento se existirem
DROP POLICY IF EXISTS "Authenticated users can view event contacts" ON contatos_evento;
DROP POLICY IF EXISTS "Authenticated users can create event contacts" ON contatos_evento;
DROP POLICY IF EXISTS "Authenticated users can update event contacts" ON contatos_evento;
DROP POLICY IF EXISTS "Authenticated users can delete event contacts" ON contatos_evento;

-- Recriar políticas para contatos_evento
CREATE POLICY "Authenticated users can view event contacts" ON contatos_evento
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create event contacts" ON contatos_evento
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update event contacts" ON contatos_evento
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete event contacts" ON contatos_evento
FOR DELETE TO authenticated USING (true);

-- Criar/atualizar função para auto-criação de usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, papel, ativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'user',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Remover trigger existente se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrar usuários existentes que podem não estar na tabela usuarios
INSERT INTO public.usuarios (id, nome, email, papel, ativo)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'name', au.email),
  au.email,
  'user',
  true
FROM auth.users au
LEFT JOIN public.usuarios u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
