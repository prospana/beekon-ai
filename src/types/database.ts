/**
 * Database type aliases for easy import and usage
 * These types are derived from the generated Supabase types
 */
import { Database } from "@/integrations/supabase/types";

// Core database table types
export type Website = Database['beekon_data']['Tables']['websites']['Row'];
export type WebsiteInsert = Database['beekon_data']['Tables']['websites']['Insert'];
export type WebsiteUpdate = Database['beekon_data']['Tables']['websites']['Update'];

export type Competitor = Database['beekon_data']['Tables']['competitors']['Row'];
export type CompetitorInsert = Database['beekon_data']['Tables']['competitors']['Insert'];
export type CompetitorUpdate = Database['beekon_data']['Tables']['competitors']['Update'];

export type LLMAnalysisResult = Database['beekon_data']['Tables']['llm_analysis_results']['Row'];
export type LLMAnalysisResultInsert = Database['beekon_data']['Tables']['llm_analysis_results']['Insert'];
export type LLMAnalysisResultUpdate = Database['beekon_data']['Tables']['llm_analysis_results']['Update'];

export type Topic = Database['beekon_data']['Tables']['topics']['Row'];
export type TopicInsert = Database['beekon_data']['Tables']['topics']['Insert'];
export type TopicUpdate = Database['beekon_data']['Tables']['topics']['Update'];

export type Prompt = Database['beekon_data']['Tables']['prompts']['Row'];
export type PromptInsert = Database['beekon_data']['Tables']['prompts']['Insert'];
export type PromptUpdate = Database['beekon_data']['Tables']['prompts']['Update'];

export type Profile = Database['beekon_data']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['beekon_data']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['beekon_data']['Tables']['profiles']['Update'];

export type ApiKey = Database['beekon_data']['Tables']['api_keys']['Row'];
export type ApiKeyInsert = Database['beekon_data']['Tables']['api_keys']['Insert'];
export type ApiKeyUpdate = Database['beekon_data']['Tables']['api_keys']['Update'];

export type WebsiteSettings = Database['beekon_data']['Tables']['website_settings']['Row'];
export type WebsiteSettingsInsert = Database['beekon_data']['Tables']['website_settings']['Insert'];
export type WebsiteSettingsUpdate = Database['beekon_data']['Tables']['website_settings']['Update'];

export type Workspace = Database['beekon_data']['Tables']['workspaces']['Row'];
export type WorkspaceInsert = Database['beekon_data']['Tables']['workspaces']['Insert'];
export type WorkspaceUpdate = Database['beekon_data']['Tables']['workspaces']['Update'];

// Common notification settings type
export interface NotificationSettings {
  email_notifications: boolean;
  weekly_reports: boolean;
  competitor_alerts: boolean;
  analysis_complete: boolean;
}

// Extended user profile with notification settings
export interface UserProfile extends Profile {
  notification_settings: NotificationSettings;
}

// Extended website with computed fields for UI
export interface WebsiteWithMetrics extends Website {
  totalTopics: number;
  avgVisibility: number;
  lastAnalysisDate: string | null;
  competitorCount: number;
  analysisCount: number;
}

// Analysis result types
export interface LLMResult {
  llm_provider: string;
  is_mentioned: boolean;
  rank_position: number | null;
  confidence_score: number | null;
  sentiment_score: number | null;
  summary_text: string | null;
  response_text: string | null;
  analyzed_at: string;
}

export interface AnalysisResult {
  topic_name: string;
  topic_keywords: string[];
  llm_results: LLMResult[];
  total_mentions: number;
  avg_rank: number | null;
  avg_confidence: number | null;
  avg_sentiment: number | null;
}

// Competitor analysis result
export interface CompetitorAnalysisResult {
  competitor_domain: string;
  competitor_name: string | null;
  analysis_results: AnalysisResult[];
  overall_mentions: number;
  avg_rank: number | null;
  avg_confidence: number | null;
  last_analyzed_at: string | null;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Filter types
export interface DateRangeFilter {
  from: string;
  to: string;
}

export interface WebsiteFilter {
  website_ids: string[];
  date_range: DateRangeFilter;
  llm_providers: string[];
  analysis_status: 'all' | 'completed' | 'pending' | 'failed';
}

// Dashboard metrics
export interface DashboardMetrics {
  total_websites: number;
  total_competitors: number;
  total_analyses: number;
  avg_visibility: number;
  mentions_trend: number;
  rank_trend: number;
  confidence_trend: number;
  sentiment_trend: number;
}

// Type guards
export const isValidWebsite = (obj: unknown): obj is Website => {
  return obj !== null && 
    typeof obj === 'object' && 
    'id' in obj && 
    'domain' in obj && 
    'workspace_id' in obj;
};

export const isValidCompetitor = (obj: unknown): obj is Competitor => {
  return obj !== null && 
    typeof obj === 'object' && 
    'id' in obj && 
    'competitor_domain' in obj && 
    'website_id' in obj;
};

export const isValidLLMResult = (obj: unknown): obj is LLMResult => {
  return obj !== null && 
    typeof obj === 'object' && 
    'llm_provider' in obj && 
    'is_mentioned' in obj &&
    typeof (obj as Record<string, unknown>).is_mentioned === 'boolean';
};