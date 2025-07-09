import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface AnalysisResult {
  id: string;
  prompt: string;
  chatgpt: { mentioned: boolean; rank: number | null; sentiment: string | null };
  claude: { mentioned: boolean; rank: number | null; sentiment: string | null };
  gemini: { mentioned: boolean; rank: number | null; sentiment: string | null };
  topic: string;
  timestamp: string;
  confidence: number;
}

interface AnalysisVisualizationProps {
  results: AnalysisResult[];
}

export function AnalysisVisualization({ results }: AnalysisVisualizationProps) {
  if (results.length === 0) {
    return null;
  }

  const totalResults = results.length;
  const mentionedResults = results.filter(r => 
    r.chatgpt.mentioned || r.claude.mentioned || r.gemini.mentioned
  ).length;
  const mentionRate = (mentionedResults / totalResults) * 100;

  // Calculate LLM performance
  const llmStats = {
    chatgpt: {
      mentions: results.filter(r => r.chatgpt.mentioned).length,
      avgRank: results
        .filter(r => r.chatgpt.mentioned && r.chatgpt.rank)
        .reduce((acc, r) => acc + (r.chatgpt.rank || 0), 0) / 
        results.filter(r => r.chatgpt.mentioned && r.chatgpt.rank).length || 0,
      positiveSentiment: results.filter(r => r.chatgpt.sentiment === "positive").length,
    },
    claude: {
      mentions: results.filter(r => r.claude.mentioned).length,
      avgRank: results
        .filter(r => r.claude.mentioned && r.claude.rank)
        .reduce((acc, r) => acc + (r.claude.rank || 0), 0) / 
        results.filter(r => r.claude.mentioned && r.claude.rank).length || 0,
      positiveSentiment: results.filter(r => r.claude.sentiment === "positive").length,
    },
    gemini: {
      mentions: results.filter(r => r.gemini.mentioned).length,
      avgRank: results
        .filter(r => r.gemini.mentioned && r.gemini.rank)
        .reduce((acc, r) => acc + (r.gemini.rank || 0), 0) / 
        results.filter(r => r.gemini.mentioned && r.gemini.rank).length || 0,
      positiveSentiment: results.filter(r => r.gemini.sentiment === "positive").length,
    },
  };

  const avgConfidence = results.reduce((acc, r) => acc + r.confidence, 0) / results.length;

  // Topic distribution
  const topicCounts = results.reduce((acc, r) => {
    acc[r.topic] = (acc[r.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

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
          {Object.entries(llmStats).map(([llm, stats]) => (
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
                  {count} analysis{count > 1 ? 'es' : ''}
                </Badge>
              </div>
              <Progress 
                value={(count / totalResults) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Sentiment Chart Component
export function SentimentChart({ results }: { results: AnalysisResult[] }) {
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  results.forEach(result => {
    [result.chatgpt, result.claude, result.gemini].forEach(llm => {
      if (llm.mentioned && llm.sentiment) {
        sentimentCounts[llm.sentiment as keyof typeof sentimentCounts]++;
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
              <span className="text-sm font-medium capitalize">{sentiment}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  sentiment === 'positive' ? 'border-success text-success' :
                  sentiment === 'negative' ? 'border-destructive text-destructive' :
                  'border-warning text-warning'
                }`}
              >
                {count} ({((count / total) * 100).toFixed(1)}%)
              </Badge>
            </div>
            <Progress 
              value={(count / total) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Ranking Performance Chart
export function RankingChart({ results }: { results: AnalysisResult[] }) {
  const rankingData = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    "5+": 0,
  };

  results.forEach(result => {
    [result.chatgpt, result.claude, result.gemini].forEach(llm => {
      if (llm.mentioned && llm.rank) {
        if (llm.rank <= 5) {
          rankingData[llm.rank as keyof typeof rankingData]++;
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
            <Progress 
              value={(count / totalRanked) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}