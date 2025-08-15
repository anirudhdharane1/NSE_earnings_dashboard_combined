import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface ChartDisplayProps {
  data: Array<{
    date: string;
    move: number;
    direction: "up" | "down";
  }>;
  ticker: string;
}

export function ChartDisplay({ data, ticker }: ChartDisplayProps) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    move: Math.abs(item.move),
    rawMove: item.move,
    fill: item.move > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Price Movement Distribution - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{ value: 'Move %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: any, name: string, props: any) => [
                  `${props.payload.rawMove > 0 ? '+' : ''}${props.payload.rawMove.toFixed(1)}%`,
                  'Price Move'
                ]}
              />
              <Bar 
                dataKey="move" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Absolute percentage price moves on T+1 day after earnings announcements
        </div>
      </CardContent>
    </Card>
  );
}