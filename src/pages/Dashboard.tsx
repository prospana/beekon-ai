import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceModal } from "@/components/WorkspaceModal";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  MessageSquare,
  Zap,
  Download,
  RefreshCw,
  ExternalLink,
  Building,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { toast } = useToast();
  const { currentWorkspace, loading } = useWorkspace();
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  // Mock data
  const visibilityData = [
    { date: "2024-01-01", visibility: 65 },
    { date: "2024-01-02", visibility: 68 },
    { date: "2024-01-03", visibility: 72 },
    { date: "2024-01-04", visibility: 70 },
    { date: "2024-01-05", visibility: 75 },
    { date: "2024-01-06", visibility: 78 },
    { date: "2024-01-07", visibility: 82 },
  ];

  const performanceData = [
    {
      topic: "AI Tools",
      visibility: 85,
      rank: 2.1,
      sentiment: "positive",
      trending: "up",
    },
    {
      topic: "Software Solutions",
      visibility: 72,
      rank: 3.2,
      sentiment: "positive",
      trending: "up",
    },
    {
      topic: "Machine Learning",
      visibility: 68,
      rank: 2.8,
      sentiment: "neutral",
      trending: "down",
    },
    {
      topic: "Data Analytics",
      visibility: 91,
      rank: 1.9,
      sentiment: "positive",
      trending: "up",
    },
    {
      topic: "Cloud Services",
      visibility: 45,
      rank: 4.1,
      sentiment: "negative",
      trending: "down",
    },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-success";
      case "negative":
        return "bg-destructive";
      default:
        return "bg-warning";
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-warning";
    }
  };

  const handleExportData = async (format: "pdf" | "csv") => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Export successful",
        description: `Dashboard data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Data refreshed",
        description:
          "Dashboard data has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMetricClick = (metricName: string) => {
    toast({
      title: `${metricName} Details`,
      description: `View detailed breakdown for ${metricName}`,
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
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
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome to Beekon.ai</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To get started with monitoring your brand's AI visibility
              performance, you need to create a workspace first.
            </p>
            <LoadingButton
              onClick={() => setShowCreateWorkspace(true)}
              icon={<Plus className="h-4 w-4" />}
              size="lg"
            >
              Create Your First Workspace
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your brand's AI visibility performance
            <span className="ml-2">
              • {currentWorkspace.name}
              {currentWorkspace.credits_remaining !== null && (
                <span className="ml-1 text-sm">
                  ({currentWorkspace.credits_remaining} credits remaining)
                </span>
              )}
            </span>
          </p>
        </div>
        <div className="flex space-x-2">
          <LoadingButton
            variant="outline"
            size="sm"
            loading={isRefreshing}
            loadingText="Refreshing..."
            onClick={handleRefreshData}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </LoadingButton>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={isExporting}
            loadingText="Exporting..."
            onClick={() => handleExportData("pdf")}
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </LoadingButton>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("Overall Visibility Score")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Visibility Score
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">78%</div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("Average Rank")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rank</CardTitle>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8</div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Improved by 0.3
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("Total Mentions")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +23% this month
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("Sentiment Score")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sentiment Score
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">84%</div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Visibility Over Time</CardTitle>
              <CardDescription>
                Your brand's visibility trend across all LLMs (last 7 days)
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData("csv")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visibilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value}%`, "Visibility Score"]}
              />
              <Line
                type="monotone"
                dataKey="visibility"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance by Topic */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>
                How your brand performs across different topics and keywords
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData("pdf")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{item.topic}</h4>
                    {item.trending === "up" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Visibility</span>
                        <span className="font-medium">{item.visibility}%</span>
                      </div>
                      <Progress value={item.visibility} className="h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Avg Rank
                      </div>
                      <div className="font-medium">{item.rank}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Sentiment
                      </div>
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${getSentimentColor(
                            item.sentiment
                          )} mr-1`}
                        />
                        <span
                          className={`text-sm capitalize ${getSentimentText(
                            item.sentiment
                          )}`}
                        >
                          {item.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
