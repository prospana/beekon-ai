import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionTier =
  | "free"
  | "starter"
  | "professional"
  | "enterprise";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string | null;
  subscription_tier: SubscriptionTier | null;
  credits_remaining: number | null;
  credits_reset_at: string | null;
  settings: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  createWorkspace: (
    name: string,
    subscriptionTier: SubscriptionTier,
    creditLimit?: number
  ) => Promise<void>;
  updateWorkspace: (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const workspaceData = data || [];
      setWorkspaces(workspaceData);

      // Set current workspace to the first one if none is selected and workspaces exist
      if (workspaceData.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(workspaceData[0]);
      } else if (workspaceData.length === 0) {
        // Ensure currentWorkspace is null when no workspaces exist
        setCurrentWorkspace(null);
      }

      // Validate that current workspace still exists
      if (
        currentWorkspace &&
        !workspaceData.find((w) => w.id === currentWorkspace.id)
      ) {
        setCurrentWorkspace(workspaceData.length > 0 ? workspaceData[0] : null);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      toast({
        title: "Error",
        description: "Failed to fetch workspaces. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentWorkspace, toast]);

  const createWorkspace = async (
    name: string,
    subscriptionTier: SubscriptionTier,
    creditLimit?: number
  ) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("workspaces")
        .insert({
          name,
          owner_id: user.id,
          subscription_tier: subscriptionTier,
          credits_remaining: creditLimit || getDefaultCredits(subscriptionTier),
        })
        .select()
        .single();

      if (error) throw error;

      const newWorkspace = data;
      setWorkspaces((prev) => [...prev, newWorkspace]);

      // Set as current workspace if it's the first one
      if (workspaces.length === 0) {
        setCurrentWorkspace(newWorkspace);
      }

      toast({
        title: "Success",
        description: `Workspace "${name}" created successfully`,
      });
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateWorkspace = async (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => {
    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("workspaces")
        .update(updates)
        .eq("id", workspaceId)
        .select()
        .single();

      if (error) throw error;

      const updatedWorkspace = data;
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === workspaceId ? updatedWorkspace : w))
      );

      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(updatedWorkspace);
      }

      toast({
        title: "Success",
        description: "Workspace updated successfully",
      });
    } catch (error) {
      console.error("Error updating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to update workspace",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const { error } = await supabase
        .schema("beekon_data")
        .from("workspaces")
        .delete()
        .eq("id", workspaceId);

      if (error) throw error;

      // Update workspaces and handle current workspace selection in one operation
      setWorkspaces((prev) => {
        const remainingWorkspaces = prev.filter((w) => w.id !== workspaceId);

        // If the deleted workspace was the current one, select a new one
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspace(
            remainingWorkspaces.length > 0 ? remainingWorkspaces[0] : null
          );
        }

        return remainingWorkspaces;
      });

      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Error",
        description: "Failed to delete workspace",
        variant: "destructive",
      });
      throw error;
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      toast({
        title: "Success",
        description: `Switched to workspace "${workspace.name}"`,
      });
    }
  };

  const refetchWorkspaces = async () => {
    setLoading(true);
    await fetchWorkspaces();
  };

  useEffect(() => {
    if (user?.id) {
      fetchWorkspaces();
    } else {
      setCurrentWorkspace(null);
      setWorkspaces([]);
      setLoading(false);
    }
  }, [user?.id, fetchWorkspaces]);

  const value = {
    currentWorkspace,
    workspaces,
    loading,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    refetchWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

// Helper function to get default credits based on subscription tier
function getDefaultCredits(tier: SubscriptionTier): number {
  switch (tier) {
    case "free":
      return 5;
    case "starter":
      return 50;
    case "professional":
      return 1000;
    case "enterprise":
      return 10000;
    default:
      return 5;
  }
}
