import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "./useWorkspace";
import { useToast } from "./use-toast";
import {
  competitorService,
  type Competitor,
  type CompetitorPerformance,
  type CompetitorAnalytics,
} from "@/services/competitorService";

export interface CompetitorFilters {
  dateRange?: { start: string; end: string };
  sortBy?: "shareOfVoice" | "averageRank" | "mentionCount" | "sentimentScore";
  sortOrder?: "asc" | "desc";
  showInactive?: boolean;
}

export interface CompetitorWithStatus extends Competitor {
  analysisStatus: "completed" | "in_progress" | "pending";
  performance?: CompetitorPerformance;
  addedAt: string;
}

// Query keys for consistent caching
export const competitorKeys = {
  all: ['competitors'] as const,
  lists: () => [...competitorKeys.all, 'list'] as const,
  list: (websiteId: string) => [...competitorKeys.lists(), websiteId] as const,
  performance: (websiteId: string, filters?: CompetitorFilters) => 
    [...competitorKeys.all, 'performance', websiteId, filters] as const,
  analytics: (websiteId: string, dateRange?: { start: string; end: string }) => 
    [...competitorKeys.all, 'analytics', websiteId, dateRange] as const,
  timeSeries: (websiteId: string, competitorDomain?: string, days?: number) => 
    [...competitorKeys.all, 'timeSeries', websiteId, competitorDomain, days] as const,
};

export function useCompetitors(websiteId: string) {
  return useQuery({
    queryKey: competitorKeys.list(websiteId),
    queryFn: () => competitorService.getCompetitors(websiteId),
    enabled: !!websiteId,
    staleTime: 10 * 60 * 1000, // 10 minutes - competitor list changes infrequently
  });
}

export function useCompetitorPerformance(
  websiteId: string,
  filters?: CompetitorFilters
) {
  return useQuery({
    queryKey: competitorKeys.performance(websiteId, filters),
    queryFn: () => competitorService.getCompetitorPerformance(websiteId, filters?.dateRange),
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000, // 5 minutes for performance data
  });
}

export function useCompetitorAnalytics(
  websiteId: string,
  dateRange?: { start: string; end: string }
) {
  return useQuery({
    queryKey: competitorKeys.analytics(websiteId, dateRange),
    queryFn: () => competitorService.getCompetitiveAnalysis(websiteId, dateRange),
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000, // 5 minutes for analytics
  });
}

export function useCompetitorTimeSeries(
  websiteId: string,
  competitorDomain?: string,
  days: number = 30
) {
  return useQuery({
    queryKey: competitorKeys.timeSeries(websiteId, competitorDomain, days),
    queryFn: () => competitorService.getCompetitorTimeSeriesData(websiteId, competitorDomain, days),
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000, // 5 minutes for time series
  });
}

// Combined competitor data hook with parallel queries
export function useCompetitorData(websiteId: string, filters: CompetitorFilters = {}) {
  const { websites, loading: workspaceLoading } = useWorkspace();
  const targetWebsiteId = websiteId || websites?.[0]?.id;

  const queries = useQueries({
    queries: [
      {
        queryKey: competitorKeys.list(targetWebsiteId),
        queryFn: () => competitorService.getCompetitors(targetWebsiteId),
        enabled: !workspaceLoading && !!targetWebsiteId,
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: competitorKeys.performance(targetWebsiteId, filters),
        queryFn: () => competitorService.getCompetitorPerformance(targetWebsiteId, filters.dateRange),
        enabled: !workspaceLoading && !!targetWebsiteId,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: competitorKeys.analytics(targetWebsiteId, filters.dateRange),
        queryFn: () => competitorService.getCompetitiveAnalysis(targetWebsiteId, filters.dateRange),
        enabled: !workspaceLoading && !!targetWebsiteId,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const [competitorsQuery, performanceQuery, analyticsQuery] = queries;

  // Sort and filter performance data
  const sortedPerformance = performanceQuery.data ? 
    sortPerformanceData(performanceQuery.data, filters.sortBy, filters.sortOrder) : [];

  const filteredCompetitors = competitorsQuery.data ? 
    (filters.showInactive ? competitorsQuery.data : competitorsQuery.data.filter(c => c.is_active)) : [];

  // Merge competitors with performance data and add analysis status
  const competitorsWithStatus: CompetitorWithStatus[] = filteredCompetitors.map((competitor) => {
    const performanceData = sortedPerformance.find(p => p.competitorId === competitor.id);
    
    // Determine analysis status based on performance data and creation time
    let analysisStatus: "completed" | "in_progress" | "pending" = "pending";
    
    if (performanceData) {
      // Has performance data - analysis is completed
      analysisStatus = "completed";
    } else {
      // No performance data - check if recently added (within last 30 minutes = in_progress)
      const addedAt = new Date(competitor.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - addedAt.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      if (minutesAgo <= 30) {
        analysisStatus = "in_progress";
      } else {
        analysisStatus = "pending";
      }
    }

    return {
      ...competitor,
      analysisStatus,
      performance: performanceData,
      addedAt: competitor.created_at,
    };
  });

  return {
    competitors: filteredCompetitors,
    competitorsWithStatus,
    performance: sortedPerformance,
    analytics: analyticsQuery.data || null,
    isLoading: queries.some((q) => q.isLoading),
    isRefreshing: queries.some((q) => q.isFetching && !q.isLoading),
    error: queries.find((q) => q.error)?.error || null,
    refetch: () => {
      queries.forEach((query) => query.refetch());
    },
    hasData: competitorsQuery.data && competitorsQuery.data.length > 0,
    targetWebsiteId,
  };
}

// Mutations for competitor operations
export function useAddCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ websiteId, domain, name }: { websiteId: string; domain: string; name?: string }) =>
      competitorService.addCompetitor(websiteId, domain, name),
    onSuccess: (data, variables) => {
      // Invalidate all related queries for this website
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.all,
        predicate: (query) => {
          // Invalidate any competitor-related query for this website
          return query.queryKey.includes(variables.websiteId);
        }
      });
      
      toast({
        title: "Competitor added",
        description: `${variables.name || variables.domain} has been added to your competitor list.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding competitor",
        description: error instanceof Error ? error.message : "Failed to add competitor",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      competitorId, 
      updates, 
      websiteId 
    }: { 
      competitorId: string; 
      updates: Partial<Pick<Competitor, "competitor_name" | "is_active">>; 
      websiteId: string;
    }) =>
      competitorService.updateCompetitor(competitorId, updates),
    onSuccess: (data, variables) => {
      // Invalidate all related queries for this website
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.all,
        predicate: (query) => {
          // Invalidate any competitor-related query for this website
          return query.queryKey.includes(variables.websiteId);
        }
      });
      
      toast({
        title: "Competitor updated",
        description: "Competitor information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating competitor",
        description: error instanceof Error ? error.message : "Failed to update competitor",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ competitorId, websiteId }: { competitorId: string; websiteId: string }) =>
      competitorService.deleteCompetitor(competitorId),
    onSuccess: (data, variables) => {
      // Invalidate all related queries for this website
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.all,
        predicate: (query) => {
          // Invalidate any competitor-related query for this website
          return query.queryKey.includes(variables.websiteId);
        }
      });
      
      toast({
        title: "Competitor removed",
        description: "Competitor has been removed from tracking.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing competitor",
        description: error instanceof Error ? error.message : "Failed to remove competitor",
        variant: "destructive",
      });
    },
  });
}

// Helper function for sorting performance data
function sortPerformanceData(
  performance: CompetitorPerformance[],
  sortBy: CompetitorFilters["sortBy"] = "shareOfVoice",
  sortOrder: CompetitorFilters["sortOrder"] = "desc"
): CompetitorPerformance[] {
  return [...performance].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case "shareOfVoice":
        aValue = a.shareOfVoice;
        bValue = b.shareOfVoice;
        break;
      case "averageRank":
        aValue = a.averageRank;
        bValue = b.averageRank;
        break;
      case "mentionCount":
        aValue = a.mentionCount;
        bValue = b.mentionCount;
        break;
      case "sentimentScore":
        aValue = a.sentimentScore;
        bValue = b.sentimentScore;
        break;
      default:
        aValue = a.shareOfVoice;
        bValue = b.shareOfVoice;
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });
}