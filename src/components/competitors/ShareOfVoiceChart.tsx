import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";

interface ShareOfVoiceData {
  name: string;
  value: number;
  fill: string;
}

interface ShareOfVoiceChartProps {
  data: ShareOfVoiceData[];
  dateFilter: "7d" | "30d" | "90d";
  isExporting: boolean;
  handleExportData: (format: "pdf") => void;
}

export default function ShareOfVoiceChart({
  data,
  dateFilter,
  isExporting,
  handleExportData,
}: ShareOfVoiceChartProps) {
  // Only show chart if there are competitors to compare against
  // Don't show if only "Your Brand" data exists
  const hasCompetitors = data.length > 1 || (data.length === 1 && data[0].name !== "Your Brand");
  
  if (!hasCompetitors) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Share of Voice Comparison</CardTitle>
            <CardDescription>
              How your brand compares to competitors in AI responses (last{" "}
              {dateFilter})
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData("pdf")}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip formatter={(value) => [`${value}%`, "Share of Voice"]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
