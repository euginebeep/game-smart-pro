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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accumulator_tracking: {
        Row: {
          accumulator_type: string
          actual_return: number | null
          bets: Json
          calculated_chance: number | null
          checked_at: string | null
          created_at: string | null
          date_of_matches: string
          id: string
          result: string | null
          risk_level: string
          shown_chance: number
          suggested_stake: number | null
          total_odd: number
          user_id: string | null
        }
        Insert: {
          accumulator_type: string
          actual_return?: number | null
          bets: Json
          calculated_chance?: number | null
          checked_at?: string | null
          created_at?: string | null
          date_of_matches: string
          id?: string
          result?: string | null
          risk_level: string
          shown_chance: number
          suggested_stake?: number | null
          total_odd: number
          user_id?: string | null
        }
        Update: {
          accumulator_type?: string
          actual_return?: number | null
          bets?: Json
          calculated_chance?: number | null
          checked_at?: string | null
          created_at?: string | null
          date_of_matches?: string
          id?: string
          result?: string | null
          risk_level?: string
          shown_chance?: number
          suggested_stake?: number | null
          total_odd?: number
          user_id?: string | null
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          last_active_at: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      backtest_results: {
        Row: {
          best_bet_type: string | null
          breakdown_by_league: Json | null
          breakdown_by_type: Json | null
          created_at: string
          date_from: string
          date_to: string
          executed_by: string | null
          hit_rate: number
          id: string
          league_ids: number[] | null
          min_confidence: number
          min_value_percentage: number | null
          total_fixtures: number
          total_hits: number
          total_misses: number
          total_recommendations: number
          total_roi: number
          total_skips: number
          worst_bet_type: string | null
          yield_per_bet: number
        }
        Insert: {
          best_bet_type?: string | null
          breakdown_by_league?: Json | null
          breakdown_by_type?: Json | null
          created_at?: string
          date_from: string
          date_to: string
          executed_by?: string | null
          hit_rate: number
          id?: string
          league_ids?: number[] | null
          min_confidence?: number
          min_value_percentage?: number | null
          total_fixtures: number
          total_hits: number
          total_misses: number
          total_recommendations: number
          total_roi: number
          total_skips: number
          worst_bet_type?: string | null
          yield_per_bet: number
        }
        Update: {
          best_bet_type?: string | null
          breakdown_by_league?: Json | null
          breakdown_by_type?: Json | null
          created_at?: string
          date_from?: string
          date_to?: string
          executed_by?: string | null
          hit_rate?: number
          id?: string
          league_ids?: number[] | null
          min_confidence?: number
          min_value_percentage?: number | null
          total_fixtures?: number
          total_hits?: number
          total_misses?: number
          total_recommendations?: number
          total_roi?: number
          total_skips?: number
          worst_bet_type?: string | null
          yield_per_bet?: number
        }
        Relationships: []
      }
      bet_tracking: {
        Row: {
          actual_score: string | null
          away_team: string
          bet_label: string
          bet_type: string
          checked_at: string | null
          confidence: number
          created_at: string | null
          estimated_probability: number
          fixture_id: string
          home_team: string
          id: string
          implied_probability: number
          league: string
          match_date: string
          odd: number
          result: string | null
          value_edge: number
          was_skip: boolean | null
        }
        Insert: {
          actual_score?: string | null
          away_team: string
          bet_label: string
          bet_type: string
          checked_at?: string | null
          confidence: number
          created_at?: string | null
          estimated_probability: number
          fixture_id: string
          home_team: string
          id?: string
          implied_probability: number
          league: string
          match_date: string
          odd: number
          result?: string | null
          value_edge: number
          was_skip?: boolean | null
        }
        Update: {
          actual_score?: string | null
          away_team?: string
          bet_label?: string
          bet_type?: string
          checked_at?: string | null
          confidence?: number
          created_at?: string | null
          estimated_probability?: number
          fixture_id?: string
          home_team?: string
          id?: string
          implied_probability?: number
          league?: string
          match_date?: string
          odd?: number
          result?: string | null
          value_edge?: number
          was_skip?: boolean | null
        }
        Relationships: []
      }
      daily_searches: {
        Row: {
          created_at: string
          id: string
          search_count: number
          search_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          search_count?: number
          search_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          search_count?: number
          search_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      historical_recommendations: {
        Row: {
          actual_away_goals: number | null
          actual_btts: boolean | null
          actual_home_goals: number | null
          actual_outcome: string | null
          actual_over25: boolean | null
          away_team: string
          away_team_id: number | null
          confidence_score: number
          created_at: string
          estimated_probability: number | null
          factors_used: Json | null
          fixture_id: number
          hit: boolean | null
          home_team: string
          home_team_id: number | null
          id: string
          implied_probability: number | null
          is_simulated: boolean
          league_id: number
          league_name: string
          match_date: string
          odds_away: number
          odds_draw: number
          odds_home: number
          odds_over: number | null
          odds_under: number | null
          recommendation_type: string
          roi_unit: number | null
          season: number
          updated_at: string
          value_percentage: number | null
          weights_used: Json | null
        }
        Insert: {
          actual_away_goals?: number | null
          actual_btts?: boolean | null
          actual_home_goals?: number | null
          actual_outcome?: string | null
          actual_over25?: boolean | null
          away_team: string
          away_team_id?: number | null
          confidence_score: number
          created_at?: string
          estimated_probability?: number | null
          factors_used?: Json | null
          fixture_id: number
          hit?: boolean | null
          home_team: string
          home_team_id?: number | null
          id?: string
          implied_probability?: number | null
          is_simulated?: boolean
          league_id: number
          league_name: string
          match_date: string
          odds_away: number
          odds_draw: number
          odds_home: number
          odds_over?: number | null
          odds_under?: number | null
          recommendation_type: string
          roi_unit?: number | null
          season: number
          updated_at?: string
          value_percentage?: number | null
          weights_used?: Json | null
        }
        Update: {
          actual_away_goals?: number | null
          actual_btts?: boolean | null
          actual_home_goals?: number | null
          actual_outcome?: string | null
          actual_over25?: boolean | null
          away_team?: string
          away_team_id?: number | null
          confidence_score?: number
          created_at?: string
          estimated_probability?: number | null
          factors_used?: Json | null
          fixture_id?: number
          hit?: boolean | null
          home_team?: string
          home_team_id?: number | null
          id?: string
          implied_probability?: number | null
          is_simulated?: boolean
          league_id?: number
          league_name?: string
          match_date?: string
          odds_away?: number
          odds_draw?: number
          odds_home?: number
          odds_over?: number | null
          odds_under?: number | null
          recommendation_type?: string
          roi_unit?: number | null
          season?: number
          updated_at?: string
          value_percentage?: number | null
          weights_used?: Json | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          campaign: string | null
          converted: boolean | null
          created_at: string | null
          email: string
          id: string
          medium: string | null
          source: string | null
        }
        Insert: {
          campaign?: string | null
          converted?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          medium?: string | null
          source?: string | null
        }
        Update: {
          campaign?: string | null
          converted?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          medium?: string | null
          source?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_daily_picks: boolean | null
          email_results: boolean | null
          preferred_time: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_daily_picks?: boolean | null
          email_results?: boolean | null
          preferred_time?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_daily_picks?: boolean | null
          email_results?: boolean | null
          preferred_time?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      odds_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          id: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data: Json
          expires_at: string
          id?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      password_reset_otp: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          blocked_at: string | null
          blocked_reason: string | null
          city: string | null
          country_code: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          is_blocked: boolean | null
          phone: string | null
          registration_ip: string | null
          registration_source: string | null
          state: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string
          timezone: string | null
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          is_blocked?: boolean | null
          phone?: string | null
          registration_ip?: string | null
          registration_source?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          timezone?: string | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          is_blocked?: boolean | null
          phone?: string | null
          registration_ip?: string | null
          registration_source?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          timezone?: string | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          name: string
          price_cents: number
          stripe_price_id: string | null
          tier: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          name: string
          price_cents: number
          stripe_price_id?: string | null
          tier: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          tier?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      accumulator_stats: {
        Row: {
          accumulator_type: string | null
          avg_calculated_chance: number | null
          avg_shown_chance: number | null
          avg_total_odd: number | null
          hit_rate_percent: number | null
          losses: number | null
          risk_level: string | null
          total: number | null
          wins: number | null
        }
        Relationships: []
      }
      bet_stats: {
        Row: {
          avg_confidence: number | null
          avg_edge: number | null
          avg_estimated_prob: number | null
          avg_implied_prob: number | null
          avg_odd: number | null
          bet_type: string | null
          hit_rate: number | null
          losses: number | null
          total_bets: number | null
          wins: number | null
        }
        Relationships: []
      }
      recent_results: {
        Row: {
          actual_score: string | null
          away_team: string | null
          bet_label: string | null
          bet_type: string | null
          estimated_probability: number | null
          home_team: string | null
          id: string | null
          implied_probability: number | null
          league: string | null
          match_date: string | null
          odd: number | null
          result: string | null
          value_edge: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_cache: { Args: never; Returns: undefined }
      cleanup_expired_otp: { Args: never; Returns: undefined }
      get_remaining_searches: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_search_count: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
