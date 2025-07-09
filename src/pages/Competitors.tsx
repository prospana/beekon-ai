import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useCompetitors } from '@/hooks/useCompetitors';
import { useWorkspace } from '@/hooks/useWorkspace';
import { CompetitorIllustration, EmptyAnalyticsIllustration } from '@/components/illustrations/CompetitorIllustration';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, Users, MoreHorizontal, Trash2, Globe, TrendingUp, TrendingDown, RefreshCw, Download, AlertCircle, Filter, Building, ExternalLink, Target, BarChart3 } from 'lucide-react';

export default function Competitors() {
  const { currentWorkspace, websites, loading: workspaceLoading } = useWorkspace();
  const { toast } = useToast();
  
  // State for UI controls
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [competitorDomain, setCompetitorDomain] = useState('');
  const [competitorName, setCompetitorName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [competitorToDelete, setCompetitorToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const [sortBy, setSortBy] = useState<'shareOfVoice' | 'averageRank' | 'mentionCount' | 'sentimentScore'>('shareOfVoice');
  const [isExporting, setIsExporting] = useState(false);

  // Get first website ID for competitor tracking
  const websiteId = websites?.[0]?.id;

  // Calculate date range
  const dateRange = (() => {
    const end = new Date();
    const start = new Date();
    const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
    start.setDate(end.getDate() - days);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  })();

  // Use competitors hook with filters
  const {
    competitors,
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
    sortOrder: 'desc',
  });

  // Prepare chart data from analytics
  const shareOfVoiceData = analytics?.marketShareData.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.name === 'Your Brand' ? 'hsl(var(--primary))' : 
          item.competitorId ? `hsl(var(--chart-${(item.competitorId.length % 4) + 2}))` : 
          'hsl(var(--muted))'
  })) || [];

  const competitiveGapData = analytics?.competitiveGaps.map(gap => {
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
        title: 'Error',
        description: 'Please enter a competitor domain',
        variant: 'destructive',
      });
      return;
    }

    if (!websiteId) {
      toast({
        title: 'Error',
        description: 'No website selected for competitor tracking',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      await addCompetitor(competitorDomain.trim(), competitorName.trim() || undefined);
      
      setCompetitorDomain('');
      setCompetitorName('');
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

  const handleExportData = async (format: 'pdf' | 'csv' | 'json') => {
    if (!hasData) {
      toast({
        title: 'No data to export',
        description: 'Please add competitors before exporting.',
        variant: 'destructive',
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return () => <div className="w-5 h-5" />; // Placeholder for stable
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  // Show loading state
  if (workspaceLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground">
              {workspaceLoading ? "Loading workspace..." : "Loading competitor data..."}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded animate-pulse" />
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground">
              Monitor your competitive landscape in AI responses
            </p>
          </div>
        </div>
        
        <EmptyState
          icon={Building}
          title="No Workspace Selected"
          description="You need to select or create a workspace before you can track competitors and monitor your competitive landscape."
          size="lg"
          actions={[
            {
              label: "View Workspaces",
              onClick: () => (window.location.href = "/settings"),
              variant: "default",
              icon: ExternalLink,
            },
          ]}
        />
      </div>
    );
  }

  // Show website requirement message
  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground">
              Monitor your competitive landscape in AI responses
            </p>
          </div>
        </div>
        
        <EmptyState
          icon={Globe}
          title="No Websites Added"
          description="Add a website to your workspace first to start tracking competitors and monitoring how you compare against them in AI responses."
          size="lg"
          actions={[
            {
              label: "Add Website",
              onClick: () => (window.location.href = "/websites"),
              variant: "default",
              icon: Plus,
            },
            {
              label: "Learn More",
              onClick: () => (window.location.href = "/"),
              variant: "outline",
              icon: ExternalLink,
            },
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground">
              Monitor your competitive landscape in AI responses
              {analytics && (
                <span className="ml-2">
                  • {analytics.totalCompetitors} competitors tracked
                  • {analytics.activeCompetitors} active
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex gap-1 mr-2">
              {['7d', '30d', '90d'].map((period) => (
                <Button
                  key={period}
                  variant={dateFilter === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDateFilter(period as '7d' | '30d' | '90d')}
                  disabled={isRefreshing}
                >
                  {period}
                </Button>
              ))}
            </div>
            
            <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shareOfVoice">Share of Voice</SelectItem>
                <SelectItem value="averageRank">Average Rank</SelectItem>
                <SelectItem value="mentionCount">Mention Count</SelectItem>
                <SelectItem value="sentimentScore">Sentiment Score</SelectItem>
              </SelectContent>
            </Select>
            
            <LoadingButton
              variant="outline"
              size="sm"
              loading={isRefreshing}
              loadingText="Refreshing..."
              onClick={refreshData}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </LoadingButton>
            
            <LoadingButton
              variant="outline"
              size="sm"
              loading={isExporting}
              loadingText="Exporting..."
              onClick={() => handleExportData('csv')}
              icon={<Download className="h-4 w-4" />}
              disabled={!hasData}
            >
              Export
            </LoadingButton>
        
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Competitor</DialogTitle>
                  <DialogDescription>
                    Add a competitor to track their AI visibility performance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competitorDomain">Competitor Domain</Label>
                    <Input
                      id="competitorDomain"
                      placeholder="competitor.com"
                      value={competitorDomain}
                      onChange={(e) => setCompetitorDomain(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitorName">Company Name (Optional)</Label>
                    <Input
                      id="competitorName"
                      placeholder="Competitor Inc"
                      value={competitorName}
                      onChange={(e) => setCompetitorName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                  <LoadingButton 
                    onClick={handleAddCompetitor}
                    loading={isAdding}
                    loadingText="Adding..."
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Competitor
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{error.message}</span>
                <div className="flex gap-2">
                  <Button
                    onClick={refreshData}
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button onClick={clearError} variant="outline" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Share of Voice Chart */}
        {shareOfVoiceData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Share of Voice Comparison</CardTitle>
                  <CardDescription>
                    How your brand compares to competitors in AI responses (last {dateFilter})
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData('pdf')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shareOfVoiceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Share of Voice']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Competitors List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tracked Competitors</CardTitle>
                <CardDescription>
                  Competitors you're currently monitoring (sorted by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()})
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {performance.length} competitor{performance.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.map((competitor) => {
                const TrendIcon = getTrendIcon(competitor.trend);
                return (
                  <div key={competitor.competitorId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{competitor.name}</h4>
                        <p className="text-sm text-muted-foreground">{competitor.domain}</p>
                        {competitor.lastAnalyzed && (
                          <p className="text-xs text-muted-foreground">
                            Last analyzed: {new Date(competitor.lastAnalyzed).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Share of Voice</div>
                        <div className="font-medium text-lg">{competitor.shareOfVoice}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Avg Rank</div>
                        <div className="font-medium text-lg">
                          {competitor.averageRank > 0 ? competitor.averageRank.toFixed(1) : 'N/A'}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Mentions</div>
                        <div className="font-medium text-lg">{competitor.mentionCount}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Sentiment</div>
                        <div className="font-medium text-lg">{competitor.sentimentScore}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Trend</div>
                        <div className="flex justify-center">
                          <TrendIcon className={`h-5 w-5 ${getTrendColor(competitor.trend)}`} />
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => confirmDelete(competitor.competitorId)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Competitive Gap Analysis */}
        {competitiveGapData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Competitive Gap Analysis</CardTitle>
                  <CardDescription>
                    Topic-by-topic comparison with your competitors (last {dateFilter})
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData('json')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={competitiveGapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Visibility Score']} />
                  <Bar dataKey="yourBrand" name="Your Brand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  {analytics?.competitiveGaps[0]?.competitors.map((comp, index) => (
                    <Bar 
                      key={comp.competitorId}
                      dataKey={`competitor${index + 1}`} 
                      name={comp.name} 
                      fill={`hsl(var(--chart-${index + 2}))`} 
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Time Series Chart */}
        {analytics?.timeSeriesData && analytics.timeSeriesData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Competitive Performance Over Time</CardTitle>
              <CardDescription>
                Share of voice trends for you and your competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                  {analytics.timeSeriesData[0]?.competitors.map((comp, index) => (
                    <Line 
                      key={comp.competitorId}
                      type="monotone" 
                      dataKey={`competitors[${index}].shareOfVoice`}
                      stroke={`hsl(var(--chart-${index + 1}))`}
                      strokeWidth={2}
                      name={comp.name}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Main Empty State */}
        {!hasData && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Empty State */}
            <EmptyState
              illustration={<CompetitorIllustration className="w-40 h-40" />}
              title="Start Tracking Competitors"
              description="Add competitors to monitor your competitive landscape and discover how your brand performs against them in AI responses across different LLMs and topics."
              size="lg"
              actions={[
                {
                  label: "Add Your First Competitor",
                  onClick: () => setIsAddDialogOpen(true),
                  variant: "default",
                  icon: Plus,
                },
                {
                  label: "View Demo",
                  onClick: () => toast({
                    title: "Demo Feature",
                    description: "Demo functionality would be implemented here",
                  }),
                  variant: "outline",
                  icon: Target,
                },
              ]}
            />

            {/* Secondary Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  What You'll Get
                </CardTitle>
                <CardDescription>
                  Comprehensive competitive intelligence for AI visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-sm">Share of Voice Analysis</h4>
                      <p className="text-xs text-muted-foreground">
                        See how often your competitors are mentioned vs. your brand
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-sm">Ranking Comparisons</h4>
                      <p className="text-xs text-muted-foreground">
                        Track average ranking positions across different LLMs
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-sm">Sentiment Analysis</h4>
                      <p className="text-xs text-muted-foreground">
                        Compare sentiment scores and competitive positioning
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-sm">Gap Analysis</h4>
                      <p className="text-xs text-muted-foreground">
                        Identify opportunities by topic and keyword performance
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty Charts State */}
        {hasData && shareOfVoiceData.length === 0 && (
          <EmptyState
            illustration={<EmptyAnalyticsIllustration className="w-32 h-32" />}
            title="No Analytics Data Available"
            description="Your competitors have been added but we're still processing their performance data. Analytics will appear here once analysis is complete."
            size="md"
            actions={[
              {
                label: "Refresh Data",
                onClick: refreshData,
                variant: "outline",
                icon: RefreshCw,
                loading: isRefreshing,
                loadingText: "Refreshing...",
              },
            ]}
          />
        )}
      </div>
      
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCompetitorToDelete(null);
        }}
        onConfirm={() => competitorToDelete && handleDeleteCompetitor(competitorToDelete)}
        title="Remove Competitor"
        description="Are you sure you want to remove this competitor from tracking? This action cannot be undone and will permanently delete all associated competitor analysis data."
        confirmText="Remove Competitor"
        variant="destructive"
      />
    </>
  );
}