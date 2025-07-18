import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardErrorStateProps {
  error: { message: string };
  onRetry: () => void;
  onDismiss: () => void;
  isRefreshing: boolean;
}

export function DashboardErrorState({
  error,
  onRetry,
  onDismiss,
  isRefreshing,
}: DashboardErrorStateProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold text-destructive">
            Error Loading Dashboard Data
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button onClick={onDismiss} variant="outline" size="sm">
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}