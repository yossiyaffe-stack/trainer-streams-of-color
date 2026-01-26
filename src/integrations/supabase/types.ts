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
      paintings: {
        Row: {
          ai_analysis: Json | null
          analyzed_at: string | null
          artist: string | null
          best_for: string[] | null
          client_talking_points: string[] | null
          color_mood: string | null
          corrections: Json | null
          created_at: string | null
          era: string | null
          fabrics: string[] | null
          id: string
          image_url: string
          jewelry_types: string[] | null
          mood_primary: string | null
          mood_secondary: string[] | null
          neckline: string | null
          notes: string | null
          original_filename: string | null
          palette_effect: string | null
          prints_patterns: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          silhouette: string | null
          sleeves: string | null
          status: string | null
          suggested_season: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          year_approximate: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          analyzed_at?: string | null
          artist?: string | null
          best_for?: string[] | null
          client_talking_points?: string[] | null
          color_mood?: string | null
          corrections?: Json | null
          created_at?: string | null
          era?: string | null
          fabrics?: string[] | null
          id?: string
          image_url: string
          jewelry_types?: string[] | null
          mood_primary?: string | null
          mood_secondary?: string[] | null
          neckline?: string | null
          notes?: string | null
          original_filename?: string | null
          palette_effect?: string | null
          prints_patterns?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          silhouette?: string | null
          sleeves?: string | null
          status?: string | null
          suggested_season?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          year_approximate?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          analyzed_at?: string | null
          artist?: string | null
          best_for?: string[] | null
          client_talking_points?: string[] | null
          color_mood?: string | null
          corrections?: Json | null
          created_at?: string | null
          era?: string | null
          fabrics?: string[] | null
          id?: string
          image_url?: string
          jewelry_types?: string[] | null
          mood_primary?: string | null
          mood_secondary?: string[] | null
          neckline?: string | null
          notes?: string | null
          original_filename?: string | null
          palette_effect?: string | null
          prints_patterns?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          silhouette?: string | null
          sleeves?: string | null
          status?: string | null
          suggested_season?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          year_approximate?: string | null
        }
        Relationships: []
      }
      subtypes: {
        Row: {
          artists: string[] | null
          avoid_colors: string[] | null
          best_for: string[] | null
          created_at: string | null
          description: string | null
          designers: string[] | null
          display_order: number | null
          eras: string[] | null
          fabrics_avoid: string[] | null
          fabrics_good: string[] | null
          fabrics_perfect: string[] | null
          id: string
          is_active: boolean | null
          jewelry_metals: string[] | null
          jewelry_stones: string[] | null
          jewelry_styles: string[] | null
          key_colors: string[] | null
          makeup_cheek: string[] | null
          makeup_eye: string[] | null
          makeup_lip: string[] | null
          name: string
          palette_effect: string | null
          prints: string[] | null
          season: string
          silhouettes: string[] | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          artists?: string[] | null
          avoid_colors?: string[] | null
          best_for?: string[] | null
          created_at?: string | null
          description?: string | null
          designers?: string[] | null
          display_order?: number | null
          eras?: string[] | null
          fabrics_avoid?: string[] | null
          fabrics_good?: string[] | null
          fabrics_perfect?: string[] | null
          id?: string
          is_active?: boolean | null
          jewelry_metals?: string[] | null
          jewelry_stones?: string[] | null
          jewelry_styles?: string[] | null
          key_colors?: string[] | null
          makeup_cheek?: string[] | null
          makeup_eye?: string[] | null
          makeup_lip?: string[] | null
          name: string
          palette_effect?: string | null
          prints?: string[] | null
          season: string
          silhouettes?: string[] | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          artists?: string[] | null
          avoid_colors?: string[] | null
          best_for?: string[] | null
          created_at?: string | null
          description?: string | null
          designers?: string[] | null
          display_order?: number | null
          eras?: string[] | null
          fabrics_avoid?: string[] | null
          fabrics_good?: string[] | null
          fabrics_perfect?: string[] | null
          id?: string
          is_active?: boolean | null
          jewelry_metals?: string[] | null
          jewelry_stones?: string[] | null
          jewelry_styles?: string[] | null
          key_colors?: string[] | null
          makeup_cheek?: string[] | null
          makeup_eye?: string[] | null
          makeup_lip?: string[] | null
          name?: string
          palette_effect?: string | null
          prints?: string[] | null
          season?: string
          silhouettes?: string[] | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
