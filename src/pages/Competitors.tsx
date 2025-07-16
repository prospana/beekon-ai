import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useCompetitors } from "@/hooks/useCompetitors";
import { useWorkspace } from "@/hooks/useWorkspace";
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
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [competitorToDelete, setCompetitorToDelete] = useState<string | null>(
    null
  );
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d">("30d");
  const [sortBy, setSortBy] = useState<
    "shareOfVoice" | "averageRank" | "mentionCount" | "sentimentScore"
  >("shareOfVoice");
  const [isExporting, setIsExporting] = useState(false);

  // Get first website ID for competitor tracking
  const websiteId = websites?.[0]?.id;

  // Calculate date range
  const dateRange = (() => {
    const end = new Date();
    const start = new Date();
    const days = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
    start.setDate(end.getDate() - days);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  })();

  // Use competitors hook with filters
  const {
    performance,
    analytics,
    isLoading,
    isRefreshing,
    error,
    addCompetitor,
    deleteCompetitor,
    exportCompetitorData,
    refreshData,
    clearError,
    hasData,
  } = useCompetitors(websiteId, {
    dateRange,
    sortBy,
    sortOrder: "desc",
  });

  // Prepare chart data from analytics
  const shareOfVoiceData =
    analytics?.marketShareData.map((item) => ({
      name: item.name,
      value: item.value,
      fill:
        item.name === "Your Brand"
          ? "hsl(var(--primary))"
          : item.competitorId
          ? `hsl(var(--chart-${(item.competitorId.length % 4) + 2}))`
          : "hsl(var(--muted))",
    })) || [];

  const competitiveGapData =
    analytics?.competitiveGaps.map((gap) => {
      const data: Record<string, number | string> = {
        topic: gap.topic,
        yourBrand: gap.yourBrand,
      };
      gap.competitors.forEach((comp, index) => {
        data[`competitor${index + 1}`] = comp.score;
      });
      return data;
    }) || [];

  const handleAddCompetitor = async () => {
    if (!competitorDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a competitor domain",
        variant: "destructive",
      });
      return;
    }

    if (!websiteId) {
      toast({
        title: "Error",
        description: "No website selected for competitor tracking",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      await addCompetitor(
        competitorDomain.trim(),
        competitorName.trim() || undefined
      );

      setCompetitorDomain("");
      setCompetitorName("");
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    try {
      await deleteCompetitor(competitorId);
      setShowDeleteConfirm(false);
      setCompetitorToDelete(null);
    } catch (error) {
      // Error is already handled by the hook
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
      await exportCompetitorData(format);
    } catch (error) {
      // Error is already handled by the hook
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
          isAdding={isAdding}
          setDateFilter={setDateFilter}
          setSortBy={setSortBy}
          setIsAddDialogOpen={setIsAddDialogOpen}
          setCompetitorDomain={setCompetitorDomain}
          setCompetitorName={setCompetitorName}
          refreshData={refreshData}
          handleExportData={handleExportData}
          handleAddCompetitor={handleAddCompetitor}
        />

        {/* Error State */}
        {error && (
          <CompetitorsErrorState
            error={error}
            isRefreshing={isRefreshing}
            refreshData={refreshData}
            clearError={clearError}
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
          dateFilter={dateFilter}
          isExporting={isExporting}
          handleExportData={handleExportData}
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
            refreshData={refreshData}
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
          competitorToDelete && handleDeleteCompetitor(competitorToDelete)
        }
        title="Remove Competitor"
        description="Are you sure you want to remove this competitor from tracking? This action cannot be undone and will permanently delete all associated competitor analysis data."
        confirmText="Remove Competitor"
        variant="destructive"
      />
    </>
  );
}
