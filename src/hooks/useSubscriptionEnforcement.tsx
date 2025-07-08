import { useWorkspace, type SubscriptionTier } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionLimits {
  websiteAnalyses: number;
  competitorTracking: number;
  apiAccess: boolean;
  supportLevel: "email" | "priority" | "24/7";
  reports: "weekly" | "daily" | "none";
}

const subscriptionLimits: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    websiteAnalyses: 5,
    competitorTracking: 0,
    apiAccess: false,
    supportLevel: "email",
    reports: "none",
  },
  starter: {
    websiteAnalyses: 50,
    competitorTracking: 3,
    apiAccess: false,
    supportLevel: "priority",
    reports: "weekly",
  },
  professional: {
    websiteAnalyses: 1000,
    competitorTracking: -1, // unlimited
    apiAccess: true,
    supportLevel: "24/7",
    reports: "daily",
  },
  enterprise: {
    websiteAnalyses: 10000,
    competitorTracking: -1, // unlimited
    apiAccess: true,
    supportLevel: "24/7",
    reports: "daily",
  },
};

export function useSubscriptionEnforcement() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  const getCurrentLimits = (): SubscriptionLimits => {
    const tier = (currentWorkspace?.subscription_tier as SubscriptionTier) || "free";
    return subscriptionLimits[tier] || subscriptionLimits.free;
  };

  const canPerformAction = (action: keyof SubscriptionLimits): boolean => {
    if (!currentWorkspace) return false;
    
    const limits = getCurrentLimits();
    
    switch (action) {
      case "websiteAnalyses":
        return (currentWorkspace.credits_remaining || 0) > 0;
      case "competitorTracking":
        return limits.competitorTracking === -1 || limits.competitorTracking > 0;
      case "apiAccess":
        return limits.apiAccess;
      default:
        return true;
    }
  };

  const enforceLimit = (action: keyof SubscriptionLimits, actionName: string): boolean => {
    if (!canPerformAction(action)) {
      const tier = (currentWorkspace?.subscription_tier as SubscriptionTier) || "free";
      
      let message = "";
      let upgradeAction = "";

      switch (action) {
        case "websiteAnalyses":
          if (!currentWorkspace) {
            message = "Please create a workspace to start analyzing websites.";
            upgradeAction = "Create Workspace";
          } else {
            message = `You have reached your analysis limit for the ${tier} plan. You have ${currentWorkspace.credits_remaining || 0} credits remaining.`;
            upgradeAction = tier === "free" ? "Upgrade to Starter" : "Upgrade to Professional";
          }
          break;
        case "competitorTracking":
          if (!currentWorkspace) {
            message = "Please create a workspace to track competitors.";
            upgradeAction = "Create Workspace";
          } else {
            message = `Competitor tracking is not available in the ${tier} plan.`;
            upgradeAction = "Upgrade to Starter";
          }
          break;
        case "apiAccess":
          if (!currentWorkspace) {
            message = "Please create a workspace to access the API.";
            upgradeAction = "Create Workspace";
          } else {
            message = `API access is not available in the ${tier} plan.`;
            upgradeAction = "Upgrade to Professional";
          }
          break;
        default:
          message = !currentWorkspace 
            ? "Please create a workspace to use this feature."
            : "This feature is not available in your current plan.";
          upgradeAction = !currentWorkspace ? "Create Workspace" : "Upgrade Plan";
      }

      toast({
        title: !currentWorkspace ? "Workspace Required" : "Feature Limit Reached",
        description: message,
        variant: "destructive",
        action: {
          label: upgradeAction,
          onClick: () => {
            // Here you would typically navigate to upgrade page or open upgrade modal
            console.log("Action clicked:", upgradeAction);
          },
        },
      });
      return false;
    }
    return true;
  };

  const consumeCredit = async (): Promise<boolean> => {
    if (!currentWorkspace) {
      toast({
        title: "Workspace Required",
        description: "Please create a workspace to use analysis credits.",
        variant: "destructive",
      });
      return false;
    }
    
    const credits = currentWorkspace.credits_remaining || 0;
    if (credits <= 0) {
      toast({
        title: "No Credits Remaining",
        description: "You have no analysis credits remaining for this month.",
        variant: "destructive",
      });
      return false;
    }

    // Here you would typically make an API call to consume a credit
    // For now, we'll just update the local state
    return true;
  };

  const getRemainingCredits = (): number => {
    return currentWorkspace?.credits_remaining || 0;
  };

  const getSubscriptionTier = (): SubscriptionTier => {
    return (currentWorkspace?.subscription_tier as SubscriptionTier) || "free";
  };

  const isFeatureAvailable = (feature: keyof SubscriptionLimits): boolean => {
    return canPerformAction(feature);
  };

  return {
    getCurrentLimits,
    canPerformAction,
    enforceLimit,
    consumeCredit,
    getRemainingCredits,
    getSubscriptionTier,
    isFeatureAvailable,
  };
}