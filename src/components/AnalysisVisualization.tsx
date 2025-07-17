import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UIAnalysisResult } from "@/types/database";
import { BarChart3, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";

interface AnalysisVisualizationProps {
  results: UIAnalysisResult[];
}

export function AnalysisVisualization({ results }: AnalysisVisualizationProps) {
  // Memoize expensive calculations
  const analysisMetrics = useMemo(() => {
    if (results.length === 0) {
      return null;
    }

    const totalResults = results.length;

    // Get all LLM results from all analysis results
    const allLLMResults = results.flatMap((r) => r.llm_results);

    const mentionedResults = results.filter((r) =>
      r.llm_results.some((llm) => llm.is_mentioned)
    ).length;
    const mentionRate = (mentionedResults / totalResults) * 100;

    // Calculate LLM performance using modern format
    const llmStats = allLLMResults.reduce(
      (stats, llmResult) => {
        const provider = llmResult.llm_provider;
        if (!stats[provider]) {
          stats[provider] = {
            mentions: 0,
            totalRank: 0,
            rankedMentions: 0,
            positiveSentiment: 0,
          };
        }

        if (llmResult.is_mentioned) {
          stats[provider].mentions++;
          if (llmResult.rank_position) {
            stats[provider].totalRank += llmResult.rank_position;
            stats[provider].rankedMentions++;
          }
          if (llmResult.sentiment_score && llmResult.sentiment_score > 0.1) {
            stats[provider].positiveSentiment++;
          }
        }

        return stats;
      },
      {} as Record<
        string,
        {
          mentions: number;
          totalRank: number;
          rankedMentions: number;
          positiveSentiment: number;
        }
      >
    );

    // Calculate average ranks
    const processedLLMStats = Object.entries(llmStats).reduce(
      (processed, [provider, stats]) => {
        processed[provider] = {
          mentions: stats.mentions,
          avgRank:
            stats.rankedMentions > 0 ? stats.totalRank / stats.rankedMentions : 0,
          positiveSentiment: stats.positiveSentiment,
        };
        return processed;
      },
      {} as Record<
        string,
        {
          mentions: number;
          avgRank: number;
          positiveSentiment: number;
        }
      >
    );

    const avgConfidence =
      results.reduce((acc, r) => acc + r.confidence * 100, 0) / results.length;

    // Topic distribution
    const topicCounts = results.reduce((acc, r) => {
      acc[r.topic] = (acc[r.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalResults,
      mentionedResults,
      mentionRate,
      processedLLMStats,
      avgConfidence,
      topTopics,
    };
  }, [results]);

  if (!analysisMetrics) {
    return null;
  }

  const {
    totalResults,
    mentionedResults,
    mentionRate,
    processedLLMStats,
    avgConfidence,
    topTopics,
  } = analysisMetrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Overall Performance</span>
          </CardTitle>
          <CardDescription>Brand mention statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mention Rate</span>
            <Badge variant="outline">{mentionRate.toFixed(1)}%</Badge>
          </div>
          <Progress value={mentionRate} className="w-full" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avg. Confidence</span>
            <Badge variant="outline">{avgConfidence.toFixed(1)}%</Badge>
          </div>
          <Progress value={avgConfidence} className="w-full" />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span>{mentionedResults} mentions</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingDown className="h-3 w-3 text-muted-foreground" />
              <span>{totalResults - mentionedResults} no mentions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LLM Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>LLM Performance</span>
          </CardTitle>
          <CardDescription>Performance across AI models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(processedLLMStats).map(([llm, stats]) => (
            <div key={llm} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{llm}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {stats.mentions} mentions
                  </Badge>
                  {stats.avgRank > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Avg. #{stats.avgRank.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <Progress
                value={(stats.mentions / totalResults) * 100}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {stats.positiveSentiment} positive sentiment
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Top Topics</span>
          </CardTitle>
          <CardDescription>Most analyzed topics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTopics.map(([topic, count]) => (
            <div key={topic} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{topic}</span>
                <Badge variant="outline" className="text-xs">
                  {count} analysis{count > 1 ? "es" : ""}
                </Badge>
              </div>
              <Progress value={(count / totalResults) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Sentiment Chart Component
export function SentimentChart({ results }: { results: UIAnalysisResult[] }) {
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  results.forEach((result) => {
    result.llm_results.forEach((llm) => {
      if (llm.is_mentioned && llm.sentiment_score !== null) {
        if (llm.sentiment_score > 0.1) {
          sentimentCounts.positive++;
        } else if (llm.sentiment_score < -0.1) {
          sentimentCounts.negative++;
        } else {
          sentimentCounts.neutral++;
        }
      }
    });
  });

  const total = Object.values(sentimentCounts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
        <CardDescription>Overall sentiment across all mentions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(sentimentCounts).map(([sentiment, count]) => (
          <div key={sentiment} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {sentiment}
              </span>
              <Badge
                variant="outline"
                className={`text-xs ${
                  sentiment === "positive"
                    ? "border-success text-success"
                    : sentiment === "negative"
                    ? "border-destructive text-destructive"
                    : "border-warning text-warning"
                }`}
              >
                {count} ({((count / total) * 100).toFixed(1)}%)
              </Badge>
            </div>
            <Progress value={(count / total) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Ranking Performance Chart
export function RankingChart({ results }: { results: UIAnalysisResult[] }) {
  const rankingData = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    "5+": 0,
  };

  results.forEach((result) => {
    result.llm_results.forEach((llm) => {
      if (llm.is_mentioned && llm.rank_position) {
        if (llm.rank_position <= 5) {
          rankingData[llm.rank_position as keyof typeof rankingData]++;
        } else {
          rankingData["5+"]++;
        }
      }
    });
  });

  const totalRanked = Object.values(rankingData).reduce((a, b) => a + b, 0);

  if (totalRanked === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ranking Distribution</CardTitle>
        <CardDescription>Position rankings across all mentions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(rankingData).map(([rank, count]) => (
          <div key={rank} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">#{rank}</span>
              <Badge variant="outline" className="text-xs">
                {count} mentions
              </Badge>
            </div>
            <Progress value={(count / totalRanked) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
