// Website type definitions for Beekon.ai

export interface Website {
  id: number;
  domain: string;
  displayName: string;
  status: "active" | "pending" | "paused";
  lastAnalyzed: string;
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
  displayName?: string;
}

export interface WebsiteUpdateRequest extends Partial<Omit<Website, 'id' | 'createdAt' | 'updatedAt'>> {
  domain?: string;
  displayName?: string;
}

export interface WebsiteAnalysisResult {
  id: number;
  websiteId: number;
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
  analyzedAt: string;
}

export interface WebsiteMetrics {
  websiteId: number;
  visibilityScore: number;
  averageRank: number;
  totalMentions: number;
  sentimentScore: number;
  trending: "up" | "down" | "stable";
  lastUpdated: string;
}