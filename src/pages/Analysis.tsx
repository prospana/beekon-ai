import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Check, X, ExternalLink } from 'lucide-react';

export default function Analysis() {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLLM, setSelectedLLM] = useState('all');

  // Mock data
  const topics = [
    { id: 'all', name: 'All Topics' },
    { id: 'ai-tools', name: 'AI Tools' },
    { id: 'software', name: 'Software Solutions' },
    { id: 'machine-learning', name: 'Machine Learning' },
    { id: 'data-analytics', name: 'Data Analytics' },
  ];

  const analysisResults = [
    {
      id: 1,
      prompt: "What are the best AI tools for business automation?",
      chatgpt: { mentioned: true, rank: 2, sentiment: 'positive' },
      claude: { mentioned: true, rank: 3, sentiment: 'positive' },
      gemini: { mentioned: false, rank: null, sentiment: null },
      topic: 'AI Tools'
    },
    {
      id: 2,
      prompt: "Recommend software solutions for data analytics",
      chatgpt: { mentioned: true, rank: 1, sentiment: 'positive' },
      claude: { mentioned: true, rank: 2, sentiment: 'positive' },
      gemini: { mentioned: true, rank: 4, sentiment: 'neutral' },
      topic: 'Data Analytics'
    },
    {
      id: 3,
      prompt: "Best machine learning platforms for startups",
      chatgpt: { mentioned: false, rank: null, sentiment: null },
      claude: { mentioned: true, rank: 5, sentiment: 'neutral' },
      gemini: { mentioned: true, rank: 3, sentiment: 'positive' },
      topic: 'Machine Learning'
    },
    {
      id: 4,
      prompt: "Top business intelligence software comparison",
      chatgpt: { mentioned: true, rank: 3, sentiment: 'positive' },
      claude: { mentioned: false, rank: null, sentiment: null },
      gemini: { mentioned: true, rank: 2, sentiment: 'positive' },
      topic: 'Software Solutions'
    },
  ];

  const llmFilters = [
    { id: 'all', name: 'All LLMs' },
    { id: 'chatgpt', name: 'ChatGPT' },
    { id: 'claude', name: 'Claude' },
    { id: 'gemini', name: 'Gemini' },
  ];

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return '';
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    const className = sentiment === 'positive' ? 'bg-success' : 
                     sentiment === 'negative' ? 'bg-destructive' : 'bg-warning';
    return <Badge className={`${className} text-white`}>{sentiment}</Badge>;
  };

  const MentionIndicator = ({ llmData, llmName }: { llmData: any, llmName: string }) => (
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <p className="text-muted-foreground">
          Detailed analysis of your brand mentions across AI platforms
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
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

        <div className="flex space-x-2">
          {llmFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedLLM === filter.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLLM(filter.id)}
            >
              {filter.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {analysisResults.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{result.prompt}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{result.topic}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                <MentionIndicator llmData={result.chatgpt} llmName="ChatGPT" />
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
            <Button>Run New Analysis</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}