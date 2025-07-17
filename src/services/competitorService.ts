import { supabase } from "@/integrations/supabase/client";
import {
  Competitor,
  CompetitorInsert,
  CompetitorUpdate,
  AnalysisResult,
  LLMResult,
} from "@/types/database";
import BaseService from "./baseService";
import {
  competitorAnalysisService,
  type CompetitorShareOfVoice,
  type CompetitiveGapAnalysis,
  type CompetitorInsight,
} from "./competitorAnalysisService";

export interface CompetitorPerformance {
  competitorId: string;
  domain: string;
  name: string;
  shareOfVoice: number;
  averageRank: number;
  mentionCount: number;
  sentimentScore: number;
  visibilityScore: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  lastAnalyzed: string;
  isActive: boolean;
}

export interface CompetitorComparison {
  topic: string;
  yourBrand: number;
  competitors: Array<{
    competitorId: string;
    name: string;
    score: number;
  }>;
}

export interface CompetitorTimeSeriesData {
  date: string;
  competitors: Array<{
    competitorId: string;
    name: string;
    shareOfVoice: number;
    averageRank: number;
    mentionCount: number;
    sentimentScore: number;
  }>;
}

export interface CompetitorAnalytics {
  totalCompetitors: number;
  activeCompetitors: number;
  averageCompetitorRank: number;
  marketShareData: Array<{
    name: string;
    value: number;
    competitorId?: string;
  }>;
  competitiveGaps: CompetitorComparison[];
  timeSeriesData: CompetitorTimeSeriesData[];
  shareOfVoice: CompetitorShareOfVoice[];
  gapAnalysis: CompetitiveGapAnalysis[];
  insights: CompetitorInsight[];
}

export class OptimizedCompetitorService extends BaseService {
  private static instance: OptimizedCompetitorService;
  protected serviceName = "competitor" as const;
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  public static getInstance(): OptimizedCompetitorService {
    if (!OptimizedCompetitorService.instance) {
      OptimizedCompetitorService.instance = new OptimizedCompetitorService();
    }
    return OptimizedCompetitorService.instance;
  }

  /**
   * Get cached data or fetch new data
   */
  private async getCachedData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, { data, timestamp: now, ttl });
    return data;
  }

  /**
   * Clear cache for specific key or all cache
   */
  private clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get all competitors for a website (optimized)
   */
  async getCompetitors(websiteId: string): Promise<Competitor[]> {
    const cacheKey = `competitors_${websiteId}`;

    return this.getCachedData(cacheKey, async () => {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .select("*")
        .eq("website_id", websiteId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    });
  }

  /**
   * Get competitor performance metrics (optimized with database functions)
   */
  async getCompetitorPerformance(
    websiteId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CompetitorPerformance[]> {
    const cacheKey = `performance_${websiteId}_${dateRange?.start || "all"}_${
      dateRange?.end || "all"
    }`;

    return this.getCachedData(cacheKey, async () => {
      // First check if there are any competitors for this website
      const { data: competitors } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .select("id")
        .eq("website_id", websiteId)
        .eq("is_active", true)
        .limit(1);

      // If no competitors exist, return empty array immediately
      if (!competitors || competitors.length === 0) {
        return [];
      }

      // Use the optimized database function
      const { data, error } = await supabase.rpc("get_competitor_performance", {
        p_website_id: websiteId,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;

      // Transform database results to match interface with safe calculations
      return (data || []).map((row: Record<string, unknown>) => {
        const totalMentions = row.total_mentions || 0;
        const positiveMentions = row.positive_mentions || 0;
        const avgSentiment = row.avg_sentiment_score;
        const avgRank = row.avg_rank_position;
        const mentionTrend = row.mention_trend_7d;

        return {
          competitorId: row.competitor_id,
          domain: row.competitor_domain,
          name: row.competitor_name || row.competitor_domain,
          shareOfVoice:
            totalMentions > 0
              ? Math.round((positiveMentions / totalMentions) * 100)
              : 0,
          averageRank: avgRank && !isNaN(avgRank) ? avgRank : 0,
          mentionCount: totalMentions,
          sentimentScore:
            avgSentiment && !isNaN(avgSentiment)
              ? Math.round((avgSentiment + 1) * 50)
              : 50,
          visibilityScore:
            totalMentions > 0
              ? Math.round((positiveMentions / totalMentions) * 100)
              : 0,
          trend: this.calculateTrend(mentionTrend),
          trendPercentage:
            mentionTrend && !isNaN(mentionTrend) ? Math.abs(mentionTrend) : 0,
          lastAnalyzed: row.last_analysis_date || new Date().toISOString(),
          isActive: true,
        };
      });
    });
  }

  /**
   * Get competitor time series data (optimized with database functions)
   */
  async getCompetitorTimeSeriesData(
    websiteId: string,
    competitorDomain?: string,
    days: number = 30
  ): Promise<CompetitorTimeSeriesData[]> {
    const cacheKey = `timeseries_${websiteId}_${
      competitorDomain || "all"
    }_${days}`;

    return this.getCachedData(cacheKey, async () => {
      // First check if there are any competitors for this website
      const { data: competitors } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .select("id")
        .eq("website_id", websiteId)
        .eq("is_active", true)
        .limit(1);

      // If no competitors exist, return empty array immediately
      if (!competitors || competitors.length === 0) {
        return [];
      }

      const { data, error } = await supabase.rpc("get_competitor_time_series", {
        p_website_id: websiteId,
        p_competitor_domain: competitorDomain,
        p_days: days,
      });

      if (error) throw error;

      // Group by date
      const timeSeriesMap = new Map<string, CompetitorTimeSeriesData>();

      (data || []).forEach((row: Record<string, unknown>) => {
        const dateStr = row.analysis_date;
        if (!timeSeriesMap.has(dateStr)) {
          timeSeriesMap.set(dateStr, {
            date: dateStr,
            competitors: [],
          });
        }

        const dailyMentions = row.daily_mentions || 0;
        const dailyPositiveMentions = row.daily_positive_mentions || 0;
        const dailyAvgSentiment = row.daily_avg_sentiment;
        const dailyAvgRank = row.daily_avg_rank;

        timeSeriesMap.get(dateStr)!.competitors.push({
          competitorId: "", // Would need to join with competitors table
          name: row.competitor_domain,
          shareOfVoice:
            dailyMentions > 0
              ? Math.round((dailyPositiveMentions / dailyMentions) * 100)
              : 0,
          averageRank: dailyAvgRank && !isNaN(dailyAvgRank) ? dailyAvgRank : 0,
          mentionCount: dailyMentions,
          sentimentScore:
            dailyAvgSentiment && !isNaN(dailyAvgSentiment)
              ? Math.round((dailyAvgSentiment + 1) * 50)
              : 50,
        });
      });

      return Array.from(timeSeriesMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  }

  /**
   * Get competitive analysis (optimized with parallel queries)
   */
  async getCompetitiveAnalysis(
    websiteId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CompetitorAnalytics> {
    const cacheKey = `analytics_${websiteId}_${dateRange?.start || "all"}_${
      dateRange?.end || "all"
    }`;

    return this.getCachedData(cacheKey, async () => {
      // First check if there are any competitors for this website
      const { data: hasCompetitors } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .select("id")
        .eq("website_id", websiteId)
        .eq("is_active", true)
        .limit(1);

      // If no competitors exist, return empty analytics immediately
      if (!hasCompetitors || hasCompetitors.length === 0) {
        return {
          totalCompetitors: 0,
          activeCompetitors: 0,
          averageCompetitorRank: 0,
          marketShareData: [
            {
              name: "Your Brand",
              value: 0,
            },
          ],
          competitiveGaps: [],
          timeSeriesData: [],
          shareOfVoice: [],
          gapAnalysis: [],
          insights: [],
        };
      }

      // Execute all queries in parallel
      const [
        competitors,
        yourBrandResults,
        timeSeriesData,
        shareOfVoice,
        gapAnalysis,
        insights,
      ] = await Promise.all([
        this.getCompetitorPerformance(websiteId, dateRange),
        this.getAnalysisResultsForWebsite(websiteId, dateRange),
        this.getCompetitorTimeSeriesData(websiteId, undefined, 30),
        competitorAnalysisService.getCompetitorShareOfVoice(
          websiteId,
          dateRange
        ),
        competitorAnalysisService.getCompetitiveGapAnalysis(
          websiteId,
          dateRange
        ),
        competitorAnalysisService.getCompetitorInsights(websiteId, dateRange),
      ]);

      // Calculate your brand's metrics efficiently
      const yourBrandMetrics = this.calculateBrandMetrics(yourBrandResults);

      // Generate market share data using real competitor data
      const marketShareData = [
        {
          name: "Your Brand",
          value: yourBrandMetrics.overallVisibilityScore,
        },
        ...shareOfVoice.map((comp) => ({
          name: comp.competitorName,
          value: comp.shareOfVoice,
          competitorId: comp.competitorId,
        })),
      ];

      // Generate competitive gap analysis (legacy format for compatibility)
      const competitiveGaps = this.calculateCompetitiveGaps(
        competitors,
        yourBrandResults
      );

      return {
        totalCompetitors: competitors.length,
        activeCompetitors: competitors.filter((c) => c.isActive).length,
        averageCompetitorRank:
          competitors.length > 0
            ? competitors.reduce((sum, c) => sum + (c.averageRank || 0), 0) /
              competitors.length
            : 0,
        marketShareData,
        competitiveGaps,
        timeSeriesData,
        shareOfVoice,
        gapAnalysis,
        insights,
      };
    });
  }

  /**
   * Batch add competitors (optimized for multiple inserts)
   */
  async batchAddCompetitors(
    websiteId: string,
    competitors: Array<{ domain: string; name?: string }>
  ): Promise<Competitor[]> {
    try {
      // Check for existing competitors in batch
      const domains = competitors.map((c) => c.domain);
      const { data: existing } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .select("competitor_domain")
        .eq("website_id", websiteId)
        .in("competitor_domain", domains);

      const existingDomains = new Set(
        existing?.map((e) => e.competitor_domain) || []
      );
      const newCompetitors = competitors.filter(
        (c) => !existingDomains.has(c.domain)
      );

      if (newCompetitors.length === 0) {
        return [];
      }

      // Batch insert new competitors
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .insert(
          newCompetitors.map((comp) => ({
            website_id: websiteId,
            competitor_domain: comp.domain,
            competitor_name: comp.name || null,
            is_active: true,
          }))
        )
        .select();

      if (error) throw error;

      // Clear cache
      this.clearCache(`competitors_${websiteId}`);

      return data || [];
    } catch (error) {
      console.error("Failed to batch add competitors:", error);
      throw error;
    }
  }

  /**
   * Add a new competitor (optimized)
   */
  async addCompetitor(
    websiteId: string,
    domain: string,
    name?: string
  ): Promise<Competitor> {
    const result = await this.batchAddCompetitors(websiteId, [
      { domain, name },
    ]);
    if (result.length === 0) {
      throw new Error("Competitor already exists");
    }
    return result[0];
  }

  /**
   * Update competitor information (optimized)
   */
  async updateCompetitor(
    competitorId: string,
    updates: Partial<Pick<Competitor, "competitor_name" | "is_active">>
  ): Promise<Competitor> {
    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .update(updates)
        .eq("id", competitorId)
        .select("*, website_id")
        .single();

      if (error) throw error;

      // Clear relevant cache
      this.clearCache(`competitors_${data.website_id}`);

      return data;
    } catch (error) {
      console.error("Failed to update competitor:", error);
      throw error;
    }
  }

  /**
   * Delete/deactivate a competitor (optimized)
   */
  async deleteCompetitor(competitorId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("competitors")
        .update({ is_active: false })
        .eq("id", competitorId)
        .select("website_id")
        .single();

      if (error) throw error;

      // Clear relevant cache
      if (data) {
        this.clearCache(`competitors_${data.website_id}`);
      }
    } catch (error) {
      console.error("Failed to delete competitor:", error);
      throw error;
    }
  }

  /**
   * Export competitor data (optimized)
   */
  async exportCompetitorData(
    websiteId: string,
    format: "pdf" | "csv" | "json",
    dateRange?: { start: string; end: string }
  ): Promise<Blob> {
    try {
      // Use parallel execution for better performance
      const [competitors, analytics] = await Promise.all([
        this.getCompetitorPerformance(websiteId, dateRange),
        this.getCompetitiveAnalysis(websiteId, dateRange),
      ]);

      const exportData = {
        competitors,
        analytics,
        exportedAt: new Date().toISOString(),
        dateRange,
      };

      switch (format) {
        case "json":
          return new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
          });
        case "csv":
          return new Blob([this.convertToCSV(exportData)], {
            type: "text/csv",
          });
        case "pdf":
          // For PDF, return JSON for now (would need PDF library integration)
          return new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
          });
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error("Failed to export competitor data:", error);
      throw error;
    }
  }

  /**
   * Refresh materialized views (for real-time updates)
   */
  async refreshCompetitorViews(): Promise<void> {
    try {
      await supabase.rpc("refresh_competitor_performance_views");
      // Clear all cache after refresh
      this.clearCache();
    } catch (error) {
      console.error("Failed to refresh competitor views:", error);
      throw error;
    }
  }

  // Private helper methods

  private calculateTrend(trendValue: number | null): "up" | "down" | "stable" {
    if (!trendValue) return "stable";
    if (trendValue > 5) return "up";
    if (trendValue < -5) return "down";
    return "stable";
  }

  private calculateBrandMetrics(results: AnalysisResult[]): {
    overallVisibilityScore: number;
  } {
    if (results.length === 0) return { overallVisibilityScore: 0 };

    const allLLMResults = results.flatMap((r) => r.llm_results);
    const mentionedResults = allLLMResults.filter((r) => r.is_mentioned);

    const overallVisibilityScore = Math.round(
      (mentionedResults.length / Math.max(allLLMResults.length, 1)) * 100
    );

    return { overallVisibilityScore };
  }

  private calculateCompetitiveGaps(
    competitors: CompetitorPerformance[],
    yourBrandResults: AnalysisResult[]
  ): CompetitorComparison[] {
    // Group your brand's results by topic
    const topicMap = new Map<string, number>();

    yourBrandResults.forEach((result) => {
      const mentionedCount = result.llm_results.filter(
        (r) => r.is_mentioned
      ).length;
      const totalCount = result.llm_results.length;
      const score = totalCount > 0 ? (mentionedCount / totalCount) * 100 : 0;

      if (!topicMap.has(result.topic)) {
        topicMap.set(result.topic, 0);
      }
      topicMap.set(result.topic, topicMap.get(result.topic)! + score);
    });

    // Create competitive gaps for each topic
    const gaps: CompetitorComparison[] = [];

    topicMap.forEach((yourScore, topic) => {
      gaps.push({
        topic,
        yourBrand: Math.round(yourScore),
        competitors: competitors.slice(0, 3).map((comp) => ({
          competitorId: comp.competitorId,
          name: comp.name,
          score: Math.round(comp.shareOfVoice * 0.8 + Math.random() * 0.4), // Would need real competitor topic analysis
        })),
      });
    });

    return gaps;
  }

  private convertToCSV(data: {
    competitors: CompetitorPerformance[];
    analytics: CompetitorAnalytics;
  }): string {
    const { competitors, analytics } = data;

    let csv = "Competitor Analysis Export\n\n";

    // Competitors section
    csv += "Competitors\n";
    csv +=
      "Name,Domain,Share of Voice,Average Rank,Mentions,Sentiment Score,Trend\n";
    competitors.forEach((comp) => {
      csv += `${comp.name},${comp.domain},${comp.shareOfVoice}%,${comp.averageRank},${comp.mentionCount},${comp.sentimentScore}%,${comp.trend}\n`;
    });
    csv += "\n";

    // Market share section
    csv += "Market Share\n";
    csv += "Name,Share of Voice\n";
    analytics.marketShareData.forEach((item) => {
      csv += `${item.name},${item.value}%\n`;
    });
    csv += "\n";

    // Competitive gaps section
    csv += "Competitive Gaps\n";
    csv += "Topic,Your Brand";
    if (analytics.competitiveGaps.length > 0) {
      analytics.competitiveGaps[0]!.competitors.forEach((comp) => {
        csv += `,${comp.name}`;
      });
    }
    csv += "\n";

    analytics.competitiveGaps.forEach((gap) => {
      csv += `${gap.topic},${gap.yourBrand}`;
      gap.competitors.forEach((comp) => {
        csv += `,${comp.score}`;
      });
      csv += "\n";
    });

    return csv;
  }

  /**
   * Get analysis results for a website (optimized with better query)
   */
  private async getAnalysisResultsForWebsite(
    websiteId: string,
    dateRange?: { start: string; end: string }
  ): Promise<AnalysisResult[]> {
    // Use a more efficient query with proper joins
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
            topic_keywords,
            website_id
          )
        )
      `
      )
      .eq("website_id", websiteId)
      .order("analyzed_at", { ascending: false });

    if (dateRange) {
      query = query
        .gte("analyzed_at", dateRange.start)
        .lte("analyzed_at", dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Efficiently transform data
    const resultsMap = new Map<string, AnalysisResult>();

    data?.forEach((row) => {
      const topic = row.prompts?.topics;
      if (!topic) return;

      const topicName = topic.topic_name;

      if (!resultsMap.has(topicName)) {
        resultsMap.set(topicName, {
          topic_name: topicName,
          topic_keywords: topic.topic_keywords || [],
          llm_results: [],
          total_mentions: 0,
          avg_rank: null,
          avg_confidence: null,
          avg_sentiment: null,
        });
      }

      const analysisResult = resultsMap.get(topicName)!;
      analysisResult.llm_results.push({
        llm_provider: row.llm_provider,
        is_mentioned: row.is_mentioned || false,
        rank_position: row.rank_position,
        confidence_score: row.confidence_score,
        sentiment_score: row.sentiment_score,
        summary_text: row.summary_text,
        response_text: row.response_text,
        analyzed_at: row.analyzed_at || new Date().toISOString(),
      });
    });

    return Array.from(resultsMap.values());
  }

  /**
   * Trigger competitor analysis for new LLM responses
   */
  async analyzeCompetitorsInResponse(
    websiteId: string,
    promptId: string,
    llmProvider: string,
    responseText: string
  ): Promise<void> {
    try {
      // Get all active competitors for this website
      const competitors = await this.getCompetitors(websiteId);

      if (competitors.length === 0) {
        return; // No competitors to analyze
      }

      // Create response map for batch analysis
      const responseTextMap = new Map<string, string>();
      responseTextMap.set(promptId, responseText);

      // Analyze all competitors for this response
      await competitorAnalysisService.batchAnalyzeCompetitors(
        websiteId,
        competitors.map((c) => c.id),
        [promptId],
        llmProvider,
        responseTextMap
      );

      // Clear cache to ensure fresh data on next request
      this.clearCache();
    } catch (error) {
      console.error("Error analyzing competitors in response:", error);
      // Don't throw - this is a background operation
    }
  }

  /**
   * Get enhanced share of voice data
   */
  async getEnhancedShareOfVoice(
    websiteId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CompetitorShareOfVoice[]> {
    const cacheKey = `enhanced_sov_${websiteId}_${dateRange?.start || "all"}_${
      dateRange?.end || "all"
    }`;

    return this.getCachedData(cacheKey, async () => {
      return competitorAnalysisService.getCompetitorShareOfVoice(
        websiteId,
        dateRange
      );
    });
  }

  /**
   * Get enhanced competitive gap analysis
   */
  async getEnhancedCompetitiveGaps(
    websiteId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CompetitiveGapAnalysis[]> {
    const cacheKey = `enhanced_gaps_${websiteId}_${dateRange?.start || "all"}_${
      dateRange?.end || "all"
    }`;

    return this.getCachedData(cacheKey, async () => {
      return competitorAnalysisService.getCompetitiveGapAnalysis(
        websiteId,
        dateRange
      );
    });
  }

  /**
   * Get competitor insights
   */
  async getCompetitorInsights(
    websiteId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CompetitorInsight[]> {
    const cacheKey = `insights_${websiteId}_${dateRange?.start || "all"}_${
      dateRange?.end || "all"
    }`;

    return this.getCachedData(cacheKey, async () => {
      return competitorAnalysisService.getCompetitorInsights(
        websiteId,
        dateRange
      );
    });
  }

  /**
   * Refresh all competitor analysis data
   */
  async refreshCompetitorAnalysis(): Promise<void> {
    try {
      await competitorAnalysisService.refreshCompetitorAnalysisViews();
      this.clearCache(); // Clear all cached data
    } catch (error) {
      console.error("Error refreshing competitor analysis:", error);
      throw error;
    }
  }
}

// Export the optimized service as the default
export const competitorService = OptimizedCompetitorService.getInstance();
