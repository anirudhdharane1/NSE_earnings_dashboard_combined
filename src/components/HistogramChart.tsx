import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { BarChart3 } from "lucide-react";

interface HistogramData {
  binStart: number;
  binEnd: number;
  frequency: number;
  binLabel: string;
}

interface HistogramChartProps {
  data: HistogramData[];
  ticker: string;
  mean: number;
  stdDev1: number;
  stdDev2: number;
  stdDev3: number;
}

export function HistogramChart({ data, ticker, mean, stdDev1, stdDev2, stdDev3 }: HistogramChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Distribution of Price Changes - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="binLabel" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: any, name: string) => [
                  `${value} occurrences`,
                  'Frequency'
                ]}
                labelFormatter={(label: string) => `Range: ${label}%`}
              />
              <Bar 
                dataKey="frequency" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              
              {/* Reference lines for mean and standard deviations */}
              <ReferenceLine 
                x={mean} 
                stroke="hsl(var(--foreground))" 
                strokeDasharray="2 2"
                strokeWidth={2}
                label={{ value: "Mean" }}
              />
              <ReferenceLine 
                x={mean - stdDev1} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: "-1σ" }}
              />
              <ReferenceLine 
                x={mean + stdDev1} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: "+1σ" }}
              />
              <ReferenceLine 
                x={mean - stdDev2} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="6 6"
                strokeWidth={1}
                opacity={0.7}
                label={{ value: "-2σ" }}
              />
              <ReferenceLine 
                x={mean + stdDev2} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="6 6"
                strokeWidth={1}
                opacity={0.7}
                label={{ value: "+2σ" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Distribution of percentage price changes on T+1 day after earnings announcements
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Reference lines: Mean ({mean.toFixed(1)}%), ±1σ ({stdDev1.toFixed(1)}%), ±2σ ({stdDev2.toFixed(1)}%)
        </div>
      </CardContent>
    </Card>
  );
}