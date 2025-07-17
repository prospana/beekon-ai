import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CompetitorIllustration } from '@/components/illustrations/CompetitorIllustration';
import { useToast } from '@/hooks/use-toast';
import { Plus, Target, BarChart3 } from 'lucide-react';

interface CompetitorsEmptyStateProps {
  setIsAddDialogOpen: (value: boolean) => void;
}

export default function CompetitorsEmptyState({ setIsAddDialogOpen }: CompetitorsEmptyStateProps) {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Primary Empty State */}
      <EmptyState
        illustration={<CompetitorIllustration className="w-40 h-40" />}
        title="Start Tracking Competitors"
        description="Add competitors to monitor your competitive landscape and discover how your brand performs against them in AI responses across different LLMs and topics."
        size="lg"
        actions={[
          {
            label: "Add Your First Competitor",
            onClick: () => setIsAddDialogOpen(true),
            variant: "default",
            icon: Plus,
          },
          {
            label: "View Demo",
            onClick: () => toast({
              title: "Demo Feature",
              description: "Demo functionality would be implemented here",
            }),
            variant: "outline",
            icon: Target,
          },
        ]}
      />

      {/* Secondary Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            What You'll Get
          </CardTitle>
          <CardDescription>
            Comprehensive competitive intelligence for AI visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-sm">Share of Voice Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  See how often your competitors are mentioned vs. your brand
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-sm">Ranking Comparisons</h4>
                <p className="text-xs text-muted-foreground">
                  Track average ranking positions across different LLMs
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-sm">Sentiment Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Compare sentiment scores and competitive positioning
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-sm">Gap Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Identify opportunities by topic and keyword performance
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}