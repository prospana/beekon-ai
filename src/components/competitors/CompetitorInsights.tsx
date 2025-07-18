import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Award,
  ArrowRight,
  Info,
  Zap,
  Shield,
} from "lucide-react";
import { type CompetitorInsight } from "@/services/competitorAnalysisService";
import { useMemo } from "react";

interface CompetitorInsightsProps {
  insights: CompetitorInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function CompetitorInsights({
  insights,
  isLoading = false,
  onRefresh,
}: CompetitorInsightsProps) {
  // Process insights by type and priority
  const processedInsights = useMemo(() => {
    const grouped = {
      threats: insights.filter(insight => insight.type === 'threat'),
      opportunities: insights.filter(insight => insight.type === 'opportunity'),
      neutral: insights.filter(insight => insight.type === 'neutral'),
    };

    const byPriority = {
      high: insights.filter(insight => insight.impact === 'high'),
      medium: insights.filter(insight => insight.impact === 'medium'),
      low: insights.filter(insight => insight.impact === 'low'),
    };

    return { grouped, byPriority };
  }, [insights]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      total: insights.length,
      threats: processedInsights.grouped.threats.length,
      opportunities: processedInsights.grouped.opportunities.length,
      highPriority: processedInsights.byPriority.high.length,
      actionableRecommendations: insights.reduce((sum, insight) => 
        sum + insight.recommendations.length, 0
      ),
    };
  }, [insights, processedInsights]);

  const getInsightIcon = (type: CompetitorInsight['type']) => {
    switch (type) {
      case 'threat':
        return AlertTriangle;
      case 'opportunity':
        return Target;
      default:
        return Info;
    }
  };

  const getInsightColor = (type: CompetitorInsight['type']) => {
    switch (type) {
      case 'threat':
        return 'text-destructive';
      case 'opportunity':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  const getInsightBg = (type: CompetitorInsight['type']) => {
    switch (type) {
      case 'threat':
        return 'bg-destructive/10 border-destructive/20';
      case 'opportunity':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
  };

  const getPriorityColor = (priority: CompetitorInsight['impact']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Competitive Intelligence</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Competitive Intelligence</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Generate Insights
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
            <p className="text-muted-foreground mb-4">
              Add competitors and run analyses to generate competitive intelligence.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Competitive Intelligence
            </CardTitle>
            <CardDescription>AI-powered insights and recommendations</CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh Insights
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{summary.opportunities}</div>
            <div className="text-sm text-muted-foreground">Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{summary.threats}</div>
            <div className="text-sm text-muted-foreground">Threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{summary.highPriority}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{summary.actionableRecommendations}</div>
            <div className="text-sm text-muted-foreground">Recommendations</div>
          </div>
        </div>

        {/* Priority Progress */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Priority Distribution
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>High Priority</span>
              <span>{summary.highPriority} of {summary.total}</span>
            </div>
            <Progress 
              value={(summary.highPriority / Math.max(summary.total, 1)) * 100} 
              className="h-2"
            />
          </div>
        </div>

        {/* High Priority Insights */}
        {processedInsights.byPriority.high.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              High Priority Actions
            </h4>
            <div className="space-y-3">
              {processedInsights.byPriority.high.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getInsightBg(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getInsightColor(insight.type)}`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h5 className="font-medium">{insight.title}</h5>
                          <Badge variant={getPriorityColor(insight.impact)} className="text-xs">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                        {insight.recommendations.length > 0 && (
                          <div>
                            <h6 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                              Recommended Actions
                            </h6>
                            <ul className="space-y-1">
                              {insight.recommendations.slice(0, 3).map((rec, recIndex) => (
                                <li key={recIndex} className="text-sm flex items-start gap-2">
                                  <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* All Insights by Category */}
        <div className="space-y-6">
          {/* Opportunities */}
          {processedInsights.grouped.opportunities.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                Market Opportunities ({processedInsights.grouped.opportunities.length})
              </h4>
              <div className="grid gap-4">
                {processedInsights.grouped.opportunities.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h5 className="font-medium">{insight.title}</h5>
                      <Badge variant={getPriorityColor(insight.impact)} className="text-xs">
                        {insight.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    {insight.recommendations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {insight.recommendations.slice(0, 2).map((rec, recIndex) => (
                          <Badge key={recIndex} variant="outline" className="text-xs">
                            {rec}
                          </Badge>
                        ))}
                        {insight.recommendations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{insight.recommendations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threats */}
          {processedInsights.grouped.threats.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                Competitive Threats ({processedInsights.grouped.threats.length})
              </h4>
              <div className="grid gap-4">
                {processedInsights.grouped.threats.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-destructive/10 border-destructive/20"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h5 className="font-medium">{insight.title}</h5>
                      <Badge variant={getPriorityColor(insight.impact)} className="text-xs">
                        {insight.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    {insight.recommendations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {insight.recommendations.slice(0, 2).map((rec, recIndex) => (
                          <Badge key={recIndex} variant="outline" className="text-xs">
                            {rec}
                          </Badge>
                        ))}
                        {insight.recommendations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{insight.recommendations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Strategic Summary */}
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-primary">Strategic Focus</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.opportunities > summary.threats 
                  ? `You have ${summary.opportunities} opportunities vs ${summary.threats} threats. Focus on capitalizing on market gaps while monitoring competitive movements.`
                  : summary.threats > summary.opportunities
                  ? `You face ${summary.threats} competitive threats vs ${summary.opportunities} opportunities. Prioritize defensive strategies and market differentiation.`
                  : `You have a balanced competitive landscape with ${summary.opportunities} opportunities and ${summary.threats} threats. Maintain strategic agility.`
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}