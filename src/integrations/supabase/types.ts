export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  beekon_data: {
    Tables: {
      competitors: {
        Row: {
          competitor_domain: string;
          competitor_name: string | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          updated_at: string | null;
          website_id: string | null;
        };
        Insert: {
          competitor_domain: string;
          competitor_name?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          website_id?: string | null;
        };
        Update: {
          competitor_domain?: string;
          competitor_name?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          website_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      llm_analysis_results: {
        Row: {
          analyzed_at: string | null;
          confidence_score: number | null;
          created_at: string | null;
          id: string;
          is_mentioned: boolean | null;
          llm_provider: string;
          prompt_id: string | null;
          rank_position: number | null;
          response_text: string | null;
          sentiment_score: number | null;
          summary_text: string | null;
          website_id: string | null;
        };
        Insert: {
          analyzed_at?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          is_mentioned?: boolean | null;
          llm_provider: string;
          prompt_id?: string | null;
          rank_position?: number | null;
          response_text?: string | null;
          sentiment_score?: number | null;
          summary_text?: string | null;
          website_id?: string | null;
        };
        Update: {
          analyzed_at?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          is_mentioned?: boolean | null;
          llm_provider?: string;
          prompt_id?: string | null;
          rank_position?: number | null;
          response_text?: string | null;
          sentiment_score?: number | null;
          summary_text?: string | null;
          website_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "llm_analysis_results_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "llm_analysis_results_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      prompts: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          priority: number | null;
          prompt_text: string;
          prompt_type: string | null;
          topic_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          priority?: number | null;
          prompt_text: string;
          prompt_type?: string | null;
          topic_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          priority?: number | null;
          prompt_text?: string;
          prompt_type?: string | null;
          topic_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      topics: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          is_validated: boolean | null;
          recommendation_text: string | null;
          reporting_text: string | null;
          topic_keywords: string[] | null;
          topic_name: string;
          website_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_validated?: boolean | null;
          recommendation_text?: string | null;
          reporting_text?: string | null;
          topic_keywords?: string[] | null;
          topic_name: string;
          website_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_validated?: boolean | null;
          recommendation_text?: string | null;
          reporting_text?: string | null;
          topic_keywords?: string[] | null;
          topic_name?: string;
          website_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "topics_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      websites: {
        Row: {
          crawl_status: string | null;
          created_at: string | null;
          display_name: string | null;
          domain: string;
          id: string;
          is_active: boolean | null;
          last_crawled_at: string | null;
          updated_at: string | null;
          workspace_id: string | null;
        };
        Insert: {
          crawl_status?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          domain: string;
          id?: string;
          is_active?: boolean | null;
          last_crawled_at?: string | null;
          updated_at?: string | null;
          workspace_id?: string | null;
        };
        Update: {
          crawl_status?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          domain?: string;
          id?: string;
          is_active?: boolean | null;
          last_crawled_at?: string | null;
          updated_at?: string | null;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "websites_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };
      workspaces: {
        Row: {
          created_at: string | null;
          credits_remaining: number | null;
          credits_reset_at: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          settings: Json | null;
          subscription_tier: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits_remaining?: number | null;
          credits_reset_at?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          settings?: Json | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits_remaining?: number | null;
          credits_reset_at?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          settings?: Json | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  beekon_data: {
    Enums: {},
  },
} as const;
