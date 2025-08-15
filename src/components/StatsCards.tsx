import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, BarChart } from "lucide-react";

interface StatsCardsProps {
  data: {
    totalEarnings: number;
    avgMove: number;
    winRate: number;
    stdDev1: number;
    stdDev2: number;
    stdDev3: number;
  };
  ticker: string;
}

export function StatsCards({ data, ticker }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Absolute Move
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {data.avgMove.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            T+1 day after earnings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Win Rate
          </CardTitle>
          <Target className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Positive moves
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            1σ Move
          </CardTitle>
          <BarChart className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.stdDev1.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            68% of moves
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Earnings
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.totalEarnings}
          </div>
          <p className="text-xs text-muted-foreground">
            Historical cycles
          </p>
        </CardContent>
      </Card>
    </div>
  );
}