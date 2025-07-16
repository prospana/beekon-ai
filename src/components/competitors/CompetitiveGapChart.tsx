import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { CompetitorAnalytics } from '@/services/competitorService';

interface CompetitiveGapChartProps {
  data: Array<Record<string, number | string>>;
  analytics: CompetitorAnalytics | null;
  dateFilter: '7d' | '30d' | '90d';
  isExporting: boolean;
  handleExportData: (format: 'json') => void;
}

export default function CompetitiveGapChart({
  data,
  analytics,
  dateFilter,
  isExporting,
  handleExportData,
}: CompetitiveGapChartProps) {
  if (data.length === 0) return null;

  return (
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
          <BarChart data={data}>
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
  );
}