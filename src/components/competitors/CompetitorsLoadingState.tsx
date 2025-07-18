import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CompetitorsLoadingStateProps {
  workspaceLoading: boolean;
  isLoading: boolean;
}

export default function CompetitorsLoadingState({
  workspaceLoading,
  
}: CompetitorsLoadingStateProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground">
            {workspaceLoading ? "Loading workspace..." : "Loading competitor data..."}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}