import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, MoreHorizontal, Trash2, TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';
import { CompetitorPerformance } from '@/services/competitorService';
import { CompetitorWithStatus } from '@/hooks/useCompetitorsQuery';

interface CompetitorsListProps {
  competitorsWithStatus: CompetitorWithStatus[];
  performance: CompetitorPerformance[];
  sortBy: 'shareOfVoice' | 'averageRank' | 'mentionCount' | 'sentimentScore';
  confirmDelete: (competitorId: string) => void;
  isDeleting?: boolean;
}

export default function CompetitorsList({
  competitorsWithStatus,
  performance,
  sortBy,
  confirmDelete,
  isDeleting = false,
}: CompetitorsListProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return () => <div className="w-5 h-5" />; // Placeholder for stable
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAnalysisStatusBadge = (status: "completed" | "in_progress" | "pending") => {
    switch (status) {
      case 'completed':
        return { text: 'Analyzed', variant: 'default' as const, icon: null };
      case 'in_progress':
        return { text: 'Analyzing', variant: 'secondary' as const, icon: <Loader2 className="h-3 w-3 animate-spin" /> };
      case 'pending':
        return { text: 'Pending', variant: 'outline' as const, icon: <Clock className="h-3 w-3" /> };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tracked Competitors</CardTitle>
            <CardDescription>
              Competitors you're currently monitoring (sorted by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()})
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {competitorsWithStatus.length} competitor{competitorsWithStatus.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitorsWithStatus.map((competitor) => {
            const performanceData = competitor.performance;
            const TrendIcon = performanceData ? getTrendIcon(performanceData.trend) : () => <div className="w-5 h-5" />;
            const statusBadge = getAnalysisStatusBadge(competitor.analysisStatus);
            const isAnalyzed = competitor.analysisStatus === 'completed';
            
            return (
              <div key={competitor.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${!isAnalyzed ? 'opacity-75' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{competitor.competitor_name || competitor.competitor_domain}</h4>
                      <Badge variant={statusBadge.variant} className="text-xs">
                        {statusBadge.icon && <span className="mr-1">{statusBadge.icon}</span>}
                        {statusBadge.text}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{competitor.competitor_domain}</p>
                    {performanceData?.lastAnalyzed && (
                      <p className="text-xs text-muted-foreground">
                        Last analyzed: {new Date(performanceData.lastAnalyzed).toLocaleDateString()}
                      </p>
                    )}
                    {!isAnalyzed && (
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(competitor.addedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Share of Voice</div>
                    <div className={`font-medium text-lg ${!isAnalyzed ? 'text-muted-foreground' : ''}`}>
                      {performanceData?.shareOfVoice ?? 0}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Avg Rank</div>
                    <div className={`font-medium text-lg ${!isAnalyzed ? 'text-muted-foreground' : ''}`}>
                      {performanceData?.averageRank && performanceData.averageRank > 0 ? performanceData.averageRank.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Mentions</div>
                    <div className={`font-medium text-lg ${!isAnalyzed ? 'text-muted-foreground' : ''}`}>
                      {performanceData?.mentionCount ?? 0}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Sentiment</div>
                    <div className={`font-medium text-lg ${!isAnalyzed ? 'text-muted-foreground' : ''}`}>
                      {performanceData?.sentimentScore ?? 0}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Trend</div>
                    <div className="flex justify-center">
                      <TrendIcon className={`h-5 w-5 ${performanceData ? getTrendColor(performanceData.trend) : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isDeleting}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => confirmDelete(competitor.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Removing..." : "Remove"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}