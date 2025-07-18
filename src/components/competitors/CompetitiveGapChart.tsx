import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";
import { CompetitorAnalytics } from "@/services/competitorService";

interface CompetitiveGapAnalysis {
  competitorId: string;
  competitorName: string;
  marketCompetitiveness: number;
  yourPerformance: number;
  marketSize: number;
  gapScore: number;
}

interface CompetitiveGapChartProps {
  data: Array<Record<string, number | string>>;
  analytics: CompetitorAnalytics | null;
  gapAnalysis: CompetitiveGapAnalysis[];
  dateFilter: "7d" | "30d" | "90d";
  isExporting: boolean;
  handleExportData: (format: "json") => void;
}

export default function CompetitiveGapChart({
  gapAnalysis,
}: CompetitiveGapChartProps) {
  if (!gapAnalysis || gapAnalysis.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Competitive Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No competitive gap data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = gapAnalysis.map((item) => ({
    name: item.competitorName,
    "Market Competitiveness": item.marketCompetitiveness,
    "Your Performance": item.yourPerformance,
    "Market Size": item.marketSize,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Competitors</p>
                <p className="text-2xl font-bold">{gapAnalysis.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Market Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(gapAnalysis.reduce((sum, item) => sum + item.marketCompetitiveness, 0) / gapAnalysis.length)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Avg. Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(gapAnalysis.reduce((sum, item) => sum + item.yourPerformance, 0) / gapAnalysis.length)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Gap Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Market Competitiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Market Competitiveness" fill="#3b82f6" />
                <Bar dataKey="Your Performance" fill="#8b5cf6" />
                <Bar dataKey="Market Size" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis List */}
      <Card>
        <CardHeader>
          <CardTitle>Gap Analysis Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gapAnalysis.map((item) => {
              const gap = item.yourPerformance - item.marketCompetitiveness;
              const gapType = gap > 0 ? "advantage" : gap < 0 ? "opportunity" : "competitive";
              
              return (
                <div key={item.competitorId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.competitorName}</h3>
                    <p className="text-sm text-gray-600">
                      Gap: {Math.abs(gap).toFixed(1)}% ({gapType})
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{item.yourPerformance}% vs {item.marketCompetitiveness}%</p>
                      <p className="text-sm text-gray-600">Market Size: {item.marketSize}%</p>
                    </div>
                    
                    <Badge variant={gap > 0 ? "default" : "secondary"}>
                      {gapType}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}