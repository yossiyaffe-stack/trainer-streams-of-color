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
      batch_images: {
        Row: {
          added_at: string | null
          batch_id: string
          face_image_id: string
        }
        Insert: {
          added_at?: string | null
          batch_id: string
          face_image_id: string
        }
        Update: {
          added_at?: string | null
          batch_id?: string
          face_image_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_images_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "training_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_images_face_image_id_fkey"
            columns: ["face_image_id"]
            isOneToOne: false
            referencedRelation: "face_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_images_face_image_id_fkey"
            columns: ["face_image_id"]
            isOneToOne: false
            referencedRelation: "v_labeling_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_images_face_image_id_fkey"
            columns: ["face_image_id"]
            isOneToOne: false
            referencedRelation: "v_training_data"
            referencedColumns: ["id"]
          },
        ]
      }
      color_labels: {
        Row: {
          ai_alternatives: Json | null
          ai_confidence: number | null
          ai_predicted_subtype: string | null
          ai_reasoning: string | null
          confirmed_season: Database["public"]["Enums"]["season_type"] | null
          confirmed_subtype: string | null
          contrast_details: Json | null
          contrast_level:
            | Database["public"]["Enums"]["contrast_level_type"]
            | null
          contrast_value: number | null
          created_at: string | null
          depth: Database["public"]["Enums"]["depth_type"] | null
          depth_value: number | null
          disagreement_notes: string | null
          exclude_reason: string | null
          eye_color_name: Database["public"]["Enums"]["eye_color_name"] | null
          eye_details: Json | null
          eye_hex: string | null
          eye_rgb: number[] | null
          face_image_id: string
          had_disagreement: boolean | null
          hair_color_name: Database["public"]["Enums"]["hair_color_name"] | null
          hair_details: Json | null
          hair_hex: string | null
          hair_rgb: number[] | null
          id: string
          is_good_for_training: boolean | null
          label_status: Database["public"]["Enums"]["label_status"] | null
          labeled_at: string | null
          labeled_by: string | null
          lip_hex: string | null
          lip_rgb: number[] | null
          notes: string | null
          skin_hex: string | null
          skin_region_samples: Json | null
          skin_rgb: number[] | null
          skin_tone_name: Database["public"]["Enums"]["skin_tone_name"] | null
          undertone: Database["public"]["Enums"]["undertone_type"] | null
          undertone_confidence: number | null
          undertone_indicators: Json | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_alternatives?: Json | null
          ai_confidence?: number | null
          ai_predicted_subtype?: string | null
          ai_reasoning?: string | null
          confirmed_season?: Database["public"]["Enums"]["season_type"] | null
          confirmed_subtype?: string | null
          contrast_details?: Json | null
          contrast_level?:
            | Database["public"]["Enums"]["contrast_level_type"]
            | null
          contrast_value?: number | null
          created_at?: string | null
          depth?: Database["public"]["Enums"]["depth_type"] | null
          depth_value?: number | null
          disagreement_notes?: string | null
          exclude_reason?: string | null
          eye_color_name?: Database["public"]["Enums"]["eye_color_name"] | null
          eye_details?: Json | null
          eye_hex?: string | null
          eye_rgb?: number[] | null
          face_image_id: string
          had_disagreement?: boolean | null
          hair_color_name?:
            | Database["public"]["Enums"]["hair_color_name"]
            | null
          hair_details?: Json | null
          hair_hex?: string | null
          hair_rgb?: number[] | null
          id?: string
          is_good_for_training?: boolean | null
          label_status?: Database["public"]["Enums"]["label_status"] | null
          labeled_at?: string | null
          labeled_by?: string | null
          lip_hex?: string | null
          lip_rgb?: number[] | null
          notes?: string | null
          skin_hex?: string | null
          skin_region_samples?: Json | null
          skin_rgb?: number[] | null
          skin_tone_name?: Database["public"]["Enums"]["skin_tone_name"] | null
          undertone?: Database["public"]["Enums"]["undertone_type"] | null
          undertone_confidence?: number | null
          undertone_indicators?: Json | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_alternatives?: Json | null
          ai_confidence?: number | null
          ai_predicted_subtype?: string | null
          ai_reasoning?: string | null
          confirmed_season?: Database["public"]["Enums"]["season_type"] | null
          confirmed_subtype?: string | null
          contrast_details?: Json | null
          contrast_level?:
            | Database["public"]["Enums"]["contrast_level_type"]
            | null
          contrast_value?: number | null
          created_at?: string | null
          depth?: Database["public"]["Enums"]["depth_type"] | null
          depth_value?: number | null
          disagreement_notes?: string | null
          exclude_reason?: string | null
          eye_color_name?: Database["public"]["Enums"]["eye_color_name"] | null
          eye_details?: Json | null
          eye_hex?: string | null
          eye_rgb?: number[] | null
          face_image_id?: string
          had_disagreement?: boolean | null
          hair_color_name?:
            | Database["public"]["Enums"]["hair_color_name"]
            | null
          hair_details?: Json | null
          hair_hex?: string | null
          hair_rgb?: number[] | null
          id?: string
          is_good_for_training?: boolean | null
          label_status?: Database["public"]["Enums"]["label_status"] | null
          labeled_at?: string | null
          labeled_by?: string | null
          lip_hex?: string | null
          lip_rgb?: number[] | null
          notes?: string | null
          skin_hex?: string | null
          skin_region_samples?: Json | null
          skin_rgb?: number[] | null
          skin_tone_name?: Database["public"]["Enums"]["skin_tone_name"] | null
          undertone?: Database["public"]["Enums"]["undertone_type"] | null
          undertone_confidence?: number | null
          undertone_indicators?: Json | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "color_labels_face_image_id_fkey"
            columns: ["face_image_id"]
            isOneToOne: true
            referencedRelation: "face_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_labels_face_image_id_fkey"
            columns: ["face_image_id"]
            isOneToOne: true
            referencedRelation: "v_labeling_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_labels_face_image_id_fkey"
            columns: ["face_image_id"]
            isOneToOne: true
            referencedRelation: "v_training_data"
            referencedColumns: ["id"]
          },
        ]
      }
      face_images: {
        Row: {
          celeba_attributes: Json | null
          created_at: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          is_good_lighting: boolean | null
          is_natural_hair_color: boolean | null
          is_neutral_background: boolean | null
          is_no_makeup: boolean | null
          is_processed: boolean | null
          original_filename: string | null
          processed_at: string | null
          quality_score: number | null
          source: Database["public"]["Enums"]["data_source"]
          source_id: string | null
          storage_path: string
          thumbnail_path: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          celeba_attributes?: Json | null
          created_at?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_good_lighting?: boolean | null
          is_natural_hair_color?: boolean | null
          is_neutral_background?: boolean | null
          is_no_makeup?: boolean | null
          is_processed?: boolean | null
          original_filename?: string | null
          processed_at?: string | null
          quality_score?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          source_id?: string | null
          storage_path: string
          thumbnail_path?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          celeba_attributes?: Json | null
          created_at?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_good_lighting?: boolean | null
          is_natural_hair_color?: boolean | null
          is_neutral_background?: boolean | null
          is_no_makeup?: boolean | null
          is_processed?: boolean | null
          original_filename?: string | null
          processed_at?: string | null
          quality_score?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          source_id?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      model_runs: {
        Row: {
          architecture: string | null
          completed_at: string | null
          config: Json | null
          confusion_matrix: Json | null
          created_at: string | null
          id: string
          model_name: string
          model_path: string | null
          model_version: string | null
          overall_accuracy: number | null
          per_subtype_accuracy: Json | null
          started_at: string | null
          subtypes_trained: string[] | null
          training_count: number | null
          validation_count: number | null
          weights_path: string | null
        }
        Insert: {
          architecture?: string | null
          completed_at?: string | null
          config?: Json | null
          confusion_matrix?: Json | null
          created_at?: string | null
          id?: string
          model_name: string
          model_path?: string | null
          model_version?: string | null
          overall_accuracy?: number | null
          per_subtype_accuracy?: Json | null
          started_at?: string | null
          subtypes_trained?: string[] | null
          training_count?: number | null
          validation_count?: number | null
          weights_path?: string | null
        }
        Update: {
          architecture?: string | null
          completed_at?: string | null
          config?: Json | null
          confusion_matrix?: Json | null
          created_at?: string | null
          id?: string
          model_name?: string
          model_path?: string | null
          model_version?: string | null
          overall_accuracy?: number | null
          per_subtype_accuracy?: Json | null
          started_at?: string | null
          subtypes_trained?: string[] | null
          training_count?: number | null
          validation_count?: number | null
          weights_path?: string | null
        }
        Relationships: []
      }
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
          time_period: string | null
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
          time_period?: string | null
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
          time_period?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_batches: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          labeled_count: number | null
          name: string
          purpose: string | null
          target_subtypes: string[] | null
          total_images: number | null
          updated_at: string | null
          verified_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          labeled_count?: number | null
          name: string
          purpose?: string | null
          target_subtypes?: string[] | null
          total_images?: number | null
          updated_at?: string | null
          verified_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          labeled_count?: number | null
          name?: string
          purpose?: string | null
          target_subtypes?: string[] | null
          total_images?: number | null
          updated_at?: string | null
          verified_count?: number | null
        }
        Relationships: []
      }
      vocabulary_terms: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string | null
          hex_code: string | null
          id: string
          parent_term: string | null
          related_terms: string[] | null
          rgb_values: number[] | null
          term: string
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          hex_code?: string | null
          id?: string
          parent_term?: string | null
          related_terms?: string[] | null
          rgb_values?: number[] | null
          term: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          hex_code?: string | null
          id?: string
          parent_term?: string | null
          related_terms?: string[] | null
          rgb_values?: number[] | null
          term?: string
          usage_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      v_dataset_stats: {
        Row: {
          ai_predicted: number | null
          expert_verified: number | null
          has_confirmed_subtype: number | null
          manually_labeled: number | null
          nechama_verified: number | null
          needs_review: number | null
          total_images: number | null
          training_ready: number | null
          unlabeled: number | null
        }
        Relationships: []
      }
      v_labeling_queue: {
        Row: {
          ai_alternatives: Json | null
          ai_confidence: number | null
          ai_predicted_subtype: string | null
          id: string | null
          label_status: Database["public"]["Enums"]["label_status"] | null
          quality_score: number | null
          source_id: string | null
          storage_path: string | null
          thumbnail_path: string | null
        }
        Relationships: []
      }
      v_subtype_distribution: {
        Row: {
          avg_ai_confidence: number | null
          confirmed_season: Database["public"]["Enums"]["season_type"] | null
          confirmed_subtype: string | null
          count: number | null
          nechama_verified_count: number | null
          verified_count: number | null
        }
        Relationships: []
      }
      v_training_data: {
        Row: {
          ai_confidence: number | null
          ai_predicted_subtype: string | null
          confirmed_season: Database["public"]["Enums"]["season_type"] | null
          confirmed_subtype: string | null
          contrast_level:
            | Database["public"]["Enums"]["contrast_level_type"]
            | null
          depth: Database["public"]["Enums"]["depth_type"] | null
          eye_color_name: Database["public"]["Enums"]["eye_color_name"] | null
          eye_hex: string | null
          hair_color_name: Database["public"]["Enums"]["hair_color_name"] | null
          hair_hex: string | null
          id: string | null
          is_good_for_training: boolean | null
          label_status: Database["public"]["Enums"]["label_status"] | null
          quality_score: number | null
          skin_hex: string | null
          skin_tone_name: Database["public"]["Enums"]["skin_tone_name"] | null
          source: Database["public"]["Enums"]["data_source"] | null
          storage_path: string | null
          thumbnail_path: string | null
          undertone: Database["public"]["Enums"]["undertone_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contrast_level_type:
        | "low"
        | "low-medium"
        | "medium"
        | "medium-high"
        | "high"
      data_source:
        | "celeba_hq"
        | "ffhq"
        | "client_photo"
        | "training_upload"
        | "user_submission"
      depth_type: "light" | "light-medium" | "medium" | "medium-deep" | "deep"
      eye_color_name:
        | "dark_brown"
        | "chocolate_brown"
        | "golden_brown"
        | "amber"
        | "topaz"
        | "honey"
        | "emerald"
        | "jade"
        | "olive"
        | "sage"
        | "moss"
        | "teal"
        | "sapphire"
        | "sky_blue"
        | "steel_blue"
        | "periwinkle"
        | "navy"
        | "charcoal"
        | "silver"
        | "slate"
        | "pewter"
        | "hazel_green"
        | "hazel_brown"
        | "hazel_gold"
        | "black"
        | "violet"
        | "mixed"
      hair_color_name:
        | "blue_black"
        | "soft_black"
        | "black_brown"
        | "espresso"
        | "dark_chocolate"
        | "milk_chocolate"
        | "chestnut"
        | "walnut"
        | "caramel"
        | "toffee"
        | "golden_brown"
        | "mousy_brown"
        | "auburn"
        | "copper"
        | "ginger"
        | "strawberry"
        | "burgundy"
        | "mahogany"
        | "platinum"
        | "ash_blonde"
        | "golden_blonde"
        | "honey_blonde"
        | "champagne"
        | "dirty_blonde"
        | "dark_blonde"
        | "silver"
        | "pewter"
        | "salt_pepper"
        | "white"
        | "steel_gray"
      label_status:
        | "unlabeled"
        | "ai_predicted"
        | "needs_review"
        | "manually_labeled"
        | "expert_verified"
        | "nechama_verified"
      season_type: "spring" | "summer" | "autumn" | "winter"
      skin_tone_name:
        | "porcelain"
        | "ivory"
        | "alabaster"
        | "fair"
        | "peaches_cream"
        | "cream"
        | "light_beige"
        | "rose_beige"
        | "warm_beige"
        | "golden_beige"
        | "nude"
        | "sand"
        | "honey"
        | "caramel"
        | "olive"
        | "tan"
        | "bronze"
        | "amber"
        | "cinnamon"
        | "toffee"
        | "mocha"
        | "espresso"
        | "mahogany"
        | "cocoa"
        | "ebony"
        | "onyx"
      undertone_type:
        | "warm"
        | "cool"
        | "neutral"
        | "warm-neutral"
        | "cool-neutral"
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
      contrast_level_type: [
        "low",
        "low-medium",
        "medium",
        "medium-high",
        "high",
      ],
      data_source: [
        "celeba_hq",
        "ffhq",
        "client_photo",
        "training_upload",
        "user_submission",
      ],
      depth_type: ["light", "light-medium", "medium", "medium-deep", "deep"],
      eye_color_name: [
        "dark_brown",
        "chocolate_brown",
        "golden_brown",
        "amber",
        "topaz",
        "honey",
        "emerald",
        "jade",
        "olive",
        "sage",
        "moss",
        "teal",
        "sapphire",
        "sky_blue",
        "steel_blue",
        "periwinkle",
        "navy",
        "charcoal",
        "silver",
        "slate",
        "pewter",
        "hazel_green",
        "hazel_brown",
        "hazel_gold",
        "black",
        "violet",
        "mixed",
      ],
      hair_color_name: [
        "blue_black",
        "soft_black",
        "black_brown",
        "espresso",
        "dark_chocolate",
        "milk_chocolate",
        "chestnut",
        "walnut",
        "caramel",
        "toffee",
        "golden_brown",
        "mousy_brown",
        "auburn",
        "copper",
        "ginger",
        "strawberry",
        "burgundy",
        "mahogany",
        "platinum",
        "ash_blonde",
        "golden_blonde",
        "honey_blonde",
        "champagne",
        "dirty_blonde",
        "dark_blonde",
        "silver",
        "pewter",
        "salt_pepper",
        "white",
        "steel_gray",
      ],
      label_status: [
        "unlabeled",
        "ai_predicted",
        "needs_review",
        "manually_labeled",
        "expert_verified",
        "nechama_verified",
      ],
      season_type: ["spring", "summer", "autumn", "winter"],
      skin_tone_name: [
        "porcelain",
        "ivory",
        "alabaster",
        "fair",
        "peaches_cream",
        "cream",
        "light_beige",
        "rose_beige",
        "warm_beige",
        "golden_beige",
        "nude",
        "sand",
        "honey",
        "caramel",
        "olive",
        "tan",
        "bronze",
        "amber",
        "cinnamon",
        "toffee",
        "mocha",
        "espresso",
        "mahogany",
        "cocoa",
        "ebony",
        "onyx",
      ],
      undertone_type: [
        "warm",
        "cool",
        "neutral",
        "warm-neutral",
        "cool-neutral",
      ],
    },
  },
} as const
