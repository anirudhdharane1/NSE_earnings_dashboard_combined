import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Calendar } from "lucide-react";

interface ResultsTableProps {
  data: Array<{
    date: string;
    move: number;
    direction: "up" | "down";
  }>;
}

export function ResultsTable({ data }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Historical Earnings Moves
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Move %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {new Date(item.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.direction === "up" ? "default" : "secondary"}
                    className={item.direction === "up" ? "bg-primary" : "bg-muted"}
                  >
                    {item.direction === "up" ? (
                      <ArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {item.direction.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={item.move > 0 ? "text-primary" : "text-muted-foreground"}>
                    {item.move > 0 ? "+" : ""}{item.move.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}