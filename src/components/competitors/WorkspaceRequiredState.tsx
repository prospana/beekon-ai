import { EmptyState } from '@/components/ui/empty-state';
import { Building, Globe, ExternalLink, Plus } from 'lucide-react';

interface WorkspaceRequiredStateProps {
  currentWorkspace: { id: string; name: string } | null;
  websiteId: string | undefined;
}

export default function WorkspaceRequiredState({
  currentWorkspace,
  websiteId,
}: WorkspaceRequiredStateProps) {
  // Show workspace creation prompt when no workspace exists
  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground">
              Monitor your competitive landscape in AI responses
            </p>
          </div>
        </div>
        
        <EmptyState
          icon={Building}
          title="No Workspace Selected"
          description="You need to select or create a workspace before you can track competitors and monitor your competitive landscape."
          size="lg"
          actions={[
            {
              label: "View Workspaces",
              onClick: () => (window.location.href = "/settings"),
              variant: "default",
              icon: ExternalLink,
            },
          ]}
        />
      </div>
    );
  }

  // Show website requirement message
  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground">
              Monitor your competitive landscape in AI responses
            </p>
          </div>
        </div>
        
        <EmptyState
          icon={Globe}
          title="No Websites Added"
          description="Add a website to your workspace first to start tracking competitors and monitoring how you compare against them in AI responses."
          size="lg"
          actions={[
            {
              label: "Add Website",
              onClick: () => (window.location.href = "/websites"),
              variant: "default",
              icon: Plus,
            },
            {
              label: "Learn More",
              onClick: () => (window.location.href = "/"),
              variant: "outline",
              icon: ExternalLink,
            },
          ]}
        />
      </div>
    );
  }

  return null;
}