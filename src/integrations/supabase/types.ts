export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      lootzy_accounts: {
        Row: {
          balance_cents: number
          created_at: string
          earned_cents: number
          first_name: string
          green: number
          last_name: string | null
          opened: number
          photo_url: string | null
          pink: number
          purple: number
          red: number
          subscribed_at: string | null
          telegram_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          earned_cents?: number
          first_name?: string
          green?: number
          last_name?: string | null
          opened?: number
          photo_url?: string | null
          pink?: number
          purple?: number
          red?: number
          subscribed_at?: string | null
          telegram_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          balance_cents?: number
          created_at?: string
          earned_cents?: number
          first_name?: string
          green?: number
          last_name?: string | null
          opened?: number
          photo_url?: string | null
          pink?: number
          purple?: number
          red?: number
          subscribed_at?: string | null
          telegram_id?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      lootzy_bonus_entries: {
        Row: {
          added_by: number
          created_at: string
          game_id: string
          pink_count: number
          rank: number | null
          telegram_id: number
        }
        Insert: {
          added_by: number
          created_at?: string
          game_id: string
          pink_count: number
          rank?: number | null
          telegram_id: number
        }
        Update: {
          added_by?: number
          created_at?: string
          game_id?: string
          pink_count?: number
          rank?: number | null
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lootzy_bonus_entries_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "lootzy_bonus_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lootzy_bonus_entries_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      lootzy_bonus_games: {
        Row: {
          drawn_at: string | null
          drawn_by: number | null
          id: string
        }
        Insert: {
          drawn_at?: string | null
          drawn_by?: number | null
          id?: string
        }
        Update: {
          drawn_at?: string | null
          drawn_by?: number | null
          id?: string
        }
        Relationships: []
      }
      lootzy_events: {
        Row: {
          actor_id: number | null
          amount_cents: number
          color: string | null
          created_at: string
          id: string
          kind: string
          quantity: number
          telegram_id: number
          verified: boolean
        }
        Insert: {
          actor_id?: number | null
          amount_cents?: number
          color?: string | null
          created_at?: string
          id: string
          kind: string
          quantity?: number
          telegram_id: number
          verified?: boolean
        }
        Update: {
          actor_id?: number | null
          amount_cents?: number
          color?: string | null
          created_at?: string
          id?: string
          kind?: string
          quantity?: number
          telegram_id?: number
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lootzy_events_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      lootzy_mining: {
        Row: {
          actor_id: number
          ends_at: string
          id: string
          paid_at: string | null
          payout_cents: number
          principal_uzs: number
          rate_uzs: number
          started_at: string
          telegram_id: number
        }
        Insert: {
          actor_id: number
          ends_at?: string
          id: string
          paid_at?: string | null
          payout_cents: number
          principal_uzs: number
          rate_uzs: number
          started_at?: string
          telegram_id: number
        }
        Update: {
          actor_id?: number
          ends_at?: string
          id?: string
          paid_at?: string | null
          payout_cents?: number
          principal_uzs?: number
          rate_uzs?: number
          started_at?: string
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lootzy_mining_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      lootzy_referrals: {
        Row: {
          confirmed_at: string | null
          created_at: string
          referred_id: number
          referrer_id: number
          status: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          referred_id: number
          referrer_id: number
          status?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          referred_id?: number
          referrer_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lootzy_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "lootzy_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      lootzy_roles: {
        Row: {
          role: string
          telegram_id: number
        }
        Insert: {
          role: string
          telegram_id: number
        }
        Update: {
          role?: string
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lootzy_roles_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      lootzy_withdrawals: {
        Row: {
          amount_cents: number
          created_at: string
          created_by_admin: boolean
          decided_by: number | null
          destination: string
          due_at: string | null
          id: string
          method: string
          queue_number: number | null
          queue_started_at: string | null
          status: string
          telegram_id: number
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by_admin?: boolean
          decided_by?: number | null
          destination: string
          due_at?: string | null
          id: string
          method: string
          queue_number?: number | null
          queue_started_at?: string | null
          status?: string
          telegram_id: number
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by_admin?: boolean
          decided_by?: number | null
          destination?: string
          due_at?: string | null
          id?: string
          method?: string
          queue_number?: number | null
          queue_started_at?: string | null
          status?: string
          telegram_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lootzy_withdrawals_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "lootzy_accounts"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      lootzy_admin_withdraw: {
        Args: {
          p_action: string
          p_actor: number
          p_amount: number
          p_destination: string
          p_id: string
          p_method: string
          p_status: string
          p_target: number
        }
        Returns: Json
      }
      lootzy_bonus_manage: {
        Args: {
          p_action: string
          p_actor: number
          p_quantity?: number
          p_target?: number
        }
        Returns: Json
      }
      lootzy_bonus_nov09_manage: {
        Args: {
          p_action: string
          p_actor: number
          p_quantity?: number
          p_target?: number
        }
        Returns: Json
      }
      lootzy_bot_start: {
        Args: {
          p_first: string
          p_id: number
          p_last: string
          p_referrer?: number
          p_username: string
        }
        Returns: Json
      }
      lootzy_confirm_subscription: { Args: { p_id: number }; Returns: Json }
      lootzy_mining_settle: { Args: { p_target?: number }; Returns: number }
      lootzy_mining_start: {
        Args: {
          p_actor: number
          p_id: string
          p_principal: number
          p_rate: number
          p_target: number
        }
        Returns: Json
      }
      lootzy_mutate: {
        Args: {
          p_action: string
          p_actor: number
          p_amount?: number
          p_color?: string
          p_destination?: string
          p_id: string
          p_method?: string
          p_quantity?: number
          p_status?: string
          p_target?: number
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
