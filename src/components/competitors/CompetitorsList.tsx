import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, MoreHorizontal, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { CompetitorPerformance } from '@/services/competitorService';

interface CompetitorsListProps {
  performance: CompetitorPerformance[];
  sortBy: 'shareOfVoice' | 'averageRank' | 'mentionCount' | 'sentimentScore';
  confirmDelete: (competitorId: string) => void;
}

export default function CompetitorsList({
  performance,
  sortBy,
  confirmDelete,
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
            {performance.length} competitor{performance.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performance.map((competitor) => {
            const TrendIcon = getTrendIcon(competitor.trend);
            return (
              <div key={competitor.competitorId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{competitor.name}</h4>
                    <p className="text-sm text-muted-foreground">{competitor.domain}</p>
                    {competitor.lastAnalyzed && (
                      <p className="text-xs text-muted-foreground">
                        Last analyzed: {new Date(competitor.lastAnalyzed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Share of Voice</div>
                    <div className="font-medium text-lg">{competitor.shareOfVoice}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Avg Rank</div>
                    <div className="font-medium text-lg">
                      {competitor.averageRank > 0 ? competitor.averageRank.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Mentions</div>
                    <div className="font-medium text-lg">{competitor.mentionCount}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Sentiment</div>
                    <div className="font-medium text-lg">{competitor.sentimentScore}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Trend</div>
                    <div className="flex justify-center">
                      <TrendIcon className={`h-5 w-5 ${getTrendColor(competitor.trend)}`} />
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => confirmDelete(competitor.competitorId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
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