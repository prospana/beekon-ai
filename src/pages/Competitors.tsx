import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Users, MoreHorizontal, Trash2, Globe, TrendingUp, TrendingDown } from 'lucide-react';

export default function Competitors() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [competitorDomain, setCompetitorDomain] = useState('');
  const [competitorName, setCompetitorName] = useState('');
  const { toast } = useToast();

  // Mock data
  const competitors = [
    {
      id: 1,
      domain: 'competitor1.com',
      name: 'Competitor One',
      shareOfVoice: 34,
      avgRank: 2.1,
      trend: 'up'
    },
    {
      id: 2,
      domain: 'rival-company.io',
      name: 'Rival Company',
      shareOfVoice: 28,
      avgRank: 2.8,
      trend: 'down'
    },
    {
      id: 3,
      domain: 'bigplayer.tech',
      name: 'Big Player',
      shareOfVoice: 18,
      avgRank: 3.2,
      trend: 'up'
    },
  ];

  const shareOfVoiceData = [
    { name: 'Your Brand', value: 42, fill: 'hsl(var(--primary))' },
    { name: 'Competitor One', value: 34, fill: 'hsl(var(--chart-2))' },
    { name: 'Rival Company', value: 28, fill: 'hsl(var(--chart-3))' },
    { name: 'Big Player', value: 18, fill: 'hsl(var(--chart-4))' },
    { name: 'Others', value: 12, fill: 'hsl(var(--muted))' },
  ];

  const competitiveGapData = [
    { topic: 'AI Tools', yourBrand: 85, competitor1: 78, competitor2: 65, competitor3: 72 },
    { topic: 'Software Solutions', yourBrand: 72, competitor1: 68, competitor2: 81, competitor3: 58 },
    { topic: 'Machine Learning', yourBrand: 68, competitor1: 82, competitor2: 71, competitor3: 88 },
    { topic: 'Data Analytics', yourBrand: 91, competitor1: 74, competitor2: 69, competitor3: 77 },
  ];

  const handleAddCompetitor = () => {
    if (!competitorDomain) {
      toast({
        title: 'Error',
        description: 'Please enter a competitor domain',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Competitor added!',
      description: `Started tracking ${competitorDomain}`,
    });

    setCompetitorDomain('');
    setCompetitorName('');
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground">
            Monitor your competitive landscape in AI responses
          </p>
        </div>
        
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
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCompetitor}>Add Competitor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Share of Voice Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Share of Voice Comparison</CardTitle>
          <CardDescription>
            How your brand compares to competitors in AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shareOfVoiceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 50]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value) => [`${value}%`, 'Share of Voice']} />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Competitors List */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Competitors</CardTitle>
          <CardDescription>
            Competitors you're currently monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor) => (
              <div key={competitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{competitor.name}</h4>
                    <p className="text-sm text-muted-foreground">{competitor.domain}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Share of Voice</div>
                    <div className="font-medium text-lg">{competitor.shareOfVoice}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Avg Rank</div>
                    <div className="font-medium text-lg">{competitor.avgRank}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Trend</div>
                    <div className="flex justify-center">
                      {competitor.trend === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Gap Analysis</CardTitle>
          <CardDescription>
            Topic-by-topic comparison with your competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={competitiveGapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="yourBrand" name="Your Brand" fill="hsl(var(--primary))" />
              <Bar dataKey="competitor1" name="Competitor One" fill="hsl(var(--chart-2))" />
              <Bar dataKey="competitor2" name="Rival Company" fill="hsl(var(--chart-3))" />
              <Bar dataKey="competitor3" name="Big Player" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Empty State */}
      {competitors.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No competitors tracked yet</CardTitle>
            <CardDescription className="mb-4">
              Add competitors to start monitoring your competitive landscape
            </CardDescription>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}