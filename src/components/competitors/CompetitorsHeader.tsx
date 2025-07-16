import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw, Download, Filter } from 'lucide-react';

interface CompetitorsHeaderProps {
  totalCompetitors: number;
  activeCompetitors: number;
  dateFilter: '7d' | '30d' | '90d';
  sortBy: 'shareOfVoice' | 'averageRank' | 'mentionCount' | 'sentimentScore';
  isRefreshing: boolean;
  isExporting: boolean;
  hasData: boolean;
  isAddDialogOpen: boolean;
  competitorDomain: string;
  competitorName: string;
  isAdding: boolean;
  setDateFilter: (value: '7d' | '30d' | '90d') => void;
  setSortBy: (value: 'shareOfVoice' | 'averageRank' | 'mentionCount' | 'sentimentScore') => void;
  setIsAddDialogOpen: (value: boolean) => void;
  setCompetitorDomain: (value: string) => void;
  setCompetitorName: (value: string) => void;
  refreshData: () => void;
  handleExportData: (format: 'csv') => void;
  handleAddCompetitor: () => void;
}

export default function CompetitorsHeader({
  totalCompetitors,
  activeCompetitors,
  dateFilter,
  sortBy,
  isRefreshing,
  isExporting,
  hasData,
  isAddDialogOpen,
  competitorDomain,
  competitorName,
  isAdding,
  setDateFilter,
  setSortBy,
  setIsAddDialogOpen,
  setCompetitorDomain,
  setCompetitorName,
  refreshData,
  handleExportData,
  handleAddCompetitor,
}: CompetitorsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Competitors</h1>
        <p className="text-muted-foreground">
          Monitor your competitive landscape in AI responses
          {totalCompetitors > 0 && (
            <span className="ml-2">
              • {totalCompetitors} competitors tracked
              • {activeCompetitors} active
            </span>
          )}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex gap-1 mr-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={dateFilter === period ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateFilter(period)}
              disabled={isRefreshing}
            >
              {period}
            </Button>
          ))}
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
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
  );
}