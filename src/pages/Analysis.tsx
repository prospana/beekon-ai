import { AnalysisConfigModal } from "@/components/AnalysisConfigModal";
import { AnalysisErrorBoundary } from "@/components/AnalysisErrorBoundary";
import {
  AnalysisFilterSkeleton,
  AnalysisListSkeleton,
  AnalysisStatsSkeleton,
} from "@/components/AnalysisLoadingSkeleton";
import {
  AnalysisVisualization,
  RankingChart,
  SentimentChart,
} from "@/components/AnalysisVisualization";
import { DetailedAnalysisModal } from "@/components/DetailedAnalysisModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceModal } from "@/components/WorkspaceModal";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisErrorHandler } from "@/hooks/useAnalysisError";
import { useSubscriptionEnforcement } from "@/hooks/useSubscriptionEnforcement";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  analysisService,
  type AnalysisResult,
} from "@/services/analysisService";
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface LLMData {
  mentioned: boolean;
  rank: number | null;
  sentiment: string | null;
  response?: string;
}

interface LegacyAnalysisResult {
  id: string;
  prompt: string;
  chatgpt: LLMData;
  claude: LLMData;
  gemini: LLMData;
  topic: string;
  timestamp: string;
  confidence: number;
}

export default function Analysis() {
  const { toast } = useToast();
  const { currentWorkspace, loading, websites } = useWorkspace();
  const { enforceLimit, getRemainingCredits } = useSubscriptionEnforcement();
  const { error, isRetrying, handleError, retryOperation, clearError } =
    useAnalysisErrorHandler();
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedLLM, setSelectedLLM] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<LegacyAnalysisResult | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [showVisualization, setShowVisualization] = useState(true);

  // Set selected website to first website when websites load
  useEffect(() => {
    if (websites && websites.length > 0 && !selectedWebsite) {
      setSelectedWebsite(websites[0]!.id);
    }
  }, [websites, selectedWebsite]);

  // Load analysis results
  const loadAnalysisResults = useCallback(async () => {
    if (!selectedWebsite) return;

    setIsLoadingResults(true);
    clearError();

    try {
      const filters = {
        topic: selectedTopic !== "all" ? selectedTopic : undefined,
        llmProvider: selectedLLM !== "all" ? selectedLLM : undefined,
      };

      const results = await analysisService.getAnalysisResults(
        selectedWebsite,
        filters
      );
      setAnalysisResults(results);
    } catch (error) {
      console.error("Failed to load analysis results:", error);
      handleError(error);
      toast({
        title: "Error",
        description: "Failed to load analysis results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResults(false);
    }
  }, [
    selectedWebsite,
    selectedTopic,
    selectedLLM,
    toast,
    handleError,
    clearError,
  ]);

  // Load topics for the selected website
  const loadTopics = useCallback(async () => {
    if (!selectedWebsite) return;

    try {
      const websiteTopics = await analysisService.getTopicsForWebsite(
        selectedWebsite
      );
      setTopics([{ id: "all", name: "All Topics" }, ...websiteTopics]);
    } catch (error) {
      console.error("Failed to load topics:", error);
      handleError(error);
    }
  }, [selectedWebsite, handleError]);

  // Load data when dependencies change
  useEffect(() => {
    loadAnalysisResults();
  }, [loadAnalysisResults]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // Transform analysis results to legacy format for existing components
  const transformToLegacyFormat = (
    results: AnalysisResult[]
  ): LegacyAnalysisResult[] => {
    return results.map((result) => {
      const chatgptResult = result.llm_results.find(
        (r) => r.llm_provider === "chatgpt"
      );
      const claudeResult = result.llm_results.find(
        (r) => r.llm_provider === "claude"
      );
      const geminiResult = result.llm_results.find(
        (r) => r.llm_provider === "gemini"
      );

      const getSentiment = (score: number | null): string | null => {
        if (score === null) return null;
        if (score > 0.1) return "positive";
        if (score < -0.1) return "negative";
        return "neutral";
      };

      return {
        id: result.id,
        prompt: result.prompt,
        chatgpt: {
          mentioned: chatgptResult?.is_mentioned || false,
          rank: chatgptResult?.rank_position || null,
          sentiment: getSentiment(chatgptResult?.sentiment_score || null),
          response: chatgptResult?.response_text || undefined,
        },
        claude: {
          mentioned: claudeResult?.is_mentioned || false,
          rank: claudeResult?.rank_position || null,
          sentiment: getSentiment(claudeResult?.sentiment_score || null),
          response: claudeResult?.response_text || undefined,
        },
        gemini: {
          mentioned: geminiResult?.is_mentioned || false,
          rank: geminiResult?.rank_position || null,
          sentiment: getSentiment(geminiResult?.sentiment_score || null),
          response: geminiResult?.response_text || undefined,
        },
        topic: result.topic,
        timestamp: result.created_at,
        confidence: result.confidence,
      };
    });
  };

  const legacyAnalysisResults = transformToLegacyFormat(analysisResults);

  // Filter results based on search query
  const filteredResults = legacyAnalysisResults.filter((result) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      result.prompt.toLowerCase().includes(searchLower) ||
      result.topic.toLowerCase().includes(searchLower) ||
      result.chatgpt.response?.toLowerCase().includes(searchLower) ||
      result.claude.response?.toLowerCase().includes(searchLower) ||
      result.gemini.response?.toLowerCase().includes(searchLower)
    );
  });

  const llmFilters = [
    { id: "all", name: "All LLMs" },
    { id: "chatgpt", name: "ChatGPT" },
    { id: "claude", name: "Claude" },
    { id: "gemini", name: "Gemini" },
  ];

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return "";
    switch (sentiment) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-warning";
    }
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    const className =
      sentiment === "positive"
        ? "bg-success"
        : sentiment === "negative"
        ? "bg-destructive"
        : "bg-warning";
    return <Badge className={`${className} text-white`}>{sentiment}</Badge>;
  };

  const handleFilterChange = async (filterType: string, value: string) => {
    setIsFiltering(true);
    try {
      if (filterType === "topic") {
        setSelectedTopic(value);
      } else if (filterType === "llm") {
        setSelectedLLM(value);
      }
      // Data will be reloaded automatically via useEffect
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply filter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
    }
  };

  const handleViewDetails = (result: LegacyAnalysisResult) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };

  const MentionIndicator = ({
    llmData,
    llmName,
  }: {
    llmData: LLMData;
    llmName: string;
  }) => (
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">{llmName}</div>
      {llmData.mentioned ? (
        <div className="space-y-1">
          <Check className="h-5 w-5 text-success mx-auto" />
          <div className="text-xs font-medium">#{llmData.rank}</div>
          {getSentimentBadge(llmData.sentiment)}
        </div>
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      )}
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show workspace creation prompt when no workspace exists
  if (!currentWorkspace) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground">
              Detailed analysis of your brand mentions across AI platforms
            </p>
          </div>
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Workspace Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To run and view analysis results, you need to create a workspace
              first. Your workspace will track your usage and manage your
              analysis credits.
            </p>
            <LoadingButton
              onClick={() => setShowCreateWorkspace(true)}
              icon={<Plus className="h-4 w-4" />}
              size="lg"
            >
              Create Workspace
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

  return (
    <AnalysisErrorBoundary>
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground">
              Detailed analysis of your brand mentions across AI platforms
            </p>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-destructive">
                    Error Loading Analysis Data
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {error.message ||
                    "An unexpected error occurred while loading your analysis data."}
                </p>
                <div className="flex gap-3">
                  <LoadingButton
                    onClick={() => retryOperation(loadAnalysisResults)}
                    loading={isRetrying}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </LoadingButton>
                  <Button onClick={clearError} variant="outline" size="sm">
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          {loading ? (
            <AnalysisFilterSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Website Selection */}
              {websites && websites.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedWebsite}
                    onValueChange={setSelectedWebsite}
                    disabled={isLoadingResults}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select website" />
                    </SelectTrigger>
                    <SelectContent>
                      {websites.map((website) => (
                        <SelectItem key={website.id} value={website.id}>
                          {website.display_name || website.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-3">
                  {/* Search Input */}
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search analysis results..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-[300px]"
                      disabled={isLoadingResults}
                    />
                  </div>

                  {/* Topic Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={selectedTopic}
                      onValueChange={(value) =>
                        handleFilterChange("topic", value)
                      }
                      disabled={isFiltering || isLoadingResults}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* LLM Filter Buttons */}
                  <div className="flex gap-3">
                    {llmFilters.map((filter) => (
                      <LoadingButton
                        key={filter.id}
                        variant={
                          selectedLLM === filter.id ? "default" : "outline"
                        }
                        size="sm"
                        loading={isFiltering && selectedLLM !== filter.id}
                        onClick={() => handleFilterChange("llm", filter.id)}
                        disabled={isLoadingResults}
                      >
                        {filter.name}
                      </LoadingButton>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVisualization(!showVisualization)}
                  >
                    {showVisualization ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showVisualization ? "Hide" : "Show"} Analytics
                  </Button>

                  <LoadingButton
                    onClick={() => {
                      if (enforceLimit("websiteAnalyses", "New Analysis")) {
                        setIsConfigModalOpen(true);
                      }
                    }}
                    icon={<Plus className="h-4 w-4" />}
                    disabled={!selectedWebsite || isLoadingResults}
                  >
                    New Analysis
                    {currentWorkspace && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        <span className="text-background">
                          {getRemainingCredits()} left
                        </span>
                      </Badge>
                    )}
                  </LoadingButton>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Visualization */}
          {!loading &&
            !isLoadingResults &&
            showVisualization &&
            filteredResults.length > 0 && (
              <AnalysisVisualization results={filteredResults} />
            )}

          {/* Additional Charts */}
          {!loading &&
            !isLoadingResults &&
            showVisualization &&
            filteredResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SentimentChart results={filteredResults} />
                <RankingChart results={filteredResults} />
              </div>
            )}

          {/* Results */}
          <div className="space-y-4">
            {isLoadingResults ? (
              <AnalysisListSkeleton />
            ) : (
              filteredResults.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 flex flex-col gap-3">
                        <CardTitle>{result.prompt}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{result.topic}</Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(result.timestamp).toLocaleDateString()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Confidence: {result.confidence}%
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(result)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-8">
                      <MentionIndicator
                        llmData={result.chatgpt}
                        llmName="ChatGPT"
                      />
                      <MentionIndicator
                        llmData={result.claude}
                        llmName="Claude"
                      />
                      <MentionIndicator
                        llmData={result.gemini}
                        llmName="Gemini"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Empty State */}
          {!isLoadingResults && filteredResults.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">
                  {analysisResults.length === 0
                    ? "No analysis results found"
                    : "No results match your search"}
                </CardTitle>
                <CardDescription className="mb-4">
                  {analysisResults.length === 0
                    ? "Get started by running your first analysis to see how your brand is mentioned across AI platforms"
                    : "Try adjusting your search terms or filters to find more results"}
                </CardDescription>
                {analysisResults.length === 0 && (
                  <LoadingButton
                    onClick={() => {
                      if (enforceLimit("websiteAnalyses", "New Analysis")) {
                        setIsConfigModalOpen(true);
                      }
                    }}
                    icon={<Plus className="h-4 w-4" />}
                    disabled={!selectedWebsite}
                  >
                    Run New Analysis
                  </LoadingButton>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Stats */}
          {isLoadingResults ? (
            <AnalysisStatsSkeleton />
          ) : (
            filteredResults.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredResults.length} of {analysisResults.length}{" "}
                  results
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span>
                      {
                        filteredResults.filter(
                          (r) =>
                            r.chatgpt.mentioned ||
                            r.claude.mentioned ||
                            r.gemini.mentioned
                        ).length
                      }{" "}
                      mentions
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {
                        filteredResults.filter(
                          (r) =>
                            !r.chatgpt.mentioned &&
                            !r.claude.mentioned &&
                            !r.gemini.mentioned
                        ).length
                      }{" "}
                      no mentions
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <AnalysisConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          websiteId={selectedWebsite}
        />

        <DetailedAnalysisModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          analysisResult={selectedResult}
        />
      </>
    </AnalysisErrorBoundary>
  );
}
