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
      codigo_civil: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_defesa_consumidor: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_penal: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_processo_penal: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_transito: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_tributario: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      consolidacao_leis_trabalho: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      constituicao_federal: {
        Row: {
          conteudo: string | null
          created_at: string
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      custom_decks: {
        Row: {
          areas: string[] | null
          card_count: number | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          themes: string[] | null
        }
        Insert: {
          areas?: string[] | null
          card_count?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          themes?: string[] | null
        }
        Update: {
          areas?: string[] | null
          card_count?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          themes?: string[] | null
        }
        Relationships: []
      }
      deck_flashcards: {
        Row: {
          created_at: string
          deck_id: string | null
          flashcard_id: string
          id: string
        }
        Insert: {
          created_at?: string
          deck_id?: string | null
          flashcard_id: string
          id?: string
        }
        Update: {
          created_at?: string
          deck_id?: string | null
          flashcard_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "custom_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      direito_administrativo_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_ambiental_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_civil_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_constitucional_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_desportivo_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_do_trabalho_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_empresarial_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_financeiro_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_internacional_privado_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_penal_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_previndenciario_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_processual_civil_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_processual_do_trabalho_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_processual_penal_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_tributario_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_urbanistico_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direitos_humanos_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      flashcards_pro: {
        Row: {
          area: string
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          tema: string
        }
        Insert: {
          area: string
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          tema: string
        }
        Update: {
          area?: string
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          tema?: string
        }
        Relationships: []
      }
      formacao_complementar_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      iniciando_em_concursos_publicos_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      law_subject_areas: {
        Row: {
          display_name: string
          icon_name: string | null
          id: string
          table_name: string
        }
        Insert: {
          display_name: string
          icon_name?: string | null
          id: string
          table_name: string
        }
        Update: {
          display_name?: string
          icon_name?: string | null
          id?: string
          table_name?: string
        }
        Relationships: []
      }
      lei_penal_especial_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      politicas_publicas_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      portugues_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      pratica_profissional_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          correct_answers: number | null
          created_at: string | null
          flashcards_completed: number | null
          id: string
          last_active: string | null
          name: string | null
          streak_days: number | null
          total_answers: number | null
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string | null
          flashcards_completed?: number | null
          id: string
          last_active?: string | null
          name?: string | null
          streak_days?: number | null
          total_answers?: number | null
        }
        Update: {
          correct_answers?: number | null
          created_at?: string | null
          flashcards_completed?: number | null
          id?: string
          last_active?: string | null
          name?: string | null
          streak_days?: number | null
          total_answers?: number | null
        }
        Relationships: []
      }
      teoria_e_filosofia_do_direito_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_flashcard_progress: {
        Row: {
          correct_count: number | null
          created_at: string
          flashcard_id: string
          id: string
          last_viewed: string | null
          user_id: string
          viewed_count: number | null
        }
        Insert: {
          correct_count?: number | null
          created_at?: string
          flashcard_id: string
          id?: string
          last_viewed?: string | null
          user_id: string
          viewed_count?: number | null
        }
        Update: {
          correct_count?: number | null
          created_at?: string
          flashcard_id?: string
          id?: string
          last_viewed?: string | null
          user_id?: string
          viewed_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unique_themes: {
        Args: { table_name: string }
        Returns: {
          tema: string
        }[]
      }
    }
    Enums: {
      flashcard_area:
        | "constitucional"
        | "penal"
        | "civil"
        | "processual_civil"
        | "processual_penal"
        | "trabalho"
        | "tributario"
        | "administrativo"
        | "consumidor"
        | "ambiental"
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
      flashcard_area: [
        "constitucional",
        "penal",
        "civil",
        "processual_civil",
        "processual_penal",
        "trabalho",
        "tributario",
        "administrativo",
        "consumidor",
        "ambiental",
      ],
    },
  },
} as const
