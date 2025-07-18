import { LoadingButton } from "@/components/ui/loading-button";
import { WorkspaceModal } from "@/components/WorkspaceModal";
import { Building, Plus } from "lucide-react";
import { useState } from "react";

export function WorkspaceCreationPrompt() {
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome to Beekon.ai</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            To get started with monitoring your brand's AI visibility
            performance, you need to create a workspace first.
          </p>
          <LoadingButton
            onClick={() => setShowCreateWorkspace(true)}
            icon={<Plus className="h-4 w-4" />}
            size="lg"
          >
            Create Your First Workspace
          </LoadingButton>
        </div>
      </div>
      <WorkspaceModal
        isOpen={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
      />
    </>
  );
}