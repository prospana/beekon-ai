import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingButton } from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { analysisService } from "@/services/analysisService";
import {
  BarChart3,
  ChevronDown,
  Code,
  Copy,
  Download,
  FileText,
  Minus,
  Share,
  Table,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { AnalysisResult, LLMResult } from "@/types/database";

interface DetailedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: AnalysisResult | null;
}

export function DetailedAnalysisModal({
  isOpen,
  onClose,
  analysisResult,
}: DetailedAnalysisModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!analysisResult) return null;

  const handleExport = async (format: "pdf" | "csv" | "json") => {
    if (!analysisResult) return;

    setIsExporting(true);
    try {
      const blob = await analysisService.exportAnalysisResults(
        [analysisResult.id],
        format
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analysis-${analysisResult.id}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Analysis data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export analysis data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveFeedback = async (
    llm: string,
    feedback: "positive" | "negative"
  ) => {
    setIsSaving(true);
    try {
      // Simulate saving feedback
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Feedback saved",
        description: `Your feedback for ${llm} has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-success" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  // Helper function to get sentiment string from score
  const getSentimentFromScore = (score: number | null): string => {
    if (score === null) return "neutral";
    if (score > 0.1) return "positive";
    if (score < -0.1) return "negative";
    return "neutral";
  };

  // Convert modern format to UI format for easier display
  const llmResults = [
    {
      name: "ChatGPT",
      data: {
        mentioned: analysisResult.llm_results.find(r => r.llm_provider === "chatgpt")?.is_mentioned || false,
        rank: analysisResult.llm_results.find(r => r.llm_provider === "chatgpt")?.rank_position || null,
        sentiment: getSentimentFromScore(analysisResult.llm_results.find(r => r.llm_provider === "chatgpt")?.sentiment_score || null),
        response: analysisResult.llm_results.find(r => r.llm_provider === "chatgpt")?.response_text || null,
      },
      color: "bg-green-500"
    },
    {
      name: "Claude",
      data: {
        mentioned: analysisResult.llm_results.find(r => r.llm_provider === "claude")?.is_mentioned || false,
        rank: analysisResult.llm_results.find(r => r.llm_provider === "claude")?.rank_position || null,
        sentiment: getSentimentFromScore(analysisResult.llm_results.find(r => r.llm_provider === "claude")?.sentiment_score || null),
        response: analysisResult.llm_results.find(r => r.llm_provider === "claude")?.response_text || null,
      },
      color: "bg-orange-500"
    },
    {
      name: "Gemini",
      data: {
        mentioned: analysisResult.llm_results.find(r => r.llm_provider === "gemini")?.is_mentioned || false,
        rank: analysisResult.llm_results.find(r => r.llm_provider === "gemini")?.rank_position || null,
        sentiment: getSentimentFromScore(analysisResult.llm_results.find(r => r.llm_provider === "gemini")?.sentiment_score || null),
        response: analysisResult.llm_results.find(r => r.llm_provider === "gemini")?.response_text || null,
      },
      color: "bg-blue-500"
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5" />
              <span>Detailed Analysis Results</span>
            </div>
            {/* <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(analysisResult.prompt)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div> */}
          </DialogTitle>
          <DialogDescription className="text-base">
            Analysis for:{" "}
            <span className="font-medium">"{analysisResult.prompt}"</span>
          </DialogDescription>
          <div className="flex items-center space-x-3">
            <Badge variant="outline">{analysisResult.topic}</Badge>
            <Badge variant="outline">
              Confidence: {analysisResult.confidence}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(analysisResult.created_at).toLocaleString()}
            </span>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Full Responses</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {llmResults.map((llm) => (
                  <Card key={llm.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${llm.color}`}
                          />
                          <CardTitle className="text-lg">{llm.name}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          {llm.data.mentioned ? (
                            <>
                              <Badge className="bg-success">Mentioned</Badge>
                              <Badge variant="outline">
                                Rank #{llm.data.rank}
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="outline">Not Mentioned</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {llm.data.mentioned ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                Sentiment:
                              </span>
                              <div className="flex items-center space-x-1">
                                {getSentimentIcon(llm.data.sentiment)}
                                <span
                                  className={`text-sm capitalize ${getSentimentColor(
                                    llm.data.sentiment
                                  )}`}
                                >
                                  {llm.data.sentiment || "Neutral"}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSaveFeedback(llm.name, "positive")
                                }
                                disabled={isSaving}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSaveFeedback(llm.name, "negative")
                                }
                                disabled={isSaving}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Position: #{llm.data.rank} in recommendation list
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Your brand was not mentioned in the response to this
                          prompt.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="responses" className="space-y-4">
              {llmResults.map((llm) => (
                <Card key={llm.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${llm.color}`} />
                      <span>{llm.name} Response</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {llm.data.response || "No response available for this analysis."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {llm.data.mentioned && (
                            <>
                              <span>
                                Mentioned at position #{llm.data.rank}
                              </span>
                              <span>•</span>
                              <span
                                className={getSentimentColor(
                                  llm.data.sentiment
                                )}
                              >
                                {llm.data.sentiment || "Neutral"} sentiment
                              </span>
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              llm.data.response || "No response available for this analysis."
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>
                    Analysis summary and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span>Strengths</span>
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Mentioned by 2 out of 3 AI models</li>
                        <li>• Positive sentiment across mentions</li>
                        <li>• High ranking positions (#2, #3)</li>
                        <li>• Consistent brand recognition</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-warning" />
                        <span>Opportunities</span>
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Improve visibility in Gemini responses</li>
                        <li>• Enhance keyword associations</li>
                        <li>• Strengthen competitive positioning</li>
                        <li>• Increase mention frequency</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        • Focus on improving content and SEO for topics related
                        to "{analysisResult.topic}"
                      </p>
                      <p>
                        • Create more comprehensive documentation and case
                        studies
                      </p>
                      <p>
                        • Engage with AI training data sources and industry
                        publications
                      </p>
                      <p>
                        • Monitor competitor mentions and positioning strategies
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <LoadingButton
                  variant="outline"
                  size="sm"
                  loading={isExporting}
                  loadingText="Exporting..."
                  icon={<Download className="h-4 w-4" />}
                >
                  Export
                  <ChevronDown className="h-4 w-4 ml-1" />
                </LoadingButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <Table className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <Code className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(analysisResult.prompt)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt
            </Button>

            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
