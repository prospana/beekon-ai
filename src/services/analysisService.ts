import { supabase } from "@/integrations/supabase/client";
import { sendN8nWebhook } from "@/lib/http-request";
import { AnalysisResult, LLMResult } from "@/types/database";

export type AnalysisStatus = "pending" | "running" | "completed" | "failed";

export interface AnalysisConfig {
  analysisName: string;
  websiteId: string;
  topics: string[];
  customPrompts: string[];
  llmModels: string[];
  priority: "high" | "medium" | "low";
  analysisType: "comprehensive" | "focused" | "competitive";
  includeCompetitors: boolean;
  generateReport: boolean;
  scheduleAnalysis: boolean;
}

// Re-export for backward compatibility
export type { AnalysisResult, LLMResult };

export interface AnalysisProgress {
  analysisId: string;
  status: AnalysisStatus;
  progress: number;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  error?: string;
}

export class AnalysisService {
  private static instance: AnalysisService;
  private progressCallbacks: Map<string, (progress: AnalysisProgress) => void> =
    new Map();

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  async createAnalysis(config: AnalysisConfig): Promise<string> {
    try {
      // First, create topics if they don't exist
      const topicIds = await this.ensureTopicsExist(
        config.websiteId,
        config.topics
      );

      // Create prompts for each topic
      const promptIds = await this.createPrompts(
        config.customPrompts,
        topicIds
      );

      // Start the analysis process
      const analysisId = await this.startAnalysis(config, promptIds);

      // Trigger N8N webhook for actual analysis
      await this.triggerAnalysisWebhook(analysisId, config);

      return analysisId;
    } catch (error) {
      console.error("Failed to create analysis:", error);
      throw error;
    }
  }

  private async ensureTopicsExist(
    websiteId: string,
    topics: string[]
  ): Promise<string[]> {
    const topicIds: string[] = [];

    for (const topicName of topics) {
      // Check if topic already exists
      const { data: existingTopic } = await supabase
        .schema("beekon_data")
        .from("topics")
        .select("id")
        .eq("website_id", websiteId)
        .eq("topic_name", topicName)
        .single();

      if (existingTopic) {
        topicIds.push(existingTopic.id);
      } else {
        // Create new topic
        const { data: newTopic, error } = await supabase
          .schema("beekon_data")
          .from("topics")
          .insert({
            website_id: websiteId,
            topic_name: topicName,
            is_active: true,
          })
          .select("id")
          .single();

        if (error) throw error;
        topicIds.push(newTopic.id);
      }
    }

    return topicIds;
  }

  private async createPrompts(
    customPrompts: string[],
    topicIds: string[]
  ): Promise<string[]> {
    const promptIds: string[] = [];

    for (let i = 0; i < customPrompts.length; i++) {
      const prompt = customPrompts[i];
      const topicId = topicIds[i % topicIds.length]; // Cycle through topics

      const { data: newPrompt, error } = await supabase
        .schema("beekon_data")
        .from("prompts")
        .insert({
          prompt_text: prompt,
          topic_id: topicId,
          is_active: true,
          priority: 1,
          prompt_type: "custom",
        })
        .select("id")
        .single();

      if (error) throw error;
      promptIds.push(newPrompt.id);
    }

    return promptIds;
  }

  private async startAnalysis(
    config: AnalysisConfig,
    promptIds: string[]
  ): Promise<string> {
    // Create analysis record (we'll use a UUID as analysis ID)
    const analysisId = crypto.randomUUID();

    // Initialize progress tracking
    this.updateProgress(analysisId, {
      analysisId,
      status: "pending",
      progress: 0,
      currentStep: "Initializing analysis...",
      completedSteps: 0,
      totalSteps: promptIds.length * config.llmModels.length,
    });

    return analysisId;
  }

  private async triggerAnalysisWebhook(
    analysisId: string,
    config: AnalysisConfig
  ) {
    try {
      const webhookPayload = {
        analysisId,
        config,
        timestamp: new Date().toISOString(),
      };

      await sendN8nWebhook("analysis/start", webhookPayload);

      this.updateProgress(analysisId, {
        analysisId,
        status: "running",
        progress: 10,
        currentStep: "Starting LLM analysis...",
        completedSteps: 0,
        totalSteps: config.llmModels.length * config.customPrompts.length,
      });
    } catch (error) {
      this.updateProgress(analysisId, {
        analysisId,
        status: "failed",
        progress: 0,
        currentStep: "Failed to start analysis",
        completedSteps: 0,
        totalSteps: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async getAnalysisResults(
    websiteId: string,
    filters?: {
      topic?: string;
      llmProvider?: string;
      status?: AnalysisStatus;
      dateRange?: { start: string; end: string };
      searchQuery?: string;
    }
  ): Promise<AnalysisResult[]> {
    let query = supabase
      .schema("beekon_data")
      .from("llm_analysis_results")
      .select(
        `
        *,
        prompts!inner (
          prompt_text,
          topics!inner (
            topic_name,
            website_id
          )
        )
      `
      )
      .eq("prompts.topics.website_id", websiteId)
      .order("created_at", { ascending: false });

    if (filters?.topic && filters.topic !== "all") {
      query = query.eq("prompts.topics.topic_name", filters.topic);
    }

    if (filters?.llmProvider && filters.llmProvider !== "all") {
      query = query.eq("llm_provider", filters.llmProvider);
    }

    if (filters?.dateRange) {
      query = query
        .gte("created_at", filters.dateRange.start)
        .lte("created_at", filters.dateRange.end);
    }

    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.trim();
      query = query.or(
        `prompts.prompt_text.ilike.%${searchTerm}%,prompts.topics.topic_name.ilike.%${searchTerm}%,response_text.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform data to match expected format
    const resultsMap = new Map<string, AnalysisResult>();

    data?.forEach((row) => {
      const promptId = row.prompt_id;
      if (!promptId) {
        // Skip rows with null prompt_id
        return;
      }
      const prompt = row.prompts as {
        prompt_text: string;
        topics: { topic_name: string };
      };

      if (!resultsMap.has(promptId)) {
        resultsMap.set(promptId, {
          id: promptId,
          prompt: prompt.prompt_text,
          website_id: websiteId,
          topic: prompt.topics.topic_name,
          status: "completed" as AnalysisStatus,
          confidence: row.confidence_score || 0,
          created_at: row.created_at || "",
          updated_at: row.created_at || "",
          llm_results: [],
        });
      }

      const result = resultsMap.get(promptId)!;
      result.llm_results.push({
        id: row.id,
        llm_provider: row.llm_provider,
        is_mentioned: row.is_mentioned || false,
        rank_position: row.rank_position,
        sentiment_score: row.sentiment_score,
        response_text: row.response_text,
        confidence_score: row.confidence_score,
        analyzed_at: row.analyzed_at || row.created_at || "",
      });
    });

    return Array.from(resultsMap.values());
  }

  async getTopicsForWebsite(
    websiteId: string
  ): Promise<Array<{ id: string; name: string; resultCount: number }>> {
    const { data, error } = await supabase
      .schema("beekon_data")
      .from("topics")
      .select(
        `
        id, 
        topic_name,
        prompts!inner (
          id,
          llm_analysis_results (
            id
          )
        )
      `
      )
      .eq("website_id", websiteId)
      .eq("is_active", true)
      .order("topic_name");

    if (error) throw error;

    return (
      data?.map((topic) => {
        const resultCount =
          topic.prompts?.reduce((total, prompt) => {
            return total + (prompt.llm_analysis_results?.length || 0);
          }, 0) || 0;

        return {
          id: topic.id,
          name: topic.topic_name,
          resultCount,
        };
      }) || []
    );
  }

  async getAvailableLLMProviders(
    websiteId: string
  ): Promise<Array<{ id: string; name: string; resultCount: number }>> {
    const { data, error } = await supabase
      .schema("beekon_data")
      .from("llm_analysis_results")
      .select(
        `
        llm_provider,
        prompts!inner (
          topics!inner (
            website_id
          )
        )
      `
      )
      .eq("prompts.topics.website_id", websiteId);

    if (error) throw error;

    // Count results by LLM provider
    const providerCounts = new Map<string, number>();
    data?.forEach((result) => {
      const provider = result.llm_provider;
      providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
    });

    // Map to display format with proper names
    const providerNames = {
      chatgpt: "ChatGPT",
      claude: "Claude",
      gemini: "Gemini",
      perplexity: "Perplexity",
    };

    return Array.from(providerCounts.entries()).map(([id, count]) => ({
      id,
      name: providerNames[id as keyof typeof providerNames] || id,
      resultCount: count,
    }));
  }

  subscribeToProgress(
    analysisId: string,
    callback: (progress: AnalysisProgress) => void
  ) {
    this.progressCallbacks.set(analysisId, callback);
  }

  unsubscribeFromProgress(analysisId: string) {
    this.progressCallbacks.delete(analysisId);
  }

  private updateProgress(analysisId: string, progress: AnalysisProgress) {
    const callback = this.progressCallbacks.get(analysisId);
    if (callback) {
      callback(progress);
    }
  }

  // This method would be called by webhook handlers or polling
  async handleAnalysisUpdate(
    analysisId: string,
    update: Partial<AnalysisProgress>
  ) {
    const callback = this.progressCallbacks.get(analysisId);
    if (callback) {
      const currentProgress = this.getCurrentProgress(analysisId);
      callback({ ...currentProgress, ...update });
    }
  }

  private getCurrentProgress(analysisId: string): AnalysisProgress {
    // This would typically be stored in a state management system
    // For now, returning a default progress
    return {
      analysisId,
      status: "running",
      progress: 0,
      currentStep: "Processing...",
      completedSteps: 0,
      totalSteps: 1,
    };
  }

  async saveAnalysisResult(result: {
    promptId: string;
    llmProvider: string;
    websiteId: string;
    isMentioned: boolean;
    rankPosition?: number;
    sentimentScore?: number;
    responseText?: string;
    confidenceScore?: number;
  }) {
    const { error } = await supabase
      .schema("beekon_data")
      .from("llm_analysis_results")
      .insert({
        prompt_id: result.promptId,
        llm_provider: result.llmProvider,
        website_id: result.websiteId,
        is_mentioned: result.isMentioned,
        rank_position: result.rankPosition,
        sentiment_score: result.sentimentScore,
        response_text: result.responseText,
        confidence_score: result.confidenceScore,
        analyzed_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  async exportAnalysisResults(
    analysisIds: string[],
    format: "pdf" | "csv" | "json"
  ): Promise<Blob> {
    // This would integrate with the export service
    // For now, returning a mock blob
    const mockData = JSON.stringify({
      analysisIds,
      format,
      timestamp: new Date().toISOString(),
    });
    return new Blob([mockData], { type: "application/json" });
  }
}

export const analysisService = AnalysisService.getInstance();
