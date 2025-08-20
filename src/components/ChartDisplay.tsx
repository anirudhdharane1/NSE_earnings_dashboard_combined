
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
    fill: "#00FF00", // Green for all bars
  }));

  // For dynamic yAxis ticks at 0.5% intervals
  const moves = chartData.map(item => item.move);
  const minMove = Math.floor(Math.min(...moves) * 2) / 2;
  const maxMove = Math.ceil(Math.max(...moves) * 2) / 2;
  const yTicks: number[] = [];
  for (let i = minMove; i <= maxMove; i += 1) {
    yTicks.push(Number(i.toFixed(2)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: "#e3e3e3" }}>
          <BarChart3 className="w-5 h-5" />
          Price Movement Distribution - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.13)" strokeDasharray="3 3" vertical={true} horizontal={true} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 14, fill: "#e3e3e3" }}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{
                value: "Date",
                position: "bottom",
                offset: 16,
                fill: "#e3e3e3",
                fontSize: 16,
              }}
            />
            <YAxis
            tick={{ fontSize: 14, fill: "#e3e3e3" }}
            ticks={yTicks}
            domain={[minMove, maxMove]}
            allowDecimals={true}
            interval={0}
            label={{
            value: "Price Change (%)",
            angle: -90,
            position: "insideLeft",
            offset: 15, // farther from axis (experiment 30-40)
            dy: 90,     // lower down towards vertical center (experiment 90-120)
            fill: "#e3e3e3",
            fontSize: 16,
    }}
    />

            <Tooltip
              formatter={(value: any, name: any, props: any) => [
                `${props.payload.rawMove > 0 ? '+' : ''}${props.payload.rawMove.toFixed(1)}%`,
                'Price Move'
              ]}
              contentStyle={{
                backgroundColor: "#23272B",
                border: "1px solid #444",
                fontSize: "14px",
                color: "#e3e3e3",
              }}
              itemStyle={{ color: "#e3e3e3", fontSize: "14px" }}
              labelStyle={{ color: "#e3e3e3", fontSize: "14px" }}
              cursor={{ fill: "rgba(0,255,0,0.1)" }}
            />
            <Bar dataKey="move" fill="#00FF00" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm mt-4" style={{ color: "#ffffffc4" }}>
          Absolute percentage price moves on T+1 day after earnings announcements
        </p>
      </CardContent>
    </Card>
  );
}
