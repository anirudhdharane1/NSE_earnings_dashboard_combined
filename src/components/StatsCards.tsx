/*import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Absolute Move
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
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
}*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, BarChart } from "lucide-react";

interface StatsCardsProps {
  data: {
    total_input_dates: number;
    absolute_mean: number | null;
    first_std: number | null;
    second_std: number | null;
    third_std: number | null;
  };
  ticker: string;
}

export function StatsCards({ data, ticker }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_input_dates}</div>
          <p className="text-xs text-muted-foreground">
            Historical cycles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Abs Move</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.absolute_mean ? `${data.absolute_mean.toFixed(2)}%` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            T+1 day after earnings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">1σ Threshold</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.first_std ? `${data.first_std.toFixed(2)}%` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            68% of moves
          </p>
        </CardContent>
      </Card>

        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">2σ Threshold</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.second_std ? `${data.second_std.toFixed(2)}%` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            95% of moves
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

