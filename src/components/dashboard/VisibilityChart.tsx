import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VisibilityChartProps {
  timeSeriesData: Array<{
    date: string;
    visibility: number;
  }>;
  dateFilter: string;
  hasData: boolean;
  onExportData: (format: "csv") => void;
}

export function VisibilityChart({
  timeSeriesData,
  dateFilter,
  hasData,
  onExportData,
}: VisibilityChartProps) {
  if (timeSeriesData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Visibility Over Time</CardTitle>
            <CardDescription>
              Your brand's visibility trend across all LLMs (last{" "}
              {dateFilter})
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData("csv")}
              disabled={!hasData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString()
              }
            />
            <YAxis domain={[0, 100]} />
            <RechartsTooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString()
              }
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
  );
}