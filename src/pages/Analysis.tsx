import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalysisConfigModal } from "@/components/AnalysisConfigModal";
import { DetailedAnalysisModal } from "@/components/DetailedAnalysisModal";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, ExternalLink, Plus, Filter } from "lucide-react";

interface LLMData {
  mentioned: boolean;
  rank: number | null;
  sentiment: string | null;
}

interface AnalysisResult {
  id: number;
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
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedLLM, setSelectedLLM] = useState("all");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null
  );
  const [isFiltering, setIsFiltering] = useState(false);

  // Mock data
  const topics = [
    { id: "all", name: "All Topics" },
    { id: "ai-tools", name: "AI Tools" },
    { id: "software", name: "Software Solutions" },
    { id: "machine-learning", name: "Machine Learning" },
    { id: "data-analytics", name: "Data Analytics" },
  ];

  const analysisResults = [
    {
      id: 1,
      prompt: "What are the best AI tools for business automation?",
      chatgpt: { mentioned: true, rank: 2, sentiment: "positive" },
      claude: { mentioned: true, rank: 3, sentiment: "positive" },
      gemini: { mentioned: false, rank: null, sentiment: null },
      topic: "AI Tools",
      timestamp: "2024-01-07T10:30:00Z",
      confidence: 92,
    },
    {
      id: 2,
      prompt: "Recommend software solutions for data analytics",
      chatgpt: { mentioned: true, rank: 1, sentiment: "positive" },
      claude: { mentioned: true, rank: 2, sentiment: "positive" },
      gemini: { mentioned: true, rank: 4, sentiment: "neutral" },
      topic: "Data Analytics",
      timestamp: "2024-01-07T09:15:00Z",
      confidence: 88,
    },
    {
      id: 3,
      prompt: "Best machine learning platforms for startups",
      chatgpt: { mentioned: false, rank: null, sentiment: null },
      claude: { mentioned: true, rank: 5, sentiment: "neutral" },
      gemini: { mentioned: true, rank: 3, sentiment: "positive" },
      topic: "Machine Learning",
      timestamp: "2024-01-07T08:45:00Z",
      confidence: 75,
    },
    {
      id: 4,
      prompt: "Top business intelligence software comparison",
      chatgpt: { mentioned: true, rank: 3, sentiment: "positive" },
      claude: { mentioned: false, rank: null, sentiment: null },
      gemini: { mentioned: true, rank: 2, sentiment: "positive" },
      topic: "Software Solutions",
      timestamp: "2024-01-06T16:20:00Z",
      confidence: 84,
    },
  ];

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

  const handleViewDetails = (result: AnalysisResult) => {
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

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground">
            Detailed analysis of your brand mentions across AI platforms
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedTopic}
                onValueChange={(value) => handleFilterChange("topic", value)}
                disabled={isFiltering}
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

            <div className="flex space-x-2">
              {llmFilters.map((filter) => (
                <LoadingButton
                  key={filter.id}
                  variant={selectedLLM === filter.id ? "default" : "outline"}
                  size="sm"
                  loading={isFiltering && selectedLLM !== filter.id}
                  onClick={() => handleFilterChange("llm", filter.id)}
                >
                  {filter.name}
                </LoadingButton>
              ))}
            </div>
          </div>

          <LoadingButton
            onClick={() => setIsConfigModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Analysis
          </LoadingButton>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {analysisResults.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {result.prompt}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{result.topic}</Badge>
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
                  <MentionIndicator llmData={result.claude} llmName="Claude" />
                  <MentionIndicator llmData={result.gemini} llmName="Gemini" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {analysisResults.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No analysis results found</CardTitle>
              <CardDescription className="mb-4">
                Try adjusting your filters or run a new analysis
              </CardDescription>
              <LoadingButton
                onClick={() => setIsConfigModalOpen(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                Run New Analysis
              </LoadingButton>
            </CardContent>
          </Card>
        )}
      </div>

      <AnalysisConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      <DetailedAnalysisModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        analysisResult={selectedResult}
      />
    </>
  );
}
