import { AnalysisResult, LLMResult } from '@/types/database';

export interface AnalysisInsights {
  strengths: string[];
  opportunities: string[];
  recommendations: string[];
  summary: string;
  generatedAt: string;
}

export class InsightService {
  /**
   * Generate insights from analysis results
   */
  static generateInsights(analysisResults: AnalysisResult[]): AnalysisInsights {
    const insights: AnalysisInsights = {
      strengths: [],
      opportunities: [],
      recommendations: [],
      summary: '',
      generatedAt: new Date().toISOString()
    };

    if (!analysisResults || analysisResults.length === 0) {
      return {
        ...insights,
        summary: 'No analysis data available to generate insights.',
        recommendations: ['Run analysis to generate insights']
      };
    }

    // Calculate overall metrics
    const totalMentions = analysisResults.reduce((sum, result) => sum + result.total_mentions, 0);
    const avgRank = this.calculateAverageRank(analysisResults);
    const avgConfidence = this.calculateAverageConfidence(analysisResults);
    const avgSentiment = this.calculateAverageSentiment(analysisResults);
    const mentionRate = this.calculateMentionRate(analysisResults);

    // Generate strengths
    insights.strengths = this.generateStrengths(analysisResults, {
      totalMentions,
      avgRank,
      avgConfidence,
      avgSentiment,
      mentionRate
    });

    // Generate opportunities
    insights.opportunities = this.generateOpportunities(analysisResults, {
      totalMentions,
      avgRank,
      avgConfidence,
      avgSentiment,
      mentionRate
    });

    // Generate recommendations
    insights.recommendations = this.generateRecommendations(analysisResults, {
      totalMentions,
      avgRank,
      avgConfidence,
      avgSentiment,
      mentionRate
    });

    // Generate summary
    insights.summary = this.generateSummary(analysisResults, {
      totalMentions,
      avgRank,
      avgConfidence,
      avgSentiment,
      mentionRate
    });

    return insights;
  }

  private static calculateAverageRank(results: AnalysisResult[]): number | null {
    const ranks = results
      .filter(r => r.avg_rank !== null)
      .map(r => r.avg_rank!);
    
    return ranks.length > 0 ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length : null;
  }

  private static calculateAverageConfidence(results: AnalysisResult[]): number | null {
    const confidences = results
      .filter(r => r.avg_confidence !== null)
      .map(r => r.avg_confidence!);
    
    return confidences.length > 0 ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : null;
  }

  private static calculateAverageSentiment(results: AnalysisResult[]): number | null {
    const sentiments = results
      .filter(r => r.avg_sentiment !== null)
      .map(r => r.avg_sentiment!);
    
    return sentiments.length > 0 ? sentiments.reduce((sum, sent) => sum + sent, 0) / sentiments.length : null;
  }

  private static calculateMentionRate(results: AnalysisResult[]): number {
    const totalTopics = results.length;
    const mentionedTopics = results.filter(r => r.total_mentions > 0).length;
    
    return totalTopics > 0 ? (mentionedTopics / totalTopics) * 100 : 0;
  }

  private static generateStrengths(
    results: AnalysisResult[], 
    metrics: { totalMentions: number; avgRank: number | null; avgConfidence: number | null; avgSentiment: number | null; mentionRate: number }
  ): string[] {
    const strengths: string[] = [];

    // High mention rate
    if (metrics.mentionRate >= 70) {
      strengths.push(`Strong visibility with ${metrics.mentionRate.toFixed(1)}% mention rate across analyzed topics`);
    }

    // High ranking performance
    if (metrics.avgRank !== null && metrics.avgRank <= 3) {
      strengths.push(`Excellent ranking performance with average position ${metrics.avgRank.toFixed(1)}`);
    }

    // High confidence scores
    if (metrics.avgConfidence !== null && metrics.avgConfidence >= 0.7) {
      strengths.push(`High confidence in mentions with ${(metrics.avgConfidence * 100).toFixed(1)}% average confidence`);
    }

    // Positive sentiment
    if (metrics.avgSentiment !== null && metrics.avgSentiment >= 0.6) {
      strengths.push(`Positive sentiment in mentions with ${(metrics.avgSentiment * 100).toFixed(1)}% average sentiment`);
    }

    // High performing topics
    const topTopics = results
      .filter(r => r.total_mentions > 0)
      .sort((a, b) => b.total_mentions - a.total_mentions)
      .slice(0, 3);

    if (topTopics.length > 0) {
      strengths.push(`Strong performance in key topics: ${topTopics.map(t => t.topic_name).join(', ')}`);
    }

    // Consistent performance across LLM providers
    const llmProviders = new Set(
      results.flatMap(r => r.llm_results.map(lr => lr.llm_provider))
    );
    
    if (llmProviders.size >= 3) {
      strengths.push(`Consistent visibility across ${llmProviders.size} different LLM providers`);
    }

    return strengths.length > 0 ? strengths : ['Analysis shows baseline performance metrics'];
  }

  private static generateOpportunities(
    results: AnalysisResult[], 
    metrics: { totalMentions: number; avgRank: number | null; avgConfidence: number | null; avgSentiment: number | null; mentionRate: number }
  ): string[] {
    const opportunities: string[] = [];

    // Low mention rate
    if (metrics.mentionRate < 30) {
      opportunities.push(`Increase visibility - only ${metrics.mentionRate.toFixed(1)}% of topics mention your brand`);
    }

    // Poor ranking performance
    if (metrics.avgRank !== null && metrics.avgRank > 5) {
      opportunities.push(`Improve ranking position - currently averaging position ${metrics.avgRank.toFixed(1)}`);
    }

    // Low confidence scores
    if (metrics.avgConfidence !== null && metrics.avgConfidence < 0.5) {
      opportunities.push(`Strengthen brand presence - confidence in mentions is ${(metrics.avgConfidence * 100).toFixed(1)}%`);
    }

    // Negative sentiment
    if (metrics.avgSentiment !== null && metrics.avgSentiment < 0.4) {
      opportunities.push(`Address sentiment concerns - current sentiment is ${(metrics.avgSentiment * 100).toFixed(1)}%`);
    }

    // Topics with no mentions
    const noMentionTopics = results.filter(r => r.total_mentions === 0);
    if (noMentionTopics.length > 0) {
      opportunities.push(`Expand presence in ${noMentionTopics.length} topics with no current mentions`);
    }

    // Inconsistent performance across providers
    const llmProviders = new Set(
      results.flatMap(r => r.llm_results.map(lr => lr.llm_provider))
    );
    
    if (llmProviders.size < 3) {
      opportunities.push(`Test visibility across more LLM providers for comprehensive coverage`);
    }

    // Topics with low but existing mentions
    const lowMentionTopics = results.filter(r => r.total_mentions > 0 && r.total_mentions < 3);
    if (lowMentionTopics.length > 0) {
      opportunities.push(`Strengthen presence in ${lowMentionTopics.length} topics with limited mentions`);
    }

    return opportunities.length > 0 ? opportunities : ['Continue monitoring for new opportunities'];
  }

  private static generateRecommendations(
    results: AnalysisResult[], 
    metrics: { totalMentions: number; avgRank: number | null; avgConfidence: number | null; avgSentiment: number | null; mentionRate: number }
  ): string[] {
    const recommendations: string[] = [];

    // Based on mention rate
    if (metrics.mentionRate < 50) {
      recommendations.push('**Content Strategy**: Create more targeted content addressing the topics where you\'re not mentioned');
      recommendations.push('**SEO Optimization**: Improve search engine visibility for key topic keywords');
    }

    // Based on ranking performance
    if (metrics.avgRank !== null && metrics.avgRank > 3) {
      recommendations.push('**Authority Building**: Develop thought leadership content to improve ranking positions');
      recommendations.push('**Backlink Strategy**: Build high-quality backlinks to increase domain authority');
    }

    // Based on confidence scores
    if (metrics.avgConfidence !== null && metrics.avgConfidence < 0.6) {
      recommendations.push('**Brand Clarity**: Ensure consistent messaging across all content and platforms');
      recommendations.push('**Content Quality**: Improve content relevance and specificity to your brand');
    }

    // Based on sentiment
    if (metrics.avgSentiment !== null && metrics.avgSentiment < 0.5) {
      recommendations.push('**Reputation Management**: Address negative sentiment through improved customer experience');
      recommendations.push('**Community Engagement**: Increase positive brand interactions and testimonials');
    }

    // Topic-specific recommendations
    const topPerformingTopics = results
      .filter(r => r.total_mentions > 0)
      .sort((a, b) => b.total_mentions - a.total_mentions)
      .slice(0, 2);

    if (topPerformingTopics.length > 0) {
      recommendations.push(`**Leverage Success**: Double down on successful topics: ${topPerformingTopics.map(t => t.topic_name).join(', ')}`);
    }

    const underPerformingTopics = results
      .filter(r => r.total_mentions === 0)
      .slice(0, 3);

    if (underPerformingTopics.length > 0) {
      recommendations.push(`**Gap Analysis**: Research why you're not mentioned in: ${underPerformingTopics.map(t => t.topic_name).join(', ')}`);
    }

    // General recommendations
    recommendations.push('**Regular Monitoring**: Set up automated alerts for brand mentions and ranking changes');
    recommendations.push('**Competitive Analysis**: Monitor competitor performance in your key topics');

    return recommendations;
  }

  private static generateSummary(
    results: AnalysisResult[], 
    metrics: { totalMentions: number; avgRank: number | null; avgConfidence: number | null; avgSentiment: number | null; mentionRate: number }
  ): string {
    const topicsAnalyzed = results.length;
    const topicsWithMentions = results.filter(r => r.total_mentions > 0).length;
    
    let summary = `Analysis of ${topicsAnalyzed} topics reveals `;
    
    if (metrics.mentionRate >= 70) {
      summary += `strong brand visibility with ${topicsWithMentions} topics mentioning your brand (${metrics.mentionRate.toFixed(1)}% mention rate).`;
    } else if (metrics.mentionRate >= 40) {
      summary += `moderate brand visibility with ${topicsWithMentions} topics mentioning your brand (${metrics.mentionRate.toFixed(1)}% mention rate).`;
    } else {
      summary += `limited brand visibility with only ${topicsWithMentions} topics mentioning your brand (${metrics.mentionRate.toFixed(1)}% mention rate).`;
    }

    if (metrics.avgRank !== null) {
      summary += ` Average ranking position is ${metrics.avgRank.toFixed(1)}.`;
    }

    if (metrics.avgConfidence !== null) {
      summary += ` Mention confidence averages ${(metrics.avgConfidence * 100).toFixed(1)}%.`;
    }

    if (metrics.avgSentiment !== null) {
      const sentimentLabel = metrics.avgSentiment >= 0.6 ? 'positive' : 
                            metrics.avgSentiment >= 0.4 ? 'neutral' : 'negative';
      summary += ` Overall sentiment is ${sentimentLabel} (${(metrics.avgSentiment * 100).toFixed(1)}%).`;
    }

    return summary;
  }
}