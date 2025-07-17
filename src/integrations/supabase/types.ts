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
      competitor_analysis_results: {
        Row: {
          analyzed_at: string | null;
          competitor_id: string;
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
        };
        Insert: {
          analyzed_at?: string | null;
          competitor_id: string;
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
        };
        Update: {
          analyzed_at?: string | null;
          competitor_id?: string;
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
        };
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_results_competitor_id_fkey";
            columns: ["competitor_id"];
            isOneToOne: false;
            referencedRelation: "competitors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "competitor_analysis_results_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          }
        ];
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
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
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
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "llm_analysis_results_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
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
            isOneToOne: false;
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
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
          {
            foreignKeyName: "topics_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
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
            isOneToOne: true;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
          {
            foreignKeyName: "website_settings_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: true;
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
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["user_id"];
          }
        ];
      };
    };
    Views: {
      mv_competitor_daily_metrics: {
        Row: {
          analysis_date: string | null;
          competitor_domain: string | null;
          daily_avg_rank: number | null;
          daily_avg_sentiment: number | null;
          daily_llm_providers: number | null;
          daily_mentions: number | null;
          daily_positive_mentions: number | null;
          llm_providers_list: string[] | null;
          website_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      mv_competitor_performance: {
        Row: {
          avg_confidence_score: number | null;
          avg_rank_position: number | null;
          avg_sentiment_score: number | null;
          competitor_domain: string | null;
          competitor_id: string | null;
          competitor_name: string | null;
          last_analysis_date: string | null;
          llm_providers_count: number | null;
          mention_trend_7d: number | null;
          mentions_last_30_days: number | null;
          mentions_last_7_days: number | null;
          positive_mentions: number | null;
          recent_avg_rank: number | null;
          recent_sentiment_score: number | null;
          total_mentions: number | null;
          website_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      mv_competitor_share_of_voice: {
        Row: {
          avg_confidence_score: number | null;
          avg_rank_position: number | null;
          avg_sentiment_score: number | null;
          competitor_domain: string | null;
          competitor_id: string | null;
          competitor_name: string | null;
          last_analyzed_at: string | null;
          share_of_voice: number | null;
          total_analyses: number | null;
          total_voice_mentions: number | null;
          website_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
          {
            foreignKeyName: "competitors_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      mv_competitive_gap_analysis: {
        Row: {
          competitor_avg_score: number | null;
          competitor_count: number | null;
          gap_type: string | null;
          performance_gap: number | null;
          topic_id: string | null;
          topic_name: string | null;
          website_id: string | null;
          your_brand_score: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "topics_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "user_accessible_websites";
            referencedColumns: ["website_id"];
          },
          {
            foreignKeyName: "topics_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          }
        ];
      };
      user_accessible_websites: {
        Row: {
          user_id: string | null;
          website_id: string | null;
          workspace_id: string | null;
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
    };
    Functions: {
      get_batch_website_metrics: {
        Args: {
          p_website_ids: string[];
          p_date_start?: string;
          p_date_end?: string;
        };
        Returns: {
          website_id: string;
          domain: string;
          display_name: string;
          total_analyses: number;
          total_mentions: number;
          avg_sentiment: number;
          avg_rank: number;
          visibility_score: number;
        }[];
      };
      get_competitor_performance: {
        Args: { p_website_id: string; p_limit?: number; p_offset?: number };
        Returns: {
          competitor_id: string;
          competitor_domain: string;
          competitor_name: string;
          total_mentions: number;
          positive_mentions: number;
          avg_rank_position: number;
          avg_sentiment_score: number;
          avg_confidence_score: number;
          llm_providers_count: number;
          last_analysis_date: string;
          mentions_last_7_days: number;
          mentions_last_30_days: number;
          mention_trend_7d: number;
          recent_sentiment_score: number;
          recent_avg_rank: number;
        }[];
      };
      get_competitor_share_of_voice: {
        Args: {
          p_website_id: string;
          p_date_start?: string;
          p_date_end?: string;
        };
        Returns: {
          competitor_id: string;
          competitor_name: string;
          competitor_domain: string;
          total_analyses: number;
          total_voice_mentions: number;
          share_of_voice: number;
          avg_rank_position: number;
          avg_sentiment_score: number;
          avg_confidence_score: number;
        }[];
      };
      get_competitive_gap_analysis: {
        Args: {
          p_website_id: string;
          p_date_start?: string;
          p_date_end?: string;
        };
        Returns: {
          topic_id: string;
          topic_name: string;
          your_brand_score: number;
          competitor_data: unknown;
        }[];
      };
      analyze_competitor_mentions: {
        Args: {
          p_website_id: string;
          p_competitor_id: string;
          p_prompt_id: string;
          p_llm_provider: string;
          p_response_text: string;
        };
        Returns: {
          is_mentioned: boolean;
          rank_position: number;
          sentiment_score: number;
          confidence_score: number;
          summary_text: string;
        }[];
      };
      get_competitor_query_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          query_type: string;
          avg_execution_time: unknown;
          total_calls: number;
          cache_hit_ratio: number;
        }[];
      };
      get_competitor_time_series: {
        Args: {
          p_website_id: string;
          p_competitor_domain?: string;
          p_days?: number;
        };
        Returns: {
          analysis_date: string;
          competitor_domain: string;
          daily_mentions: number;
          daily_positive_mentions: number;
          daily_avg_rank: number;
          daily_avg_sentiment: number;
          daily_llm_providers: number;
        }[];
      };
      get_dashboard_time_series: {
        Args: {
          p_website_ids: string[];
          p_date_start: string;
          p_date_end: string;
          p_interval_type?: string;
        };
        Returns: {
          period_start: string;
          total_mentions: number;
          avg_sentiment: number;
          avg_rank: number;
        }[];
      };
      get_llm_performance: {
        Args: {
          p_website_ids: string[];
          p_date_start?: string;
          p_date_end?: string;
        };
        Returns: {
          llm_provider: string;
          total_analyses: number;
          total_mentions: number;
          avg_sentiment: number;
          avg_rank: number;
          visibility_score: number;
        }[];
      };
      get_website_metrics: {
        Args: {
          p_website_id: string;
          p_date_start?: string;
          p_date_end?: string;
        };
        Returns: {
          total_analyses: number;
          total_mentions: number;
          avg_sentiment: number;
          avg_rank: number;
          visibility_score: number;
        }[];
      };
      refresh_competitor_performance_views: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      refresh_competitor_analysis_views: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
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
  public: {
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
          usage_count?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      api_keys_backup: {
        Row: {
          created_at: string | null;
          id: string | null;
          is_active: boolean | null;
          key_hash: string | null;
          key_prefix: string | null;
          last_used_at: string | null;
          name: string | null;
          usage_count: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          key_hash?: string | null;
          key_prefix?: string | null;
          last_used_at?: string | null;
          name?: string | null;
          usage_count?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          key_hash?: string | null;
          key_prefix?: string | null;
          last_used_at?: string | null;
          name?: string | null;
          usage_count?: number | null;
          user_id?: string | null;
        };
        Relationships: [];
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
        Relationships: [];
      };
      profiles_backup: {
        Row: {
          avatar_url: string | null;
          company: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          full_name: string | null;
          id: string | null;
          last_name: string | null;
          notification_settings: Json | null;
          updated_at: string | null;
          user_id: string | null;
          workspace_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id?: string | null;
          last_name?: string | null;
          notification_settings?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
          workspace_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id?: string | null;
          last_name?: string | null;
          notification_settings?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
          workspace_id?: string | null;
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
