# Sistema Wishlist - Documentação Técnica

## 🔄 Fluxo de Reciprocidade Guiada

### Visão Geral
O sistema agora implementa um fluxo guiado de reciprocidade que permite aos usuários selecionar clientes em duas etapas distintas, garantindo transparência e controle total sobre as trocas entre empresas parceiras.

### Fluxo de Solicitação com Reciprocidade

#### Etapa 1: Seleção de Empresas
- Seleção da empresa solicitante
- Seleção da empresa demandada
- Validação de empresas diferentes

#### Etapa 2: Seleção de Clientes (Direção Principal)
- Carregamento automático dos clientes da empresa demandada
- Seleção múltipla com definição de prioridades
- Interface intuitiva com ComponenteMultiSelect

#### Etapa 3: Detalhes da Solicitação
- Definição do motivo da solicitação
- Observações opcionais
- **Checkbox de reciprocidade** - quando marcado, ativa o fluxo guiado

#### Etapa 4: Seleção de Clientes para Reciprocidade (Condicional)
**Esta etapa só aparece se reciprocidade foi solicitada**
- Carregamento automático dos clientes da empresa solicitante
- Seleção independente com prioridades próprias
- Interface clara indicando a direção da troca
- Validação obrigatória de pelo menos um cliente

#### Etapa 5: Preview Duplo
- **Direção Principal**: Lista de clientes solicitados com prioridades
- **Direção Recíproca**: Lista de clientes oferecidos em troca (se aplicável)
- Resumo completo antes da confirmação final
- Botão de confirmação só ativo após validações

### 🤖 Integração Automática com CRM

#### Criação de Ação CRM
Ao finalizar uma solicitação (com ou sem reciprocidade), o sistema automaticamente:

1. **Identifica a empresa parceira** para o campo `partner_id`
2. **Gera descrição padronizada**: "Solicitação de Wishlist concluída entre [Empresa A] e [Empresa B]"
3. **Cria conteúdo detalhado** listando:
   - Direção principal: empresa → empresa (X clientes)
   - Direção recíproca: empresa → empresa (Y clientes) [se aplicável]
   - Clientes com suas respectivas prioridades
   - Motivo e observações
4. **Define parâmetros técnicos**:
   - `communication_method`: "outro"
   - `status`: "concluida"
   - `user_id`: usuário autenticado
   - `partner_id`: sempre a empresa parceira (não intragrupo)

#### Estrutura de Metadata
```json
{
  "wishlist_request": true,
  "empresa_solicitante_id": "uuid",
  "empresa_demandada_id": "uuid", 
  "reciprocidade": true/false,
  "clientes_solicitados": [
    {"id": "uuid", "nome": "string", "prioridade": number}
  ],
  "clientes_reciprocidade": [
    {"id": "uuid", "nome": "string", "prioridade": number}
  ],
  "total_solicitacoes": number
}
```

### 🎯 Regras de Negócio

#### Validações do Fluxo
1. **Empresas diferentes**: Solicitante e demandada devem ser distintas
2. **Seleção obrigatória**: Pelo menos um cliente em cada direção ativa
3. **Reciprocidade completa**: Se marcada, ambas as direções devem ter clientes
4. **Partner ID**: Sempre identifica a empresa externa (tipo "parceiro")

#### Estados do Sistema
- **Carregamento**: Indicadores visuais durante operações assíncronas
- **Validação**: Feedback imediato sobre erros de entrada
- **Progresso**: Indicador de etapas com números dinâmicos
- **Confirmação**: Preview completo antes de executar

### 🔄 Sincronização de Estados

#### Gestão de Estado Local
- **Estados condicionais**: Steps aparecem baseados na seleção de reciprocidade
- **Limpeza automática**: Reset completo ao fechar modal
- **Validação reativa**: Botões habilitados conforme validações
- **Feedback visual**: Indicadores de progresso e erros

#### Integração com Contextos
- **WishlistContext**: Criação e atualização de itens
- **CrmContext**: Integração automática com CRM
- **AuthContext**: Identificação do usuário para logs

## 📊 Métricas e Análise

### Tracking de Operações
Cada operação de wishlist gera registros completos permitindo análise de:
- Volume de solicitações por período
- Taxa de reciprocidade
- Empresas mais ativas
- Clientes mais solicitados
- Performance do networking

### Relatórios CRM
Os registros automáticos no CRM permitem:
- Dashboard de atividades de networking
- Análise de ROI das parcerias
- Histórico completo de trocas
- Identificação de padrões

## 🔧 Implementação Técnica

### Componentes Envolvidos
- `WishlistSolicitacaoModal.tsx`: Fluxo principal
- `ClienteMultiSelect.tsx`: Seleção de clientes
- `CrmService.ts`: Integração com CRM
- `WishlistContext.tsx`: Gestão de estado

### Dependências
- Supabase: Persistência de dados
- React Hook Form: Validações
- Context API: Gestão de estado global
- TypeScript: Tipagem forte

### Performance
- Carregamento lazy de clientes
- Debounce em buscas
- Cache de empresas
- Validações client-side

## 🚀 Próximos Passos

### Melhorias Planejadas
- [ ] Histórico de reciprocidades por empresa
- [ ] Sugestões inteligentes de clientes
- [ ] Templates de motivos pré-definidos
- [ ] Notificações push para solicitações
- [ ] Analytics avançadas de networking

### Otimizações
- [ ] Paginação para listas grandes
- [ ] Search server-side
- [ ] Cache inteligente de clientes
- [ ] Bulk operations para múltiplas empresas