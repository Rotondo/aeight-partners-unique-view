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
      onepager: {
        Row: {
          arquivo_upload: string | null
          categoria_id: string
          data_upload: string
          empresa_id: string
          id: string
          url_imagem: string | null
        }
        Insert: {
          arquivo_upload?: string | null
          categoria_id: string
          data_upload?: string
          empresa_id: string
          id?: string
          url_imagem?: string | null
        }
        Update: {
          arquivo_upload?: string | null
          categoria_id?: string
          data_upload?: string
          empresa_id?: string
          id?: string
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
          email: string
          empresa_id: string | null
          id: string
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          empresa_id?: string | null
          id: string
          nome: string
          papel?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      company_size: "PP" | "P" | "M" | "G" | "GG"
      company_type: "intragrupo" | "parceiro" | "cliente"
      opportunity_status:
        | "em_contato"
        | "negociando"
        | "ganho"
        | "perdido"
        | "Contato"
        | "Apresentado"
        | "Sem contato"
      tipo_empresa: "grupo" | "parceiro" | "cliente" | "intragrupo"
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
      opportunity_status: [
        "em_contato",
        "negociando",
        "ganho",
        "perdido",
        "Contato",
        "Apresentado",
        "Sem contato",
      ],
      tipo_empresa: ["grupo", "parceiro", "cliente", "intragrupo"],
      user_role: ["admin", "user", "manager"],
    },
  },
} as const
