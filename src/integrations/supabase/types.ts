export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  beekon_data: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          name: string;
          rate_limit: number | null;
          rate_limit_window: string | null;
          scopes: string[] | null;
          usage_count: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          name: string;
          rate_limit?: number | null;
          rate_limit_window?: string | null;
          scopes?: string[] | null;
          usage_count?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          name?: string;
          rate_limit?: number | null;
          rate_limit_window?: string | null;
          scopes?: string[] | null;
          usage_count?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      competitors: {
        Row: {
          analysis_frequency: string | null;
          competitor_domain: string;
          competitor_name: string | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          last_analyzed_at: string | null;
          updated_at: string | null;
          website_id: string;
        };
        Insert: {
          analysis_frequency?: string | null;
          competitor_domain: string;
          competitor_name?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_analyzed_at?: string | null;
          updated_at?: string | null;
          website_id: string;
        };
        Update: {
          analysis_frequency?: string | null;
          competitor_domain?: string;
          competitor_name?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_analyzed_at?: string | null;
          updated_at?: string | null;
          website_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
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
          prompt_id: string;
          rank_position: number | null;
          response_text: string | null;
          sentiment_score: number | null;
          summary_text: string | null;
          website_id: string;
        };
        Insert: {
          analyzed_at?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          is_mentioned?: boolean | null;
          llm_provider: string;
          prompt_id: string;
          rank_position?: number | null;
          response_text?: string | null;
          sentiment_score?: number | null;
          summary_text?: string | null;
          website_id: string;
        };
        Update: {
          analyzed_at?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          is_mentioned?: boolean | null;
          llm_provider?: string;
          prompt_id?: string;
          rank_position?: number | null;
          response_text?: string | null;
          sentiment_score?: number | null;
          summary_text?: string | null;
          website_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "llm_analysis_results_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "llm_analysis_results_website_id_fkey";
            columns: ["website_id"];
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          company: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          full_name: string | null;
          id: string;
          last_name: string | null;
          notification_settings: Json | null;
          updated_at: string | null;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          last_name?: string | null;
          notification_settings?: Json | null;
          updated_at?: string | null;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          last_name?: string | null;
          notification_settings?: Json | null;
          updated_at?: string | null;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };
      prompts: {
        Row: {
          created_at: string | null;
          expected_llms: string[] | null;
          id: string;
          is_active: boolean | null;
          opportunities: string[] | null;
          priority: number | null;
          prompt_text: string;
          prompt_type: string | null;
          recommendation_text: string | null;
          reporting_text: string | null;
          strengths: string[] | null;
          topic_id: string;
        };
        Insert: {
          created_at?: string | null;
          expected_llms?: string[] | null;
          id?: string;
          is_active?: boolean | null;
          opportunities?: string[] | null;
          priority?: number | null;
          prompt_text: string;
          prompt_type?: string | null;
          recommendation_text?: string | null;
          reporting_text?: string | null;
          strengths?: string[] | null;
          topic_id: string;
        };
        Update: {
          created_at?: string | null;
          expected_llms?: string[] | null;
          id?: string;
          is_active?: boolean | null;
          opportunities?: string[] | null;
          priority?: number | null;
          prompt_text?: string;
          prompt_type?: string | null;
          recommendation_text?: string | null;
          reporting_text?: string | null;
          strengths?: string[] | null;
          topic_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_topic_id_fkey";
            columns: ["topic_id"];
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
          priority: number | null;
          recommendation_text: string | null;
          reporting_text: string | null;
          topic_keywords: string[] | null;
          topic_name: string;
          website_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_validated?: boolean | null;
          priority?: number | null;
          recommendation_text?: string | null;
          reporting_text?: string | null;
          topic_keywords?: string[] | null;
          topic_name: string;
          website_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_validated?: boolean | null;
          priority?: number | null;
          recommendation_text?: string | null;
          reporting_text?: string | null;
          topic_keywords?: string[] | null;
          topic_name?: string;
          website_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topics_website_id_fkey";
            columns: ["website_id"];
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      website_settings: {
        Row: {
          created_at: string | null;
          id: string;
          settings: Json;
          updated_at: string | null;
          website_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          settings?: Json;
          updated_at?: string | null;
          website_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          settings?: Json;
          updated_at?: string | null;
          website_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "website_settings_website_id_fkey";
            columns: ["website_id"];
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
          workspace_id: string;
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
          workspace_id: string;
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
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "websites_workspace_id_fkey";
            columns: ["workspace_id"];
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
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          }
        ];
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
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  pgbouncer: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_auth: {
        Args: { p_usename: string };
        Returns: {
          username: string;
          password: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      [_ in never]: never;
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey";
            columns: ["upload_id"];
            referencedRelation: "s3_multipart_uploads";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: {
        Args: { name: string };
        Returns: string;
      };
      filename: {
        Args: { name: string };
        Returns: string;
      };
      foldername: {
        Args: { name: string };
        Returns: string[];
      };
      get_level: {
        Args: { name: string };
        Returns: number;
      };
      get_prefix: {
        Args: { name: string };
        Returns: string;
      };
      get_prefixes: {
        Args: { name: string };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
        };
        Returns: {
          key: string;
          id: string;
          created_at: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          start_after?: string;
          next_token?: string;
        };
        Returns: {
          name: string;
          id: string;
          metadata: Json;
          updated_at: string;
        }[];
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
      search_legacy_v1: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
      search_v1_optimised: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
      search_v2: {
        Args: {
          prefix: string;
          bucket_name: string;
          limits?: number;
          levels?: number;
          start_after?: string;
        };
        Returns: {
          key: string;
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  beekon_data: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const;
