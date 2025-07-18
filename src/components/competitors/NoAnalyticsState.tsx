import { EmptyState } from '@/components/ui/empty-state';
import { EmptyAnalyticsIllustration } from '@/components/illustrations/CompetitorIllustration';
import { RefreshCw } from 'lucide-react';

interface NoAnalyticsStateProps {
  refreshData: () => void;
  isRefreshing: boolean;
}

export default function NoAnalyticsState({
  refreshData,
  isRefreshing,
}: NoAnalyticsStateProps) {
  return (
    <EmptyState
      illustration={<EmptyAnalyticsIllustration className="w-32 h-32" />}
      title="No Analytics Data Available"
      description="Your competitors have been added but we're still processing their performance data. Analytics will appear here once analysis is complete."
      size="md"
      actions={[
        {
          label: "Refresh Data",
          onClick: refreshData,
          variant: "outline",
          icon: RefreshCw,
          loading: isRefreshing,
          loadingText: "Refreshing...",
        },
      ]}
    />
  );
}