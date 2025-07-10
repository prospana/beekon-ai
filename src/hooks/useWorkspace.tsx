import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type SubscriptionTier =
  | "free"
  | "starter"
  | "professional"
  | "enterprise";

export interface WorkspaceSettings {
  theme?: "light" | "dark" | "system";
  timezone?: string;
  language?: string;
  default_analysis_frequency?: "daily" | "weekly" | "bi-weekly" | "monthly";
  notifications?: {
    email?: boolean;
    push?: boolean;
    weekly_reports?: boolean;
  };
  integrations?: {
    slack?: { webhook_url?: string; enabled?: boolean };
    discord?: { webhook_url?: string; enabled?: boolean };
  };
  [key: string]: unknown; // Allow additional settings
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string | null;
  subscription_tier: SubscriptionTier | null;
  credits_remaining: number | null;
  credits_reset_at: string | null;
  settings: WorkspaceSettings | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Website {
  id: string;
  workspace_id: string;
  domain: string;
  display_name: string;
  crawl_status: string | null;
  last_crawled_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  websites: Website[] | null;
  deleteWebsite: (websiteId: string) => Promise<void>;
  refetchWebsites: () => Promise<void>;
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
  const [websites, setWebsites] = useState<Website[]>([]);
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

      const workspaceData = (data || []).map((w) => ({
        ...w,
        subscription_tier: w.subscription_tier as SubscriptionTier | null,
        settings: (w.settings ?? null) as WorkspaceSettings | null,
      }));
      
      setWorkspaces(prev => {
        // Only update if the data actually changed to prevent unnecessary re-renders
        if (JSON.stringify(prev) !== JSON.stringify(workspaceData)) {
          return workspaceData;
        }
        return prev;
      });

      // Set current workspace to the first one if none is selected and workspaces exist
      if (workspaceData.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(workspaceData[0] ?? null);
      } else if (workspaceData.length === 0) {
        // Ensure currentWorkspace is null when no workspaces exist
        setCurrentWorkspace(null);
      }

      // Validate that current workspace still exists
      if (
        currentWorkspace &&
        !workspaceData.find((w) => w.id === currentWorkspace.id)
      ) {
        setCurrentWorkspace(
          workspaceData.length > 0 ? workspaceData[0] ?? null : null
        );
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
      setWorkspaces((prev) => [
        ...prev,
        {
          ...newWorkspace,
          subscription_tier:
            newWorkspace.subscription_tier as SubscriptionTier | null,
          settings: (newWorkspace.settings ?? null) as WorkspaceSettings | null,
        },
      ]);

      // Set as current workspace if it's the first one
      if (workspaces.length === 0) {
        setCurrentWorkspace({
          ...newWorkspace,
          subscription_tier:
            newWorkspace.subscription_tier as SubscriptionTier | null,
          settings: (newWorkspace.settings ?? null) as WorkspaceSettings | null,
        });
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
      // Ensure settings is serializable to JSON or null
      const updatesForSupabase = {
        ...updates,
        settings:
          updates.settings === undefined
            ? undefined
            : updates.settings === null
            ? null
            : JSON.parse(JSON.stringify(updates.settings)),
      };

      const { data, error } = await supabase
        .schema("beekon_data")
        .from("workspaces")
        .update(updatesForSupabase)
        .eq("id", workspaceId)
        .select()
        .single();

      if (error) throw error;

      const updatedWorkspace = data;
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspaceId
            ? {
                ...updatedWorkspace,
                subscription_tier:
                  updatedWorkspace.subscription_tier as SubscriptionTier | null,
                settings: (updatedWorkspace.settings ?? null) as WorkspaceSettings | null,
              }
            : w
        )
      );

      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace({
          ...updatedWorkspace,
          subscription_tier:
            updatedWorkspace.subscription_tier as SubscriptionTier | null,
          settings: (updatedWorkspace.settings ?? null) as WorkspaceSettings | null,
        });
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
            remainingWorkspaces.length > 0
              ? (remainingWorkspaces[0] as Workspace)
              : null
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

  const fetchWebsites = useCallback(async () => {
    if (!user?.id || !currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("websites")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const websiteData = (data || []).map((w) => ({
        ...w,
        workspace_id: w.workspace_id ?? "",
        display_name: w.display_name ?? "",
        crawl_status: w.crawl_status ?? null,
        last_crawled_at: w.last_crawled_at ?? "",
        is_active: w.is_active ?? false,
        created_at: w.created_at ?? "",
        updated_at: w.updated_at ?? "",
      }));
      
      setWebsites(prev => {
        // Only update if the data actually changed to prevent unnecessary re-renders
        if (JSON.stringify(prev) !== JSON.stringify(websiteData)) {
          return websiteData;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error fetching websites", error);
      setWebsites([]);
      toast({
        title: "Error",
        description: "Failed to fetch websites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentWorkspace?.id, toast]);

  const deleteWebsite = async (websiteId: string) => {
    if (!user?.id || !currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .schema("beekon_data")
        .from("websites")
        .delete()
        .eq("id", websiteId)
        .eq("workspace_id", currentWorkspace?.id);

      if (error) throw error;
      setWebsites((prev) => prev.filter((w) => w.id !== websiteId));
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWorkspaces();
    } else {
      setCurrentWorkspace(null);
      setWorkspaces([]);
      setWebsites([]);
      setLoading(false);
    }
  }, [user?.id, fetchWorkspaces]);

  // Separate effect for fetching websites when workspace changes
  useEffect(() => {
    if (user?.id && currentWorkspace?.id) {
      fetchWebsites();
    } else {
      setWebsites([]);
    }
  }, [user?.id, currentWorkspace?.id, fetchWebsites]);

  const refetchWebsites = async () => {
    setLoading(true);
    await fetchWebsites();
  };

  const value = {
    currentWorkspace,
    workspaces,
    loading,
    websites,
    deleteWebsite,
    refetchWebsites,
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
