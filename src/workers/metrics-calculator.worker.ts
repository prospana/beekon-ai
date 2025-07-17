// Web Worker for heavy dashboard calculations
self.onmessage = function(e) {
  const { results } = e.data;
  
  try {
    const metrics = calculateMetrics(results);
    self.postMessage(metrics);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};

function calculateMetrics(results: any[]) {
  if (results.length === 0) {
    return {
      overallVisibilityScore: 0,
      averageRanking: 0,
      totalMentions: 0,
      sentimentScore: 0,
      totalAnalyses: 0,
      activeWebsites: 0,
      topPerformingTopic: null,
      improvementTrend: 0,
    };
  }

  const allLLMResults: any[] = [];
  const topics = new Set<string>();
  const websites = new Set<string>();

  // Process results in batches to avoid blocking
  const batchSize = 1000;
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    
    batch.forEach((result) => {
      if (result.llm_results) {
        allLLMResults.push(...result.llm_results);
      }
      if (result.topic) {
        topics.add(result.topic);
      }
      if (result.website_id) {
        websites.add(result.website_id);
      }
    });
    
    // Yield control periodically
    if (i % (batchSize * 10) === 0) {
      // Allow other operations
      setTimeout(() => {}, 0);
    }
  }

  // Calculate metrics efficiently
  const totalLLMResults = allLLMResults.length;
  let mentionedCount = 0;
  let rankSum = 0;
  let rankedCount = 0;
  let sentimentSum = 0;
  let sentimentCount = 0;

  // Single pass through LLM results
  for (const result of allLLMResults) {
    if (result.is_mentioned) {
      mentionedCount++;
      
      if (result.rank_position !== null && result.rank_position !== undefined) {
        rankSum += result.rank_position;
        rankedCount++;
      }
    }
    
    if (result.sentiment_score !== null && result.sentiment_score !== undefined) {
      sentimentSum += result.sentiment_score;
      sentimentCount++;
    }
  }

  const overallVisibilityScore = totalLLMResults > 0
    ? Math.round((mentionedCount / totalLLMResults) * 100)
    : 0;

  const averageRanking = rankedCount > 0
    ? Math.round((rankSum / rankedCount) * 10) / 10
    : 0;

  const sentimentScore = sentimentCount > 0
    ? Math.round(((sentimentSum / sentimentCount) + 1) * 50)
    : 0;

  return {
    overallVisibilityScore,
    averageRanking,
    totalMentions: mentionedCount,
    sentimentScore,
    totalAnalyses: results.length,
    activeWebsites: websites.size,
    topPerformingTopic: topics.size > 0 ? Array.from(topics)[0] : null,
    improvementTrend: 0,
  };
}
