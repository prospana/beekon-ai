import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useCompetitorData, useAddCompetitor, useDeleteCompetitor } from "@/hooks/useCompetitorsQuery";
import CompetitorsHeader from "@/components/competitors/CompetitorsHeader";
import CompetitorsLoadingState from "@/components/competitors/CompetitorsLoadingState";
import WorkspaceRequiredState from "@/components/competitors/WorkspaceRequiredState";
import CompetitorsErrorState from "@/components/competitors/CompetitorsErrorState";
import ShareOfVoiceChart from "@/components/competitors/ShareOfVoiceChart";
import CompetitorsList from "@/components/competitors/CompetitorsList";
import CompetitiveGapChart from "@/components/competitors/CompetitiveGapChart";
import TimeSeriesChart from "@/components/competitors/TimeSeriesChart";
import CompetitorsEmptyState from "@/components/competitors/CompetitorsEmptyState";
import NoAnalyticsState from "@/components/competitors/NoAnalyticsState";
import CompetitorInsights from "@/components/competitors/CompetitorInsights";
import { sendN8nWebhook } from "@/lib/http-request";
import { addProtocol } from "@/lib/utils";

export default function Competitors() {
  const {
    currentWorkspace,
    websites,
    loading: workspaceLoading,
  } = useWorkspace();
  const { toast } = useToast();

  // State for UI controls
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [competitorToDelete, setCompetitorToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d">("30d");
  const [sortBy, setSortBy] = useState<
    "shareOfVoice" | "averageRank" | "mentionCount" | "sentimentScore"
  >("shareOfVoice");
  const [isExporting, setIsExporting] = useState(false);

  // Get first website ID for competitor tracking (fallback)
  const websiteId = websites?.[0]?.id;

  // Initialize selectedWebsiteId when websites are loaded
  React.useEffect(() => {
    if (websites && websites.length > 0 && !selectedWebsiteId) {
      setSelectedWebsiteId(websites[0]!.id);
    }
  }, [websites, selectedWebsiteId]);

  // Calculate date range (memoized to prevent infinite re-renders)
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
    start.setDate(end.getDate() - days);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }, [dateFilter]);

  // Use React Query-based competitor data hook
  const {
    competitors,
    performance,
    analytics,
    isLoading,
    isRefreshing,
    error,
    refetch,
    hasData,
    targetWebsiteId,
  } = useCompetitorData(selectedWebsiteId, {
    dateRange,
    sortBy,
    sortOrder: "desc",
  });

  // Use React Query mutations for proper cache invalidation
  const addCompetitorMutation = useAddCompetitor();
  const deleteCompetitorMutation = useDeleteCompetitor();

  // Prepare chart data from analytics (memoized to prevent unnecessary recalculations)
  const shareOfVoiceData = useMemo(() => {
    return (
      analytics?.marketShareData.map((item) => ({
        name: item.name,
        value: item.value,
        fill:
          item.name === "Your Brand"
            ? "hsl(var(--primary))"
            : item.competitorId
            ? `hsl(var(--chart-${(item.competitorId.length % 4) + 2}))`
            : "hsl(var(--muted))",
      })) || []
    );
  }, [analytics?.marketShareData]);

  const competitiveGapData = useMemo(() => {
    return (
      analytics?.competitiveGaps.map((gap) => {
        const data: Record<string, number | string> = {
          topic: gap.topic,
          yourBrand: gap.yourBrand,
        };
        gap.competitors.forEach((comp, index) => {
          data[`competitor${index + 1}`] = comp.score;
        });
        return data;
      }) || []
    );
  }, [analytics?.competitiveGaps]);

  // Competitor insights refresh handler
  const handleInsightsRefresh = () => {
    refetch();
  };

  const handleAddCompetitor = async () => {
    if (!websites || websites.length === 0) {
      toast({
        title: "Error",
        description: "No websites available. Please add a website first.",
        variant: "destructive",
      });
      return;
    }

    if (!competitorDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a competitor domain",
        variant: "destructive",
      });
      return;
    }

    if (!selectedWebsiteId) {
      toast({
        title: "Error",
        description: "Please select a website for competitor tracking",
        variant: "destructive",
      });
      return;
    }

    // Validate that the selected website exists and is available
    const selectedWebsite = websites?.find((w) => w.id === selectedWebsiteId);
    if (!selectedWebsite) {
      toast({
        title: "Error",
        description: "Selected website is no longer available",
        variant: "destructive",
      });
      return;
    }

    // Validate domain format
    const domainRegex =
      /^(https?:\/\/)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(\/.*)?$/i;

    if (!domainRegex.test(competitorDomain)) {
      toast({
        title: "Error",
        description: "Please enter a valid domain name",
        variant: "destructive",
      });
      return;
    }

    try {
      // First add the competitor to the database using React Query mutation
      await addCompetitorMutation.mutateAsync({
        websiteId: selectedWebsite.id,
        domain: competitorDomain,
        name: competitorName || undefined,
      });

      // Then trigger the N8N webhook for analysis
      const response = await sendN8nWebhook("webhook/competitors-onboarding", {
        website_id: selectedWebsite.id,
        website_name: selectedWebsite.display_name,
        website_url: selectedWebsite.domain,
        competitors_url: addProtocol(competitorDomain),
        display_name: competitorName,
        workspace_id: currentWorkspace?.id,
      });

      if (!response.success) {
        toast({
          title: "Warning",
          description: "Competitor added but analysis webhook failed. Analysis may be delayed.",
          variant: "default",
        });
      } else {
        toast({
          title: "Competitor added successfully!",
          description: `Analysis started for ${competitorDomain}`,
        });
      }

      // Reset form
      setCompetitorName("");
      setCompetitorDomain("");
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is already handled by the mutation
      console.error("Failed to add competitor:", error);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    try {
      await deleteCompetitorMutation.mutateAsync({
        competitorId,
        websiteId: selectedWebsiteId,
      });
      setShowDeleteConfirm(false);
      setCompetitorToDelete(null);
    } catch (error) {
      // Error is already handled by the mutation
      console.error("Failed to delete competitor:", error);
    }
  };

  const confirmDelete = (competitorId: string) => {
    setCompetitorToDelete(competitorId);
    setShowDeleteConfirm(true);
  };

  const handleExportData = async (format: "pdf" | "csv" | "json") => {
    if (!hasData) {
      toast({
        title: "No data to export",
        description: "Please add competitors before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Use the competitor service export functionality
      const { competitorService } = await import("@/services/competitorService");
      const blob = await competitorService.exportCompetitorData(
        selectedWebsiteId,
        format,
        dateRange
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `competitors-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Competitor data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export competitor data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading state
  if (workspaceLoading || isLoading) {
    return (
      <CompetitorsLoadingState
        workspaceLoading={workspaceLoading}
        isLoading={isLoading}
      />
    );
  }

  const workspaceRequiredState = (
    <WorkspaceRequiredState
      currentWorkspace={currentWorkspace}
      websiteId={websiteId}
    />
  );

  if (!currentWorkspace || !websiteId) {
    return workspaceRequiredState;
  }

  return (
    <>
      <div className="space-y-6">
        <CompetitorsHeader
          totalCompetitors={analytics?.totalCompetitors || 0}
          activeCompetitors={analytics?.activeCompetitors || 0}
          dateFilter={dateFilter}
          sortBy={sortBy}
          isRefreshing={isRefreshing}
          isExporting={isExporting}
          hasData={hasData}
          isAddDialogOpen={isAddDialogOpen}
          competitorDomain={competitorDomain}
          competitorName={competitorName}
          selectedWebsiteId={selectedWebsiteId}
          isAdding={addCompetitorMutation.isPending}
          websites={websites || []}
          websitesLoading={workspaceLoading}
          setDateFilter={setDateFilter}
          setSortBy={setSortBy}
          setIsAddDialogOpen={setIsAddDialogOpen}
          setCompetitorDomain={setCompetitorDomain}
          setCompetitorName={setCompetitorName}
          setSelectedWebsiteId={setSelectedWebsiteId}
          refreshData={refetch}
          handleExportData={handleExportData}
          handleAddCompetitor={handleAddCompetitor}
        />

        {/* Error State */}
        {error && (
          <CompetitorsErrorState
            error={error}
            isRefreshing={isRefreshing}
            refreshData={refetch}
            clearError={() => {}} // Error will clear on successful refetch
          />
        )}

        {/* Share of Voice Chart */}
        <ShareOfVoiceChart
          data={shareOfVoiceData}
          dateFilter={dateFilter}
          isExporting={isExporting}
          handleExportData={handleExportData}
        />

        {/* Competitors List */}
        <CompetitorsList
          performance={performance}
          sortBy={sortBy}
          confirmDelete={confirmDelete}
        />

        {/* Competitive Gap Analysis */}
        <CompetitiveGapChart
          data={competitiveGapData}
          analytics={analytics}
          gapAnalysis={analytics?.gapAnalysis || []}
          dateFilter={dateFilter}
          isExporting={isExporting}
          handleExportData={handleExportData}
        />

        {/* Competitive Intelligence */}
        <CompetitorInsights
          insights={analytics?.insights || []}
          isLoading={isLoading}
          onRefresh={handleInsightsRefresh}
        />

        {/* Time Series Chart */}
        <TimeSeriesChart data={analytics?.timeSeriesData || []} />

        {/* Main Empty State */}
        {!hasData && !isLoading && (
          <CompetitorsEmptyState setIsAddDialogOpen={setIsAddDialogOpen} />
        )}

        {/* Empty Charts State */}
        {hasData && shareOfVoiceData.length === 0 && (
          <NoAnalyticsState
            refreshData={refetch}
            isRefreshing={isRefreshing}
          />
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCompetitorToDelete(null);
        }}
        onConfirm={() =>
          competitorToDelete
            ? handleDeleteCompetitor(competitorToDelete)
            : undefined
        }
        title="Remove Competitor"
        description="Are you sure you want to remove this competitor from tracking? This action cannot be undone and will permanently delete all associated competitor analysis data."
        confirmText="Remove Competitor"
        variant="destructive"
      />
    </>
  );
}
