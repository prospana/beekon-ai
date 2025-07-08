import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWorkspace, type Workspace } from "@/contexts/WorkspaceContext";
import { WorkspaceModal } from "./WorkspaceModal";
import { ConfirmationDialog } from "./ConfirmationDialog";
import {
  Building,
  ChevronDown,
  Plus,
  Settings,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

export function WorkspaceDropdown() {
  const {
    currentWorkspace,
    workspaces,
    loading,
    switchWorkspace,
    deleteWorkspace,
  } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null
  );

  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;

    const tierConfig = {
      free: { label: "Free", color: "bg-gray-500" },
      starter: { label: "Starter", color: "bg-blue-500" },
      professional: { label: "Pro", color: "bg-purple-500" },
      enterprise: { label: "Enterprise", color: "bg-orange-500" },
    };

    const config = tierConfig[tier as keyof typeof tierConfig];
    if (!config) return null;

    return (
      <Badge variant="outline" className="text-xs">
        <div className={`w-2 h-2 rounded-full ${config.color} mr-1`} />
        {config.label}
      </Badge>
    );
  };

  const handleCreateWorkspace = () => {
    setEditingWorkspace(null);
    setIsModalOpen(true);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    if (!workspace) {
      console.error("Cannot edit null workspace");
      return;
    }
    setEditingWorkspace(workspace);
    setIsModalOpen(true);
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    if (!workspace) {
      console.error("Cannot delete null workspace");
      return;
    }
    setWorkspaceToDelete(workspace);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (workspaceToDelete) {
      await deleteWorkspace(workspaceToDelete.id);
      setShowDeleteConfirm(false);
      setWorkspaceToDelete(null);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!currentWorkspace) {
    return (
      <Button variant="outline" size="sm" onClick={handleCreateWorkspace}>
        <Plus className="h-4 w-4 mr-2" />
        Create Workspace
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3">
            <Building className="h-4 w-4 mr-2" />
            <span className="max-w-[150px] truncate">
              {currentWorkspace.name}
            </span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span>Current Workspace</span>
              {getTierBadge(currentWorkspace.subscription_tier)}
            </div>
          </DropdownMenuLabel>
          <div className="px-2 py-1 text-sm text-muted-foreground">
            <div className="font-medium">{currentWorkspace.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span>Credits: {currentWorkspace.credits_remaining || 0}</span>
            </div>
          </div>
          <DropdownMenuSeparator />

          {workspaces.length > 1 && (
            <>
              <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
              {workspaces
                .filter((w) => w.id !== currentWorkspace.id)
                .map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => switchWorkspace(workspace.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span className="max-w-[150px] truncate">
                        {workspace.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTierBadge(workspace.subscription_tier)}
                    </div>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={handleCreateWorkspace}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Workspace
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              currentWorkspace && handleEditWorkspace(currentWorkspace)
            }
            disabled={!currentWorkspace}
          >
            <Settings className="h-4 w-4 mr-2" />
            Workspace Settings
          </DropdownMenuItem>

          {workspaces.length > 1 && currentWorkspace && (
            <DropdownMenuItem
              onClick={() => handleDeleteWorkspace(currentWorkspace)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Workspace
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspace={editingWorkspace}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setWorkspaceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${workspaceToDelete?.name}"? This will permanently remove all associated websites and analysis data. This action cannot be undone.`}
        confirmText="Delete Workspace"
        variant="destructive"
      />
    </>
  );
}
