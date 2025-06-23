export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atividades_oportunidade: {
        Row: {
          concluida: boolean
          created_at: string
          data_prevista: string
          data_realizada: string | null
          descricao: string | null
          id: string
          oportunidade_id: string
          titulo: string
          updated_at: string
          usuario_responsavel_id: string | null
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_prevista: string
          data_realizada?: string | null
          descricao?: string | null
          id?: string
          oportunidade_id: string
          titulo: string
          updated_at?: string
          usuario_responsavel_id?: string | null
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_prevista?: string
          data_realizada?: string | null
          descricao?: string | null
          id?: string
          oportunidade_id?: string
          titulo?: string
          updated_at?: string
          usuario_responsavel_id?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          created_at: string
          email: string | null
          empresa_id: string
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa_id: string
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_evento: {
        Row: {
          cargo: string | null
          created_at: string | null
          data_contato: string | null
          discussao: string | null
          email: string | null
          empresa: string | null
          evento_id: string
          foto_cartao: string | null
          id: string
          interesse_nivel: number | null
          nome: string | null
          observacoes: string | null
          proximos_passos: string | null
          sugestao_followup: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          data_contato?: string | null
          discussao?: string | null
          email?: string | null
          empresa?: string | null
          evento_id: string
          foto_cartao?: string | null
          id?: string
          interesse_nivel?: number | null
          nome?: string | null
          observacoes?: string | null
          proximos_passos?: string | null
          sugestao_followup?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          data_contato?: string | null
          discussao?: string | null
          email?: string | null
          empresa?: string | null
          evento_id?: string
          foto_cartao?: string | null
          id?: string
          interesse_nivel?: number | null
          nome?: string | null
          observacoes?: string | null
          proximos_passos?: string | null
          sugestao_followup?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_evento_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_agenda_eventos: {
        Row: {
          created_at: string
          description: string | null
          end: string
          event_type: string | null
          external_id: string | null
          id: string
          partner_id: string | null
          related_crm_action_id: string | null
          source: string
          start: string
          status: Database["public"]["Enums"]["diario_event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end: string
          event_type?: string | null
          external_id?: string | null
          id?: string
          partner_id?: string | null
          related_crm_action_id?: string | null
          source: string
          start: string
          status?: Database["public"]["Enums"]["diario_event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end?: string
          event_type?: string | null
          external_id?: string | null
          id?: string
          partner_id?: string | null
          related_crm_action_id?: string | null
          source?: string
          start?: string
          status?: Database["public"]["Enums"]["diario_event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_crm_action"
            columns: ["related_crm_action_id"]
            isOneToOne: false
            referencedRelation: "diario_crm_acoes"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_crm_acoes: {
        Row: {
          communication_method:
            | Database["public"]["Enums"]["metodo_comunicacao"]
            | null
          content: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          next_step_date: string | null
          next_steps: string | null
          partner_id: string | null
          status: Database["public"]["Enums"]["status_acao_crm_enum"]
          type: Database["public"]["Enums"]["crm_action_type"]
          user_id: string
        }
        Insert: {
          communication_method?:
            | Database["public"]["Enums"]["metodo_comunicacao"]
            | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          next_step_date?: string | null
          next_steps?: string | null
          partner_id?: string | null
          status?: Database["public"]["Enums"]["status_acao_crm_enum"]
          type: Database["public"]["Enums"]["crm_action_type"]
          user_id: string
        }
        Update: {
          communication_method?:
            | Database["public"]["Enums"]["metodo_comunicacao"]
            | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          next_step_date?: string | null
          next_steps?: string | null
          partner_id?: string | null
          status?: Database["public"]["Enums"]["status_acao_crm_enum"]
          type?: Database["public"]["Enums"]["crm_action_type"]
          user_id?: string
        }
        Relationships: []
      }
      diario_ia_sugestoes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          field: string
          id: string
          status: Database["public"]["Enums"]["ia_suggestion_status"]
          suggestion: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          field: string
          id?: string
          status?: Database["public"]["Enums"]["ia_suggestion_status"]
          suggestion: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          field?: string
          id?: string
          status?: Database["public"]["Enums"]["ia_suggestion_status"]
          suggestion?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      diario_resumos: {
        Row: {
          content: string | null
          export_url: string | null
          generated_at: string
          id: string
          period: Database["public"]["Enums"]["diario_period"]
        }
        Insert: {
          content?: string | null
          export_url?: string | null
          generated_at?: string
          id?: string
          period: Database["public"]["Enums"]["diario_period"]
        }
        Update: {
          content?: string | null
          export_url?: string | null
          generated_at?: string
          id?: string
          period?: Database["public"]["Enums"]["diario_period"]
        }
        Relationships: []
      }
      empresa_categoria: {
        Row: {
          categoria_id: string
          created_at: string
          empresa_id: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          empresa_id: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          empresa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_categoria_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_categoria_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_clientes: {
        Row: {
          created_at: string
          data_relacionamento: string
          empresa_cliente_id: string
          empresa_proprietaria_id: string
          id: string
          observacoes: string | null
          status: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_relacionamento?: string
          empresa_cliente_id: string
          empresa_proprietaria_id: string
          id?: string
          observacoes?: string | null
          status?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_relacionamento?: string
          empresa_cliente_id?: string
          empresa_proprietaria_id?: string
          id?: string
          observacoes?: string | null
          status?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_clientes_empresa_cliente_id_fkey"
            columns: ["empresa_cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_clientes_empresa_proprietaria_id_fkey"
            columns: ["empresa_proprietaria_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          status: boolean
          tipo: Database["public"]["Enums"]["company_type"]
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          status?: boolean
          tipo: Database["public"]["Enums"]["company_type"]
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          status?: boolean
          tipo?: Database["public"]["Enums"]["company_type"]
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          local: string | null
          nome: string
          status: string | null
          updated_at: string | null
          usuario_responsavel_id: string
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          local?: string | null
          nome: string
          status?: string | null
          updated_at?: string | null
          usuario_responsavel_id: string
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          local?: string | null
          nome?: string
          status?: string | null
          updated_at?: string | null
          usuario_responsavel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_usuario_responsavel_id_fkey"
            columns: ["usuario_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_oportunidade: {
        Row: {
          campo_alterado: string
          data_alteracao: string
          id: string
          oportunidade_id: string
          usuario_id: string
          valor_antigo: string | null
          valor_novo: string | null
        }
        Insert: {
          campo_alterado: string
          data_alteracao?: string
          id?: string
          oportunidade_id: string
          usuario_id: string
          valor_antigo?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo_alterado?: string
          data_alteracao?: string
          id?: string
          oportunidade_id?: string
          usuario_id?: string
          valor_antigo?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_oportunidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      indicadores_parceiro: {
        Row: {
          alinhamento: number
          base_clientes: number | null
          data_avaliacao: string
          empresa_id: string
          engajamento: number
          id: string
          potencial_investimento: number
          potencial_leads: number
          score_x: number | null
          score_y: number | null
          tamanho: Database["public"]["Enums"]["company_size"]
        }
        Insert: {
          alinhamento: number
          base_clientes?: number | null
          data_avaliacao?: string
          empresa_id: string
          engajamento: number
          id?: string
          potencial_investimento: number
          potencial_leads: number
          score_x?: number | null
          score_y?: number | null
          tamanho: Database["public"]["Enums"]["company_size"]
        }
        Update: {
          alinhamento?: number
          base_clientes?: number | null
          data_avaliacao?: string
          empresa_id?: string
          engajamento?: number
          id?: string
          potencial_investimento?: number
          potencial_leads?: number
          score_x?: number | null
          score_y?: number | null
          tamanho?: Database["public"]["Enums"]["company_size"]
        }
        Relationships: [
          {
            foreignKeyName: "indicadores_parceiro_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_oportunidades: {
        Row: {
          ano: number
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          mes: number | null
          nome: string
          periodo: string | null
          segmento_grupo: string | null
          status_oportunidade: string | null
          tipo_meta: string | null
          trimestre: number | null
          updated_at: string | null
          usuario_criador_id: string | null
          valor_meta: number
        }
        Insert: {
          ano: number
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          mes?: number | null
          nome: string
          periodo?: string | null
          segmento_grupo?: string | null
          status_oportunidade?: string | null
          tipo_meta?: string | null
          trimestre?: number | null
          updated_at?: string | null
          usuario_criador_id?: string | null
          valor_meta: number
        }
        Update: {
          ano?: number
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          mes?: number | null
          nome?: string
          periodo?: string | null
          segmento_grupo?: string | null
          status_oportunidade?: string | null
          tipo_meta?: string | null
          trimestre?: number | null
          updated_at?: string | null
          usuario_criador_id?: string | null
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_oportunidades_usuario_criador_id_fkey"
            columns: ["usuario_criador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      onepager: {
        Row: {
          arquivo_upload: string | null
          big_numbers: string | null
          cases_sucesso: string | null
          categoria_id: string
          contato_email: string | null
          contato_nome: string | null
          contato_telefone: string | null
          data_upload: string
          diferenciais: string | null
          empresa_id: string
          icp: string | null
          id: string
          nome: string | null
          nota_quadrante: number | null
          oferta: string | null
          ponto_forte: string | null
          ponto_fraco: string | null
          url: string | null
          url_imagem: string | null
        }
        Insert: {
          arquivo_upload?: string | null
          big_numbers?: string | null
          cases_sucesso?: string | null
          categoria_id: string
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          data_upload?: string
          diferenciais?: string | null
          empresa_id: string
          icp?: string | null
          id?: string
          nome?: string | null
          nota_quadrante?: number | null
          oferta?: string | null
          ponto_forte?: string | null
          ponto_fraco?: string | null
          url?: string | null
          url_imagem?: string | null
        }
        Update: {
          arquivo_upload?: string | null
          big_numbers?: string | null
          cases_sucesso?: string | null
          categoria_id?: string
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          data_upload?: string
          diferenciais?: string | null
          empresa_id?: string
          icp?: string | null
          id?: string
          nome?: string | null
          nota_quadrante?: number | null
          oferta?: string | null
          ponto_forte?: string | null
          ponto_fraco?: string | null
          url?: string | null
          url_imagem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onepager_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onepager_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      onepager_clientes: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          onepager_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          onepager_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          onepager_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onepager_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onepager_clientes_onepager_id_fkey"
            columns: ["onepager_id"]
            isOneToOne: false
            referencedRelation: "onepager"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          contato_id: string | null
          created_at: string
          data_fechamento: string | null
          data_indicacao: string
          empresa_destino_id: string
          empresa_origem_id: string
          id: string
          motivo_perda: string | null
          nome_lead: string
          observacoes: string | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          usuario_envio_id: string | null
          usuario_recebe_id: string | null
          valor: number | null
        }
        Insert: {
          contato_id?: string | null
          created_at?: string
          data_fechamento?: string | null
          data_indicacao?: string
          empresa_destino_id: string
          empresa_origem_id: string
          id?: string
          motivo_perda?: string | null
          nome_lead: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          usuario_envio_id?: string | null
          usuario_recebe_id?: string | null
          valor?: number | null
        }
        Update: {
          contato_id?: string | null
          created_at?: string
          data_fechamento?: string | null
          data_indicacao?: string
          empresa_destino_id?: string
          empresa_origem_id?: string
          id?: string
          motivo_perda?: string | null
          nome_lead?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          usuario_envio_id?: string | null
          usuario_recebe_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_destino_id_fkey"
            columns: ["empresa_destino_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_origem_id_fkey"
            columns: ["empresa_origem_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_usuario_envio_id_fkey"
            columns: ["usuario_envio_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_usuario_recebe_id_fkey"
            columns: ["usuario_recebe_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      repositorio_materiais: {
        Row: {
          arquivo_upload: string | null
          categoria_id: string
          data_upload: string
          empresa_id: string
          id: string
          nome: string
          tag_categoria: string[] | null
          tipo_arquivo: string
          url_arquivo: string | null
          usuario_upload: string
          validade_contrato: string | null
        }
        Insert: {
          arquivo_upload?: string | null
          categoria_id: string
          data_upload?: string
          empresa_id: string
          id?: string
          nome: string
          tag_categoria?: string[] | null
          tipo_arquivo: string
          url_arquivo?: string | null
          usuario_upload: string
          validade_contrato?: string | null
        }
        Update: {
          arquivo_upload?: string | null
          categoria_id?: string
          data_upload?: string
          empresa_id?: string
          id?: string
          nome?: string
          tag_categoria?: string[] | null
          tipo_arquivo?: string
          url_arquivo?: string | null
          usuario_upload?: string
          validade_contrato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_categoria"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_empresa"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      repositorio_tags: {
        Row: {
          cor: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          cor?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          cor?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      share_icp: {
        Row: {
          created_at: string
          empresa_id: string
          icp_alinhado: boolean | null
          id: string
          observacoes: string | null
          share_of_wallet: number | null
        }
        Insert: {
          created_at?: string
          empresa_id: string
          icp_alinhado?: boolean | null
          id?: string
          observacoes?: string | null
          share_of_wallet?: number | null
        }
        Update: {
          created_at?: string
          empresa_id?: string
          icp_alinhado?: boolean | null
          id?: string
          observacoes?: string | null
          share_of_wallet?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "share_icp_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          empresa_id: string | null
          id: string
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id: string
          nome: string
          papel?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_apresentacoes: {
        Row: {
          converteu_oportunidade: boolean | null
          created_at: string
          data_apresentacao: string
          empresa_facilitadora_id: string
          feedback: string | null
          id: string
          oportunidade_id: string | null
          status_apresentacao: string | null
          tipo_apresentacao: string | null
          tipo_solicitacao: string | null
          updated_at: string
          wishlist_item_id: string
        }
        Insert: {
          converteu_oportunidade?: boolean | null
          created_at?: string
          data_apresentacao?: string
          empresa_facilitadora_id: string
          feedback?: string | null
          id?: string
          oportunidade_id?: string | null
          status_apresentacao?: string | null
          tipo_apresentacao?: string | null
          tipo_solicitacao?: string | null
          updated_at?: string
          wishlist_item_id: string
        }
        Update: {
          converteu_oportunidade?: boolean | null
          created_at?: string
          data_apresentacao?: string
          empresa_facilitadora_id?: string
          feedback?: string | null
          id?: string
          oportunidade_id?: string | null
          status_apresentacao?: string | null
          tipo_apresentacao?: string | null
          tipo_solicitacao?: string | null
          updated_at?: string
          wishlist_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_apresentacoes_empresa_facilitadora_id_fkey"
            columns: ["empresa_facilitadora_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_apresentacoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_apresentacoes_wishlist_item_id_fkey"
            columns: ["wishlist_item_id"]
            isOneToOne: false
            referencedRelation: "wishlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          data_resposta: string | null
          data_solicitacao: string
          empresa_desejada_id: string
          empresa_interessada_id: string
          empresa_proprietaria_id: string
          id: string
          motivo: string | null
          observacoes: string | null
          prioridade: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_resposta?: string | null
          data_solicitacao?: string
          empresa_desejada_id: string
          empresa_interessada_id: string
          empresa_proprietaria_id: string
          id?: string
          motivo?: string | null
          observacoes?: string | null
          prioridade?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_resposta?: string | null
          data_solicitacao?: string
          empresa_desejada_id?: string
          empresa_interessada_id?: string
          empresa_proprietaria_id?: string
          id?: string
          motivo?: string | null
          observacoes?: string | null
          prioridade?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_empresa_desejada_id_fkey"
            columns: ["empresa_desejada_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_empresa_interessada_id_fkey"
            columns: ["empresa_interessada_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_empresa_proprietaria_id_fkey"
            columns: ["empresa_proprietaria_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_oportunidade: {
        Args: { oportunidade_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_belongs_to_empresa: {
        Args: { empresa_id: string }
        Returns: boolean
      }
    }
    Enums: {
      company_size: "PP" | "P" | "M" | "G" | "GG"
      company_type: "intragrupo" | "parceiro" | "cliente"
      crm_action_type: "audio" | "video" | "text"
      diario_event_status: "scheduled" | "synced" | "completed" | "canceled"
      diario_period: "week" | "month" | "quarter"
      fonte_integracao: "manual" | "google" | "outlook"
      ia_suggestion_status: "pending" | "approved" | "rejected" | "edited"
      metodo_comunicacao:
        | "whatsapp"
        | "ligacao"
        | "email"
        | "encontro"
        | "reuniao_meet"
      opportunity_status:
        | "em_contato"
        | "negociando"
        | "ganho"
        | "perdido"
        | "Contato"
        | "Apresentado"
        | "Sem contato"
        | "proposta_enviada"
        | "aguardando_aprovacao"
      status_acao_crm: "pendente" | "em_andamento" | "concluida" | "cancelada"
      status_acao_crm_enum:
        | "pendente"
        | "em_andamento"
        | "concluida"
        | "cancelada"
      status_evento: "agendado" | "realizado" | "cancelado" | "reagendado"
      status_sugestao_ia: "pendente" | "em_revisao" | "aprovada" | "rejeitada"
      tipo_acao_crm: "audio" | "video" | "texto"
      tipo_empresa: "grupo" | "parceiro" | "cliente" | "intragrupo"
      tipo_evento_agenda:
        | "reuniao"
        | "call"
        | "apresentacao"
        | "follow_up"
        | "outro"
      tipo_resumo: "semanal" | "mensal" | "trimestral"
      user_role: "admin" | "user" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_size: ["PP", "P", "M", "G", "GG"],
      company_type: ["intragrupo", "parceiro", "cliente"],
      crm_action_type: ["audio", "video", "text"],
      diario_event_status: ["scheduled", "synced", "completed", "canceled"],
      diario_period: ["week", "month", "quarter"],
      fonte_integracao: ["manual", "google", "outlook"],
      ia_suggestion_status: ["pending", "approved", "rejected", "edited"],
      metodo_comunicacao: [
        "whatsapp",
        "ligacao",
        "email",
        "encontro",
        "reuniao_meet",
      ],
      opportunity_status: [
        "em_contato",
        "negociando",
        "ganho",
        "perdido",
        "Contato",
        "Apresentado",
        "Sem contato",
        "proposta_enviada",
        "aguardando_aprovacao",
      ],
      status_acao_crm: ["pendente", "em_andamento", "concluida", "cancelada"],
      status_acao_crm_enum: [
        "pendente",
        "em_andamento",
        "concluida",
        "cancelada",
      ],
      status_evento: ["agendado", "realizado", "cancelado", "reagendado"],
      status_sugestao_ia: ["pendente", "em_revisao", "aprovada", "rejeitada"],
      tipo_acao_crm: ["audio", "video", "texto"],
      tipo_empresa: ["grupo", "parceiro", "cliente", "intragrupo"],
      tipo_evento_agenda: [
        "reuniao",
        "call",
        "apresentacao",
        "follow_up",
        "outro",
      ],
      tipo_resumo: ["semanal", "mensal", "trimestral"],
      user_role: ["admin", "user", "manager"],
    },
  },
} as const
