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
      admin_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_super_admin: boolean | null
          last_login: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_super_admin?: boolean | null
          last_login?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean | null
          last_login?: string | null
        }
        Relationships: []
      }
      banco_erros: {
        Row: {
          created_at: string | null
          id: string
          motivo: string | null
          questao_id: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          questao_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          questao_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banco_erros_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca: {
        Row: {
          autor: string | null
          created_at: string | null
          edicao: string | null
          id: string
          pdf_url: string | null
          tags: string[] | null
          titulo: string
          user_id: string | null
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          edicao?: string | null
          id?: string
          pdf_url?: string | null
          tags?: string[] | null
          titulo: string
          user_id?: string | null
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          edicao?: string | null
          id?: string
          pdf_url?: string | null
          tags?: string[] | null
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      codigo_civil: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string
          id?: number
          numero?: string | null
          tecnica?: string | null
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
          artigo: string | null
          exemplo: string | null
          formal: string
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      comment_reports: {
        Row: {
          comment_id: string | null
          id: string
          reason: string
          reported_at: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          comment_id?: string | null
          id?: string
          reason: string
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          comment_id?: string | null
          id?: string
          reason?: string
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_terms_acceptance: {
        Row: {
          accepted_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_best_tip: boolean
          likes: number
          parent_comment_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_best_tip?: boolean
          likes?: number
          parent_comment_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_best_tip?: boolean
          likes?: number
          parent_comment_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          best_tip_id: string | null
          community_type: string
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          likes: number
          tags: string[]
        }
        Insert: {
          author_id: string
          best_tip_id?: string | null
          community_type?: string
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          likes?: number
          tags?: string[]
        }
        Update: {
          author_id?: string
          best_tip_id?: string | null
          community_type?: string
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          likes?: number
          tags?: string[]
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
          artigo: string | null
          exemplo: string | null
          "explicacao formal": string | null
          "explicacao tecnica": string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          "explicacao formal"?: string | null
          "explicacao tecnica"?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          "explicacao formal"?: string | null
          "explicacao tecnica"?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      cronogramas: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          nome_cronograma: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          nome_cronograma: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          nome_cronograma?: string
          usuario_id?: string | null
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
      dados_base: {
        Row: {
          coluna_a: string | null
          coluna_b: string | null
          coluna_c: string | null
          coluna_d: string | null
          coluna_e: string | null
          coluna_f_pdf_url: string | null
          coluna_g_pdf_public_url: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          coluna_a?: string | null
          coluna_b?: string | null
          coluna_c?: string | null
          coluna_d?: string | null
          coluna_e?: string | null
          coluna_f_pdf_url?: string | null
          coluna_g_pdf_public_url?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          coluna_a?: string | null
          coluna_b?: string | null
          coluna_c?: string | null
          coluna_d?: string | null
          coluna_e?: string | null
          coluna_f_pdf_url?: string | null
          coluna_g_pdf_public_url?: string | null
          created_at?: string | null
          id?: string
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
      default_avatars: {
        Row: {
          created_at: string | null
          gender: string | null
          id: string
          skin_tone: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          gender?: string | null
          id?: string
          skin_tone?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          gender?: string | null
          id?: string
          skin_tone?: string | null
          url?: string
        }
        Relationships: []
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
      estatuto_da_advocacia_e_da_oab: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_cidade: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_crianca_e_do_adolescente: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_igualdade_racial: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_juventude: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_pessoa_com_deficiencia: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_terra: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_do_desarmamento: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_do_idoso: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_do_torcedor: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      flashcards_pro: {
        Row: {
          area: string
          artigos: string
          created_at: string | null
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          tema: string
        }
        Insert: {
          area: string
          artigos: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          tema: string
        }
        Update: {
          area?: string
          artigos?: string
          created_at?: string | null
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
      law_article_comments: {
        Row: {
          article_number: string
          content: string
          created_at: string | null
          id: string
          law_name: string
          likes: number | null
          tag: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_number: string
          content: string
          created_at?: string | null
          id?: string
          law_name: string
          likes?: number | null
          tag: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_number?: string
          content?: string
          created_at?: string | null
          id?: string
          law_name?: string
          likes?: number | null
          tag?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      law_flashcards: {
        Row: {
          answer: string
          article_content: string
          article_number: string
          created_at: string
          difficulty: string
          id: string
          law_name: string
          question: string
        }
        Insert: {
          answer: string
          article_content: string
          article_number: string
          created_at?: string
          difficulty?: string
          id?: string
          law_name: string
          question: string
        }
        Update: {
          answer?: string
          article_content?: string
          article_number?: string
          created_at?: string
          difficulty?: string
          id?: string
          law_name?: string
          question?: string
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
      legal_library: {
        Row: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          publication_date: string | null
          title: string
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          pdf_url: string
          publication_date?: string | null
          title: string
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          pdf_url?: string
          publication_date?: string | null
          title?: string
        }
        Relationships: []
      }
      legal_movies: {
        Row: {
          average_rating: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          director: string | null
          id: string
          poster_url: string
          rating_count: number | null
          title: string
          tmdb_poster_path: string | null
          year: number
          youtube_trailer_url: string | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          director?: string | null
          id?: string
          poster_url: string
          rating_count?: number | null
          title: string
          tmdb_poster_path?: string | null
          year: number
          youtube_trailer_url?: string | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          director?: string | null
          id?: string
          poster_url?: string
          rating_count?: number | null
          title?: string
          tmdb_poster_path?: string | null
          year?: number
          youtube_trailer_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_movies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "movie_categories"
            referencedColumns: ["id"]
          },
        ]
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
      mapas: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          no: string
          parent_id: string | null
          user_id: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          no: string
          parent_id?: string | null
          user_id?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          no?: string
          parent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mapas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mapas"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          from_user_id: string | null
          id: string
          read: boolean | null
          related_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          read?: boolean | null
          related_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          read?: boolean | null
          related_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          configuracoes: Json | null
          created_at: string | null
          email: string
          foto_perfil_url: string | null
          id: string
          nivel: number | null
          nome_completo: string
          progresso_estudo: number | null
          tipo_usuario: string | null
          updated_at: string | null
        }
        Insert: {
          configuracoes?: Json | null
          created_at?: string | null
          email: string
          foto_perfil_url?: string | null
          id: string
          nivel?: number | null
          nome_completo: string
          progresso_estudo?: number | null
          tipo_usuario?: string | null
          updated_at?: string | null
        }
        Update: {
          configuracoes?: Json | null
          created_at?: string | null
          email?: string
          foto_perfil_url?: string | null
          id?: string
          nivel?: number | null
          nome_completo?: string
          progresso_estudo?: number | null
          tipo_usuario?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      playlists: {
        Row: {
          created_at: string | null
          descricao: string | null
          disciplina: string
          id: string
          youtube_playlist_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          disciplina: string
          id?: string
          youtube_playlist_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          disciplina?: string
          id?: string
          youtube_playlist_id?: string
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
      questoes: {
        Row: {
          banca: string
          created_at: string | null
          disciplina: string
          explicacao: string | null
          id: string
          opcoes: string[]
          pergunta: string
          resposta_correta: string
        }
        Insert: {
          banca: string
          created_at?: string | null
          disciplina: string
          explicacao?: string | null
          id?: string
          opcoes: string[]
          pergunta: string
          resposta_correta: string
        }
        Update: {
          banca?: string
          created_at?: string | null
          disciplina?: string
          explicacao?: string | null
          id?: string
          opcoes?: string[]
          pergunta?: string
          resposta_correta?: string
        }
        Relationships: []
      }
      resumos: {
        Row: {
          created_at: string | null
          id: string
          ramo: string
          texto_resumo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ramo: string
          texto_resumo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ramo?: string
          texto_resumo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      simulado_questoes: {
        Row: {
          acertou: boolean | null
          created_at: string | null
          id: string
          questao_id: string | null
          resposta_usuario: string | null
          simulado_id: string | null
          tempo_resposta: number | null
        }
        Insert: {
          acertou?: boolean | null
          created_at?: string | null
          id?: string
          questao_id?: string | null
          resposta_usuario?: string | null
          simulado_id?: string | null
          tempo_resposta?: number | null
        }
        Update: {
          acertou?: boolean | null
          created_at?: string | null
          id?: string
          questao_id?: string | null
          resposta_usuario?: string | null
          simulado_id?: string | null
          tempo_resposta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulado_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulado_questoes_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
      }
      simulados: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          pontuacao_total: number | null
          status: string | null
          tempo_total: number | null
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pontuacao_total?: number | null
          status?: string | null
          tempo_total?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pontuacao_total?: number | null
          status?: string | null
          tempo_total?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          created_at: string
          data: Json
          error: string | null
          id: string
          status: string
          stripe_event_id: string
          type: string
          user_subscription_id: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          error?: string | null
          id?: string
          status?: string
          stripe_event_id: string
          type: string
          user_subscription_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          error?: string | null
          id?: string
          status?: string
          stripe_event_id?: string
          type?: string
          user_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_popular: boolean | null
          name: string
          price: number
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval: string
          is_popular?: boolean | null
          name: string
          price: number
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tarefas_cronograma: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          cronograma_id: string | null
          data: string
          descricao: string
          id: string
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          cronograma_id?: string | null
          data: string
          descricao: string
          id?: string
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          cronograma_id?: string | null
          data?: string
          descricao?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cronograma_cronograma_id_fkey"
            columns: ["cronograma_id"]
            isOneToOne: false
            referencedRelation: "cronogramas"
            referencedColumns: ["id"]
          },
        ]
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
      termos_dicionario: {
        Row: {
          area: string | null
          created_at: string
          exemplo: string | null
          id: number
          significado: string | null
          termo: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          significado?: string | null
          termo?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          significado?: string | null
          termo?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          id?: string
          points_awarded: number
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          admin_id: string | null
          banned_at: string | null
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          banned_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          banned_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          article_content: string
          article_number: string
          created_at: string
          example: string | null
          id: string
          law_name: string
          user_id: string
        }
        Insert: {
          article_content: string
          article_number: string
          created_at?: string
          example?: string | null
          id?: string
          law_name: string
          user_id: string
        }
        Update: {
          article_content?: string
          article_number?: string
          created_at?: string
          example?: string | null
          id?: string
          law_name?: string
          user_id?: string
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
          proficiency_level: number | null
          streak: number | null
          theme: string | null
          user_id: string
          viewed_count: number | null
        }
        Insert: {
          correct_count?: number | null
          created_at?: string
          flashcard_id: string
          id?: string
          last_viewed?: string | null
          proficiency_level?: number | null
          streak?: number | null
          theme?: string | null
          user_id: string
          viewed_count?: number | null
        }
        Update: {
          correct_count?: number | null
          created_at?: string
          flashcard_id?: string
          id?: string
          last_viewed?: string | null
          proficiency_level?: number | null
          streak?: number | null
          theme?: string | null
          user_id?: string
          viewed_count?: number | null
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          article_number: string
          content: string
          created_at: string
          id: string
          law_name: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_number: string
          content: string
          created_at?: string
          id?: string
          law_name: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_number?: string
          content?: string
          created_at?: string
          id?: string
          law_name?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_points: number | null
          avatar_url: string | null
          created_at: string
          default_avatar_id: string | null
          full_name: string | null
          id: string
          points: number | null
          rank_score: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          activity_points?: number | null
          avatar_url?: string | null
          created_at?: string
          default_avatar_id?: string | null
          full_name?: string | null
          id: string
          points?: number | null
          rank_score?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          activity_points?: number | null
          avatar_url?: string | null
          created_at?: string
          default_avatar_id?: string | null
          full_name?: string | null
          id?: string
          points?: number | null
          rank_score?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_default_avatar_id_fkey"
            columns: ["default_avatar_id"]
            isOneToOne: false
            referencedRelation: "default_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          duration: number | null
          id: string
          login_time: string | null
          logout_time: string | null
          user_id: string | null
        }
        Insert: {
          duration?: number | null
          id?: string
          login_time?: string | null
          logout_time?: string | null
          user_id?: string | null
        }
        Update: {
          duration?: number | null
          id?: string
          login_time?: string | null
          logout_time?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          profile_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          profile_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          action_type: string
          article_number: string | null
          created_at: string
          id: string
          law_name: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          article_number?: string | null
          created_at?: string
          id?: string
          law_name?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          article_number?: string | null
          created_at?: string
          id?: string
          law_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          flashcards_correct: number | null
          flashcards_viewed: number | null
          id: string
          started_at: string
          theme: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flashcards_correct?: number | null
          flashcards_viewed?: number | null
          id?: string
          started_at?: string
          theme?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flashcards_correct?: number | null
          flashcards_viewed?: number | null
          id?: string
          started_at?: string
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_theme_preferences: {
        Row: {
          created_at: string
          font_size: number | null
          id: string
          order_mode: string | null
          selected_themes: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_size?: number | null
          id?: string
          order_mode?: string | null
          selected_themes?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_size?: number | null
          id?: string
          order_mode?: string | null
          selected_themes?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_weekly_rankings: {
        Row: {
          id: string
          updated_at: string | null
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          id?: string
          updated_at?: string | null
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      user_rankings: {
        Row: {
          activity_points: number | null
          full_name: string | null
          global_rank: number | null
          id: string | null
          rank_score: number | null
          total_points: number | null
        }
        Relationships: []
      }
      user_weekly_activity: {
        Row: {
          action_count: number | null
          activity_day: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_achievement: {
        Args: {
          p_user_id: string
          p_achievement_type: string
          p_points: number
        }
        Returns: undefined
      }
      check_if_user_is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_user_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      fetch_all_legal_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          publication_date: string | null
          title: string
        }[]
      }
      fetch_legal_document_by_id: {
        Args: { document_id: string }
        Returns: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          publication_date: string | null
          title: string
        }[]
      }
      get_unique_themes: {
        Args: { table_name: string }
        Returns: {
          tema: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: { action_type: string; details: Json }
        Returns: string
      }
      reset_weekly_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_active_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
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
