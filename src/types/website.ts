// Website type definitions for Beekon.ai

export interface Website {
  id: string; // UUID from database
  domain: string;
  display_name: string | null; // Matches database field name
  crawl_status: string | null; // Matches database field name
  is_active: boolean | null; // Matches database field name
  last_crawled_at: string | null; // Matches database field name
  workspace_id: string | null; // Matches database field name
  created_at: string | null; // Matches database field name
  updated_at: string | null; // Matches database field name
  // Extended fields for UI (these might be stored in settings or calculated)
  totalTopics?: number;
  avgVisibility?: number;
  description?: string;
  analysisFrequency?: "daily" | "weekly" | "bi-weekly" | "monthly";
  autoAnalysis?: boolean;
  notifications?: boolean;
  competitorTracking?: boolean;
  weeklyReports?: boolean;
  showInDashboard?: boolean;
  priorityLevel?: "high" | "medium" | "low";
  customLabels?: string;
  apiAccess?: boolean;
  dataRetention?: "30" | "90" | "180" | "365";
  exportEnabled?: boolean;
}

// UI-friendly version with computed fields
export interface WebsiteDisplay {
  id: string;
  domain: string;
  displayName: string; // Computed from display_name or domain
  status: "pending" | "crawling" | "completed" | "failed" | "active" | "paused"; // Computed from crawl_status and is_active
  lastAnalyzed: string; // Computed from last_crawled_at
  totalTopics: number;
  avgVisibility: number;
  description?: string;
  analysisFrequency: "daily" | "weekly" | "bi-weekly" | "monthly";
  autoAnalysis: boolean;
  notifications: boolean;
  competitorTracking: boolean;
  weeklyReports: boolean;
  showInDashboard: boolean;
  priorityLevel: "high" | "medium" | "low";
  customLabels?: string;
  apiAccess: boolean;
  dataRetention: "30" | "90" | "180" | "365";
  exportEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  workspaceId?: string;
}

export interface WebsiteCreateRequest {
  domain: string;
  display_name?: string;
  workspace_id: string;
}

export interface WebsiteUpdateRequest
  extends Partial<Omit<Website, "id" | "created_at" | "updated_at">> {
  domain?: string;
  display_name?: string;
}

export interface WebsiteAnalysisResult {
  id: string; // UUID from database
  website_id: string; // UUID from database
  prompt: string;
  chatgpt?: {
    mentioned: boolean;
    rank?: number;
    sentiment?: "positive" | "negative" | "neutral";
  };
  claude?: {
    mentioned: boolean;
    rank?: number;
    sentiment?: "positive" | "negative" | "neutral";
  };
  gemini?: {
    mentioned: boolean;
    rank?: number;
    sentiment?: "positive" | "negative" | "neutral";
  };
  topic: string;
  analyzed_at: string;
}

export interface WebsiteMetrics {
  website_id: string; // UUID from database
  visibilityScore: number;
  averageRank: number;
  totalMentions: number;
  sentimentScore: number;
  trending: "up" | "down" | "stable";
  lastUpdated: string;
}

// Website settings interface for the settings modal
export interface WebsiteSettings {
  id: string;
  website_id: string;
  analysis_frequency: "daily" | "weekly" | "bi-weekly" | "monthly";
  auto_analysis: boolean;
  notifications: boolean;
  competitor_tracking: boolean;
  weekly_reports: boolean;
  show_in_dashboard: boolean;
  priority_level: "high" | "medium" | "low";
  custom_labels?: string;
  api_access: boolean;
  data_retention: "30" | "90" | "180" | "365";
  export_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}
