# Aeight Partners Unique View — Dados, Banco, Storage, Materiais, Policies e Auditoria

---

**Este documento cobre DE FORMA EXAUSTIVA todos os aspectos de dados do sistema:**  
Modelagem de banco, enums, relacionamentos, policies RLS, Supabase Storage, fluxos de materiais, triggers, auditoria, versionamento, troubleshooting, scripts, FAQ e referências cruzadas para garantir rastreabilidade, manutenção e evolução.

---

## 📑 Sumário

1. [Modelagem de Banco de Dados](#modelagem-de-banco-de-dados)
    - [Tabelas principais](#tabelas-principais)
    - [Campos, tipos e constraints](#campos-tipos-e-constraints)
    - [Enums globais](#enums-globais)
    - [Relacionamentos e diagrama textual](#relacionamentos-e-diagrama-textual)
2. [Fluxos e Políticas de Segurança](#fluxos-e-políticas-de-segurança)
    - [Policies RLS por tabela](#policies-rls-por-tabela)
    - [Triggers e auditoria](#triggers-e-auditoria)
    - [Exemplos de queries críticas](#exemplos-de-queries-críticas)
3. [Supabase Storage & Materiais](#supabase-storage--materiais)
    - [Buckets, estrutura e versionamento](#buckets-estrutura-e-versionamento)
    - [Policies de Storage](#policies-de-storage)
    - [Fluxo completo de upload, preview, exclusão](#fluxo-completo-de-upload-preview-exclusão)
    - [Tratamento de arquivos, preview e troubleshooting](#tratamento-de-arquivos-preview-e-troubleshooting)
4. [Auditoria, Logs e Versionamento](#auditoria-logs-e-versionamento)
    - [Triggers e tabelas de auditoria](#triggers-e-tabelas-de-auditoria)
    - [Exemplo de logs e rastreabilidade](#exemplo-de-logs-e-rastreabilidade)
    - [Backup, restore e dicas de expansão](#backup-restore-e-dicas-de-expansão)
5. [FAQ e Troubleshooting de Dados](#faq-e-troubleshooting-de-dados)
6. [Referências Cruzadas e Integrações](#referências-cruzadas-e-integrações)

---

## 1. Modelagem de Banco de Dados

### Tabelas principais

**empresas**
- id (UUID, PK)
- nome, tipo (enum company_type), status, descrição, created_at

**usuarios**
- id (UUID, PK)
- nome, email, papel (enum user_role), empresa_id (FK), ativo, created_at

**contatos**
- id (UUID, PK), empresa_id (FK), nome, email, telefone, created_at

**oportunidades**
- id (UUID, PK)
- empresa_origem_id (FK), empresa_destino_id (FK), contato_id (FK)
- usuario_envio_id (FK), usuario_recebe_id (FK)
- nome_lead, valor, status (enum opportunity_status)
- data_indicacao, data_fechamento, motivo_perda, observacoes, created_at

**atividades_oportunidade**
- id (UUID, PK), oportunidade_id (FK), titulo, descricao
- data_prevista, data_realizada, concluida, usuario_responsavel_id (FK), created_at, updated_at

**historico_oportunidade**
- id (UUID, PK), oportunidade_id (FK), usuario_id (FK)
- campo_alterado, valor_antigo, valor_novo, data_alteracao

**indicadores_parceiro**
- id (UUID, PK), empresa_id (FK), potencial_leads, base_clientes
- engajamento, alinhamento, potencial_investimento, tamanho (enum company_size)
- score_x, score_y, data_avaliacao

**share_icp**
- id (UUID, PK), empresa_id (FK), share_of_wallet, icp_alinhado, observacoes, created_at

**categorias**
- id (UUID, PK), nome, descricao, created_at

**onepager**
- id (UUID, PK), empresa_id (FK), categoria_id (FK)
- nome, url, icp, oferta, diferenciais, cases_sucesso, big_numbers, ponto_forte, ponto_fraco
- contato_nome, contato_email, contato_telefone, nota_quadrante, url_imagem
- arquivo_upload, data_upload

**repositorio_materiais**
- id (UUID, PK), empresa_id (FK), categoria_id (FK), nome, tipo_arquivo, tag_categoria
- url_arquivo, arquivo_upload, validade_contrato, usuario_upload (FK), data_upload

---

### Campos, tipos e constraints

- Todos os IDs são UUID (Supabase padrão).
- FKs possuem `ON DELETE SET NULL` para histórico.
- Campos obrigatórios: nome, empresa_id/categoria_id (exceto histórico).
- Datas em formato timestamp, default `now()`.
- Campos de enum sempre validados por constraints (ver [Enums globais](#enums-globais)).

---

### Enums globais

```sql
CREATE TYPE company_type AS ENUM ('intragrupo', 'parceiro', 'cliente');
CREATE TYPE opportunity_status AS ENUM (
  'em_contato', 'negociando', 'ganho', 'perdido', 'Contato', 'Apresentado', 'Sem contato'
);
CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager');
CREATE TYPE company_size AS ENUM ('PP', 'P', 'M', 'G', 'GG');
```

---

### Relacionamentos e diagrama textual

- oportunidades.empresa_origem_id → empresas.id
- oportunidades.empresa_destino_id → empresas.id
- oportunidades.usuario_envio_id → usuarios.id
- oportunidades.usuario_recebe_id → usuarios.id
- oportunidades.contato_id → contatos.id
- atividades_oportunidade.oportunidade_id → oportunidades.id
- atividades_oportunidade.usuario_responsavel_id → usuarios.id
- historico_oportunidade.oportunidade_id → oportunidades.id
- historico_oportunidade.usuario_id → usuarios.id
- indicadores_parceiro.empresa_id → empresas.id
- share_icp.empresa_id → empresas.id
- onepager.empresa_id → empresas.id
- onepager.categoria_id → categorias.id
- repositorio_materiais.empresa_id → empresas.id
- repositorio_materiais.categoria_id → categorias.id
- repositorio_materiais.usuario_upload → usuarios.id

**Nota:** diagrama visual disponível em [dbdiagram.io](https://dbdiagram.io/) (exporte a partir deste schema textual).

---

## 2. Fluxos e Políticas de Segurança

### Policies RLS por tabela

**Exemplo — Oportunidades:**

```sql
-- Permite leitura apenas para envolvidos (envio/recebimento)
CREATE POLICY "Read own opportunities"
ON public.oportunidades
FOR SELECT
USING (usuario_envio_id = auth.uid() OR usuario_recebe_id = auth.uid());
```

**Exemplo — Materiais (só dono pode deletar):**
```sql
CREATE POLICY "Allow delete for owner"
ON public.repositorio_materiais
FOR DELETE
TO authenticated
USING (usuario_upload = auth.uid());
```

**Boilerplate para outras tabelas:**
- SELECT: sempre com usuário envolvido (empresa, papel, id)
- INSERT/UPDATE: só admins ou usuários da empresa
- DELETE: apenas criador ou admin

---

### Triggers e auditoria

**Auditoria de exclusão de material:**
```sql
CREATE TABLE log_materiais_excluidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID,
  usuario_id UUID,
  data_exclusao TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_exclusao_material()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO log_materiais_excluidos(material_id, usuario_id, data_exclusao)
  VALUES (OLD.id, auth.uid(), now());
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_delete_material
AFTER DELETE ON repositorio_materiais
FOR EACH ROW EXECUTE FUNCTION log_exclusao_material();
```

**Auditoria de alterações em oportunidades:**
```sql
CREATE OR REPLACE FUNCTION registrar_historico_oportunidade()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO historico_oportunidade (oportunidade_id, usuario_id, campo_alterado, valor_antigo, valor_novo, data_alteracao)
  VALUES (NEW.id, auth.uid(), TG_ARGV[0], OLD.valor, NEW.valor, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
(Adaptar para cada campo relevante).

---

### Exemplos de queries críticas

**Buscar oportunidades do usuário autenticado:**
```sql
SELECT * FROM oportunidades
WHERE usuario_envio_id = auth.uid() OR usuario_recebe_id = auth.uid();
```
**Buscar materiais por empresa/categoria:**
```sql
SELECT * FROM repositorio_materiais
WHERE empresa_id = :empresaId AND categoria_id = :categoriaId;
```
**Logs de exclusão:**
```sql
SELECT * FROM log_materiais_excluidos
WHERE usuario_id = :userId
ORDER BY data_exclusao DESC;
```

---

## 3. Supabase Storage & Materiais

### Buckets, estrutura e versionamento

- **Bucket principal:** `materiais`
- Estrutura dos paths: `/empresaId/categoriaId/arquivo_nome.ext`
- Todos os uploads recebem prefixo do ID do material para garantir unicidade
- **Versionamento:**  
  - Nova versão = novo arquivo + registro em `repositorio_materiais` com campo de versão (opcional)
  - Histórico mantido por padrão (não sobrescreva arquivos no Storage)

---

### Policies de Storage

**Leitura pública (opcional):**
```sql
CREATE POLICY "Allow read for anon"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'materiais');
```
**Upload apenas autenticado:**
```sql
CREATE POLICY "Allow upload for authenticated"
ON storage.objects
FOR INSERT
TO authenticated
USING (bucket_id = 'materiais');
```
**Exclusão só pelo dono:**
```sql
CREATE POLICY "Allow delete for owner"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'materiais' AND auth.uid() = (SELECT usuario_upload FROM repositorio_materiais WHERE arquivo_upload = object_name));
```

---

### Fluxo completo de upload, preview, exclusão

**Upload:**
1. Usuário seleciona arquivo, empresa/categoria
2. Frontend chama `supabase.storage.from('materiais').upload(path, file)`
3. Backend registra metadata em `repositorio_materiais`
4. Policies garantem apenas uploads válidos, com controle de extensões/empresa/categoria

**Preview:**
- Para PDFs, imagens: renderização direta via Blob/URL Supabase (policies de SELECT).
- Para outros formatos: download ou visualização via app externo.

**Exclusão:**
1. Frontend solicita deleção (duplo check)
2. `supabase.storage.from('materiais').remove([path])`
3. Backend deleta registro em `repositorio_materiais`
4. Trigger de auditoria registra operação
5. Policies garantem que só o dono/admin pode excluir

**Exemplo de código (TypeScript):**
```typescript
const handleDeleteMaterial = async (materialId: string, path: string) => {
  const { error: storageError } = await supabase.storage.from('materiais').remove([path]);
  if (storageError) throw storageError;
  const { error: dbError } = await supabase.from('repositorio_materiais').delete().eq('id', materialId);
  if (dbError) throw dbError;
};
```

---

### Tratamento de arquivos, preview e troubleshooting

- **Falha no upload:** revise extensão, tamanho, policies de INSERT do bucket.
- **Preview não carrega:** verifique policy SELECT e formato do arquivo.
- **Exclusão não funciona:** revise policy de DELETE (bucket e RLS de `repositorio_materiais`), veja logs Supabase.
- **Histórico/versão sumiu:** consulte registros antigos no banco/Storage.

---

## 4. Auditoria, Logs e Versionamento

### Triggers e tabelas de auditoria

- **log_materiais_excluidos:** cada exclusão de arquivo e registro é logada (com material_id, usuario_id, data_exclusao).
- **historico_oportunidade:** toda alteração relevante em oportunidades é auditada, incluindo campo alterado, valor antigo/novo e responsável.

### Exemplo de logs e rastreabilidade

- **Consulta de exclusões:**
```sql
SELECT m.nome, l.data_exclusao, u.nome AS usuario
FROM log_materiais_excluidos l
JOIN repositorio_materiais m ON l.material_id = m.id
JOIN usuarios u ON l.usuario_id = u.id
ORDER BY l.data_exclusao DESC;
```
- **Auditoria de oportunidades:**
```sql
SELECT o.nome_lead, h.campo_alterado, h.valor_antigo, h.valor_novo, h.data_alteracao, u.nome
FROM historico_oportunidade h
JOIN oportunidades o ON h.oportunidade_id = o.id
JOIN usuarios u ON h.usuario_id = u.id
ORDER BY h.data_alteracao DESC;
```

### Backup, restore e dicas de expansão

- **Backup automático**: ativado em Supabase (banco e Storage).
- **Backup manual:** `pg_dump` para banco, download de buckets pelo dashboard.
- **Restore:** upload dos arquivos + restore via SQL.
- **Expansão:**  
  - Novas categorias/empresas = apenas novo registro em tabela.
  - Novos tipos de materiais = adicione extensões permitidas e ajuste policies.

---

## 5. FAQ e Troubleshooting de Dados

**Como restaurar arquivo deletado?**  
Não é possível nativamente. Mantenha backups regulares do bucket.

**Como auditar todas as exclusões?**  
Use triggers de log (`log_materiais_excluidos`), consulte exemplos de queries acima.

**Como liberar novos tipos de materiais?**  
Atualize validação frontend e policies do Storage para permitir novas extensões.

**Como criar novas policies?**  
Baseie-se nos exemplos e consulte a [documentação oficial do Supabase](https://supabase.com/docs/guides/auth/row-level-security).

**Como rastrear alterações em oportunidades?**  
Consulte `historico_oportunidade` via queries de auditoria.

**Como fazer backup completo?**  
Ative backup automático do Supabase e exporte periodicamente o bucket de Storage.

**Como garantir versionamento de arquivos críticos?**  
Implemente campo `versao`/`parent_id` em `repositorio_materiais` e nunca sobrescreva arquivos no Storage.

---

## 6. Referências Cruzadas e Integrações

- **Arquitetura, devops, integrações e padrões de código:** [README.sistema.md](./README.sistema.md)
- **Visão geral, onboarding, FAQ índice:** [README.md](./README.md)
- **Exemplos de integração e troubleshooting de banco/storage:** Este arquivo

---

> **Importante:**  
> Todo novo fluxo, policy, trigger, auditoria, expansão de tabela, alteração de storage ou processo de backup deve ser documentado imediatamente aqui, garantindo rastreabilidade total para qualquer manutenção futura.

---
