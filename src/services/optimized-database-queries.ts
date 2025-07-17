import { supabase } from "@/integrations/supabase/client";
import { requestDeduplicator } from "@/lib/enhanced-query-client";

// Optimized database queries with better indexing and reduced data transfer
export class OptimizedDatabaseQueries {
  private static instance: OptimizedDatabaseQueries;

  public static getInstance(): OptimizedDatabaseQueries {
    if (!OptimizedDatabaseQueries.instance) {
      OptimizedDatabaseQueries.instance = new OptimizedDatabaseQueries();
    }
    return OptimizedDatabaseQueries.instance;
  }

  /**
   * Optimized dashboard metrics query with single database call
   */
  async getDashboardMetricsOptimized(
    websiteIds: string[],
    dateRange?: { start: string; end: string }
  ) {
    const cacheKey = `dashboard-metrics-${websiteIds.join(',')}-${dateRange?.start || 'all'}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      // Single optimized query that gets all needed data
      let query = supabase
        .schema("beekon_data")
        .rpc('get_dashboard_metrics_optimized', {
          website_ids: websiteIds,
          start_date: dateRange?.start || null,
          end_date: dateRange?.end || null,
        });

      const { data, error } = await query;
      if (error) throw error;

      return data;
    });
  }

  /**
   * Batch competitor data with optimized joins
   */
  async getCompetitorDataBatch(websiteIds: string[]) {
    const cacheKey = `competitors-batch-${websiteIds.join(',')}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      // Use stored procedure for complex competitor analytics
      const { data, error } = await supabase
        .schema("beekon_data")
        .rpc('get_competitor_analytics_batch', {
          website_ids: websiteIds,
        });

      if (error) throw error;
      return data;
    });
  }

  /**
   * Optimized analysis results with pagination and filtering
   */
  async getAnalysisResultsOptimized(
    websiteId: string,
    options: {
      limit?: number;
      offset?: number;
      dateRange?: { start: string; end: string };
      topics?: string[];
      llmProviders?: string[];
    } = {}
  ) {
    const { limit = 50, offset = 0, dateRange, topics, llmProviders } = options;
    const cacheKey = `analysis-${websiteId}-${JSON.stringify(options)}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      // Use optimized view with pre-computed aggregations
      let query = supabase
        .schema("beekon_data")
        .from("analysis_results_optimized_view")
        .select(`
          id,
          prompt_text,
          topic_name,
          website_id,
          confidence_score,
          created_at,
          llm_results_summary,
          performance_metrics
        `)
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (dateRange) {
        query = query
          .gte("created_at", dateRange.start)
          .lte("created_at", dateRange.end);
      }

      if (topics && topics.length > 0) {
        query = query.in("topic_name", topics);
      }

      if (llmProviders && llmProviders.length > 0) {
        query = query.overlaps("llm_providers", llmProviders);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data, count };
    });
  }

  /**
   * Time-series data with pre-aggregated values
   */
  async getTimeSeriesDataOptimized(
    websiteIds: string[],
    period: "7d" | "30d" | "90d"
  ) {
    const cacheKey = `timeseries-${websiteIds.join(',')}-${period}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      // Use materialized view for time-series data
      const { data, error } = await supabase
        .schema("beekon_data")
        .rpc('get_timeseries_aggregated', {
          website_ids: websiteIds,
          period_days: period === "7d" ? 7 : period === "30d" ? 30 : 90,
        });

      if (error) throw error;
      return data;
    });
  }

  /**
   * Topic performance with ranking and trends
   */
  async getTopicPerformanceOptimized(
    websiteIds: string[],
    limit: number = 10
  ) {
    const cacheKey = `topics-${websiteIds.join(',')}-${limit}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      const { data, error } = await supabase
        .schema("beekon_data")
        .rpc('get_topic_performance_ranked', {
          website_ids: websiteIds,
          result_limit: limit,
        });

      if (error) throw error;
      return data;
    });
  }

  /**
   * Website performance comparison
   */
  async getWebsitePerformanceOptimized(websiteIds: string[]) {
    const cacheKey = `website-performance-${websiteIds.join(',')}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      // Parallel queries for website data and metrics
      const [websiteInfo, performanceMetrics] = await Promise.all([
        supabase
          .schema("beekon_data")
          .from("websites")
          .select("id, domain, display_name, is_active, created_at")
          .in("id", websiteIds),
        
        supabase
          .schema("beekon_data")
          .rpc('get_website_performance_metrics', {
            website_ids: websiteIds,
          })
      ]);

      if (websiteInfo.error) throw websiteInfo.error;
      if (performanceMetrics.error) throw performanceMetrics.error;

      // Combine website info with performance metrics
      const combined = websiteInfo.data?.map(website => {
        const metrics = performanceMetrics.data?.find(m => m.website_id === website.id);
        return {
          ...website,
          ...metrics,
        };
      });

      return combined || [];
    });
  }

  /**
   * Search functionality with full-text search
   */
  async searchAnalysisResults(
    websiteIds: string[],
    searchQuery: string,
    options: {
      limit?: number;
      offset?: number;
      filters?: {
        topics?: string[];
        dateRange?: { start: string; end: string };
        sentimentRange?: { min: number; max: number };
      };
    } = {}
  ) {
    const { limit = 20, offset = 0, filters } = options;
    const cacheKey = `search-${websiteIds.join(',')}-${searchQuery}-${JSON.stringify(options)}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      const { data, error } = await supabase
        .schema("beekon_data")
        .rpc('search_analysis_results', {
          website_ids: websiteIds,
          search_query: searchQuery,
          result_limit: limit,
          result_offset: offset,
          topic_filters: filters?.topics || null,
          start_date: filters?.dateRange?.start || null,
          end_date: filters?.dateRange?.end || null,
          min_sentiment: filters?.sentimentRange?.min || null,
          max_sentiment: filters?.sentimentRange?.max || null,
        });

      if (error) throw error;
      return data;
    });
  }

  /**
   * Bulk operations for better performance
   */
  async bulkUpdateAnalysisResults(
    updates: Array<{
      id: string;
      updates: Record<string, any>;
    }>
  ) {
    // Use batch update for better performance
    const { data, error } = await supabase
      .schema("beekon_data")
      .rpc('bulk_update_analysis_results', {
        updates: updates,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Analytics aggregation with caching
   */
  async getAnalyticsAggregation(
    websiteIds: string[],
    aggregationType: 'daily' | 'weekly' | 'monthly',
    dateRange: { start: string; end: string }
  ) {
    const cacheKey = `analytics-agg-${websiteIds.join(',')}-${aggregationType}-${dateRange.start}-${dateRange.end}`;
    
    return requestDeduplicator.deduplicate(cacheKey, async () => {
      const { data, error } = await supabase
        .schema("beekon_data")
        .rpc('get_analytics_aggregation', {
          website_ids: websiteIds,
          aggregation_type: aggregationType,
          start_date: dateRange.start,
          end_date: dateRange.end,
        });

      if (error) throw error;
      return data;
    });
  }

  /**
   * Clear all query caches
   */
  clearCache() {
    requestDeduplicator.clear();
  }
}

export const optimizedDbQueries = OptimizedDatabaseQueries.getInstance();

// SQL functions that should be created in Supabase for optimal performance
export const REQUIRED_SQL_FUNCTIONS = `
-- Dashboard metrics optimization
CREATE OR REPLACE FUNCTION get_dashboard_metrics_optimized(
  website_ids UUID[],
  start_date TIMESTAMP DEFAULT NULL,
  end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH analysis_data AS (
    SELECT 
      lar.*,
      p.topic_id,
      t.topic_name,
      t.website_id
    FROM llm_analysis_results lar
    JOIN prompts p ON lar.prompt_id = p.id
    JOIN topics t ON p.topic_id = t.id
    WHERE t.website_id = ANY(website_ids)
      AND (start_date IS NULL OR lar.created_at >= start_date)
      AND (end_date IS NULL OR lar.created_at <= end_date)
  ),
  metrics AS (
    SELECT 
      COUNT(*) as total_analyses,
      COUNT(DISTINCT website_id) as active_websites,
      COUNT(CASE WHEN is_mentioned THEN 1 END) as total_mentions,
      AVG(CASE WHEN is_mentioned AND rank_position IS NOT NULL THEN rank_position END) as avg_ranking,
      AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END) as avg_sentiment,
      (COUNT(CASE WHEN is_mentioned THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100) as visibility_score
    FROM analysis_data
  )
  SELECT json_build_object(
    'overallVisibilityScore', COALESCE(visibility_score, 0),
    'averageRanking', COALESCE(avg_ranking, 0),
    'totalMentions', COALESCE(total_mentions, 0),
    'sentimentScore', COALESCE((avg_sentiment + 1) * 50, 0),
    'totalAnalyses', COALESCE(total_analyses, 0),
    'activeWebsites', COALESCE(active_websites, 0)
  ) INTO result
  FROM metrics;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Time series aggregation
CREATE OR REPLACE FUNCTION get_timeseries_aggregated(
  website_ids UUID[],
  period_days INTEGER
)
RETURNS TABLE(
  date DATE,
  visibility NUMERIC,
  mentions BIGINT,
  sentiment NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '1 day' * period_days,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as date
  ),
  daily_metrics AS (
    SELECT 
      lar.created_at::DATE as date,
      COUNT(*) as total_results,
      COUNT(CASE WHEN lar.is_mentioned THEN 1 END) as mentions,
      AVG(CASE WHEN lar.sentiment_score IS NOT NULL THEN lar.sentiment_score END) as avg_sentiment
    FROM llm_analysis_results lar
    JOIN prompts p ON lar.prompt_id = p.id
    JOIN topics t ON p.topic_id = t.id
    WHERE t.website_id = ANY(website_ids)
      AND lar.created_at >= CURRENT_DATE - INTERVAL '1 day' * period_days
    GROUP BY lar.created_at::DATE
  )
  SELECT 
    ds.date,
    COALESCE(dm.mentions::NUMERIC / NULLIF(dm.total_results, 0) * 100, 0) as visibility,
    COALESCE(dm.mentions, 0) as mentions,
    COALESCE((dm.avg_sentiment + 1) * 50, 50) as sentiment
  FROM date_series ds
  LEFT JOIN daily_metrics dm ON ds.date = dm.date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;

-- Create optimized indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_llm_analysis_results_created_at_website 
ON llm_analysis_results (created_at DESC, prompt_id) 
WHERE is_mentioned = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_website_active 
ON topics (website_id, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prompts_topic_id 
ON prompts (topic_id);

-- Materialized view for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS analysis_results_optimized_view AS
SELECT 
  p.id,
  p.prompt_text,
  t.topic_name,
  t.website_id,
  AVG(lar.confidence_score) as confidence_score,
  MAX(lar.created_at) as created_at,
  json_agg(
    json_build_object(
      'llm_provider', lar.llm_provider,
      'is_mentioned', lar.is_mentioned,
      'rank_position', lar.rank_position,
      'sentiment_score', lar.sentiment_score
    )
  ) as llm_results_summary,
  json_build_object(
    'total_mentions', COUNT(CASE WHEN lar.is_mentioned THEN 1 END),
    'avg_rank', AVG(CASE WHEN lar.rank_position IS NOT NULL THEN lar.rank_position END),
    'avg_sentiment', AVG(CASE WHEN lar.sentiment_score IS NOT NULL THEN lar.sentiment_score END)
  ) as performance_metrics,
  array_agg(DISTINCT lar.llm_provider) as llm_providers
FROM prompts p
JOIN topics t ON p.topic_id = t.id
JOIN llm_analysis_results lar ON lar.prompt_id = p.id
GROUP BY p.id, p.prompt_text, t.topic_name, t.website_id;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_analysis_optimized_view_website_date 
ON analysis_results_optimized_view (website_id, created_at DESC);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_analysis_optimized_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analysis_results_optimized_view;
END;
$$ LANGUAGE plpgsql;
`;
