import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CompetitorTimeSeriesData } from '@/services/competitorService';

interface TimeSeriesChartProps {
  data: CompetitorTimeSeriesData[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitive Performance Over Time</CardTitle>
        <CardDescription>
          Share of voice trends for you and your competitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            {data[0]?.competitors.map((comp, index) => (
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
  );
}