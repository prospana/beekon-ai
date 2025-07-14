import { supabase } from "@/integrations/supabase/client";
import { sendN8nWebhook } from "@/lib/http-request";
import { AnalysisResult, LLMResult, UIAnalysisResult } from "@/types/database";

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

  // Shared data transformation function to standardize logic
  private transformAnalysisData(
    data: Record<string, unknown>[],
    websiteId?: string
  ): UIAnalysisResult[] {
    const resultsMap = new Map<string, UIAnalysisResult>();

    data?.forEach((row) => {
      const promptId = row.prompt_id as string;
      if (!promptId) {
        // Skip rows with null prompt_id
        return;
      }

      // Handle different data structures (with joins vs without)
      let promptText: string;
      let topicName: string;
      let resultWebsiteId: string;

      if (row.prompts) {
        // Data from joined query
        const prompt = row.prompts as {
          prompt_text: string;
          topics: { topic_name: string };
        };
        promptText = prompt.prompt_text;
        topicName = prompt.topics.topic_name;
        resultWebsiteId = websiteId || (row.website_id as string);
      } else {
        // Data from direct query (export function)
        promptText =
          ((row.prompts as Record<string, unknown>)?.prompt_text as string) ||
          "Unknown prompt";
        topicName =
          ((
            (row.prompts as Record<string, unknown>)?.topics as Record<
              string,
              unknown
            >
          )?.topic_name as string) || "Unknown topic";
        resultWebsiteId = row.website_id as string;
      }

      if (!resultsMap.has(promptId)) {
        resultsMap.set(promptId, {
          id: promptId,
          prompt: promptText,
          website_id: resultWebsiteId,
          topic: topicName,
          status: "completed" as AnalysisStatus,
          confidence: (row.confidence_score as number) || 0,
          created_at:
            (row.analyzed_at as string) ||
            (row.created_at as string) ||
            new Date().toISOString(),
          updated_at: (row.created_at as string) || new Date().toISOString(),
          llm_results: [],
        });
      }

      const result = resultsMap.get(promptId)!;
      result.llm_results.push({
        llm_provider: row.llm_provider as string,
        is_mentioned: (row.is_mentioned as boolean) || false,
        rank_position: row.rank_position as number,
        confidence_score: row.confidence_score as number,
        sentiment_score: row.sentiment_score as number,
        summary_text: row.summary_text as string,
        response_text: row.response_text as string,
        analyzed_at:
          (row.analyzed_at as string) ||
          (row.created_at as string) ||
          new Date().toISOString(),
      });
    });

    return Array.from(resultsMap.values());
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
  ): Promise<UIAnalysisResult[]> {
    // Build the base query without LLM provider filter
    let query = supabase
      .schema("beekon_data")
      .from("llm_analysis_results")
      .select(
        `
        *,
        prompts!inner (
          prompt_text,
          topics!inner (
            id,
            topic_name,
            website_id
          )
        )
      `
      )
      .eq("prompts.topics.website_id", websiteId)
      .order("created_at", { ascending: false });

    // Apply topic filter (filter by topic ID, not name)
    if (filters?.topic && filters.topic !== "all") {
      console.log("Applying topic filter:", filters.topic);
      query = query.eq("prompts.topics.id", filters.topic);
    }

    // Apply date range filter
    if (filters?.dateRange) {
      query = query
        .gte("created_at", filters.dateRange.start)
        .lte("created_at", filters.dateRange.end);
    }

    // Apply search query filter with proper escaping and security
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery
        .trim()
        .replace(/[%_\\]/g, "\\$&") // Escape SQL wildcards and backslashes
        .replace(/'/g, "''"); // Escape single quotes for SQL

      console.log("Applying search filter:", searchTerm);

      // Use correct Supabase OR query syntax
      query = query.or(
        `prompts.prompt_text.ilike.%${searchTerm}%,prompts.topics.topic_name.ilike.%${searchTerm}%,response_text.ilike.%${searchTerm}%`
      );
    }

    console.log("Executing query with filters:", filters);
    const { data, error } = await query;

    if (error) {
      console.error("Database query error:", error);
      console.error("Query filters:", filters);
      throw error;
    }

    console.log("Query returned", data?.length || 0, "rows");

    // Transform data using the shared transformation function
    let results = this.transformAnalysisData(data, websiteId);

    // Apply LLM provider filter at the data transformation level
    if (filters?.llmProvider && filters.llmProvider !== "all") {
      results = results
        .filter((result) => {
          // Keep only prompts that have results from the specified LLM provider
          return result.llm_results.some(
            (llm) => llm.llm_provider === filters.llmProvider
          );
        })
        .map((result) => {
          // For display purposes, we can optionally highlight the filtered LLM results
          // but keep all LLM results to maintain data integrity
          return {
            ...result,
            llm_results: result.llm_results.map((llm) => ({
              ...llm,
              // Add a flag to indicate if this is the filtered provider for UI highlighting
              isFiltered: llm.llm_provider === filters.llmProvider,
            })),
          };
        });
    }

    return results;
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
    try {
      // Fetch all analysis results for the given IDs
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("llm_analysis_results")
        .select(
          `
          *,
          prompts (
            id,
            prompt_text,
            topics (
              topic_name,
              topic_keywords
            )
          )
        `
        )
        .in("prompt_id", analysisIds);

      if (error) throw error;

      // Transform data using the shared transformation function
      const results = this.transformAnalysisData(data);

      // Generate export based on format
      switch (format) {
        case "json":
          return this.generateJsonExport(results);
        case "csv":
          return this.generateCsvExport(results);
        case "pdf":
          return this.generatePdfExport(results);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error("Failed to export analysis results:", error);
      throw error;
    }
  }

  private generateJsonExport(results: UIAnalysisResult[]): Blob {
    const exportData = {
      analysisResults: results,
      exportedAt: new Date().toISOString(),
      totalResults: results.length,
      totalLLMResults: results.reduce(
        (sum, r) => sum + r.llm_results.length,
        0
      ),
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
  }

  private generateCsvExport(results: UIAnalysisResult[]): Blob {
    const headers = [
      "Analysis ID",
      "Prompt",
      "Topic",
      "Website ID",
      "Status",
      "Confidence",
      "Created At",
      "LLM Provider",
      "Mentioned",
      "Rank Position",
      "Confidence Score",
      "Sentiment Score",
      "Response Text",
      "Analyzed At",
    ];

    let csvContent = headers.join(",") + "\n";

    results.forEach((result) => {
      result.llm_results.forEach((llmResult) => {
        const row = [
          result.id,
          `"${result.prompt.replace(/"/g, '""')}"`, // Escape quotes
          result.topic,
          result.website_id,
          result.status,
          result.confidence,
          result.created_at,
          llmResult.llm_provider,
          llmResult.is_mentioned ? "Yes" : "No",
          llmResult.rank_position || "",
          llmResult.confidence_score || "",
          llmResult.sentiment_score || "",
          `"${(llmResult.response_text || "").replace(/"/g, '""')}"`, // Escape quotes
          llmResult.analyzed_at,
        ];
        csvContent += row.join(",") + "\n";
      });
    });

    return new Blob([csvContent], { type: "text/csv" });
  }

  private generatePdfExport(results: UIAnalysisResult[]): Blob {
    // For now, generate a structured text document that can be saved as PDF
    // In a production environment, you would use a PDF library like jsPDF or Puppeteer

    let pdfContent = "ANALYSIS RESULTS EXPORT\n";
    pdfContent += "========================\n\n";
    pdfContent += `Exported on: ${new Date().toLocaleString()}\n`;
    pdfContent += `Total Analysis Results: ${results.length}\n`;
    pdfContent += `Total LLM Results: ${results.reduce(
      (sum, r) => sum + r.llm_results.length,
      0
    )}\n\n`;

    results.forEach((result, index) => {
      pdfContent += `${index + 1}. ANALYSIS RESULT\n`;
      pdfContent += `-`.repeat(50) + "\n";
      pdfContent += `ID: ${result.id}\n`;
      pdfContent += `Prompt: ${result.prompt}\n`;
      pdfContent += `Topic: ${result.topic}\n`;
      pdfContent += `Confidence: ${result.confidence}%\n`;
      pdfContent += `Created: ${new Date(
        result.created_at
      ).toLocaleString()}\n\n`;

      pdfContent += "LLM RESULTS:\n";
      result.llm_results.forEach((llm, llmIndex) => {
        pdfContent += `  ${llmIndex + 1}. ${llm.llm_provider.toUpperCase()}\n`;
        pdfContent += `     Mentioned: ${llm.is_mentioned ? "Yes" : "No"}\n`;
        if (llm.rank_position) {
          pdfContent += `     Rank: ${llm.rank_position}\n`;
        }
        if (llm.sentiment_score !== null) {
          pdfContent += `     Sentiment: ${
            llm.sentiment_score > 0.1
              ? "Positive"
              : llm.sentiment_score < -0.1
              ? "Negative"
              : "Neutral"
          }\n`;
        }
        if (llm.response_text) {
          pdfContent += `     Response: ${llm.response_text}\n`;
        }
        pdfContent += "\n";
      });

      pdfContent += "\n";
    });

    return new Blob([pdfContent], { type: "text/plain" });
  }
}

export const analysisService = AnalysisService.getInstance();
