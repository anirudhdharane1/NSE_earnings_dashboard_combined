import { useState } from "react";
import { Upload, TrendingUp, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatsCards } from "./StatsCards";
import { ResultsTable } from "./ResultsTable";
import { ChartDisplay } from "./ChartDisplay";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [ticker, setTicker] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for processing`,
      });
    }
  };

  const handleAnalysis = async () => {
    if (!uploadedFile || !ticker) {
      toast({
        title: "Missing information",
        description: "Please upload an image and enter a ticker symbol",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate analysis processing
    setTimeout(() => {
      const mockData = {
        totalEarnings: 12,
        avgMove: 4.2,
        winRate: 58.3,
        stdDev1: 6.8,
        stdDev2: 10.4,
        stdDev3: 14.1,
        data: [
          { date: "2024-01-15", move: 3.4, direction: "up" },
          { date: "2024-04-18", move: -2.1, direction: "down" },
          { date: "2024-07-22", move: 6.8, direction: "up" },
          { date: "2024-10-25", move: -1.3, direction: "down" },
        ]
      };
      
      setAnalysisData(mockData);
      setIsProcessing(false);
      
      toast({
        title: "Analysis complete",
        description: "Earnings impact analysis has been generated",
      });
    }, 3000);
  };

  const handleDownload = (format: 'csv' | 'excel') => {
    toast({
      title: "Download started",
      description: `Downloading data as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            NSE Earnings Analytics
          </h1>
          <p className="text-muted-foreground">
            Analyze historical earnings impact on stock price movements
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Earnings Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Earnings Schedule Image</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  ✓ {uploadedFile.name} uploaded
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Symbol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ticker">NSE Ticker Symbol</Label>
                <Input
                  id="ticker"
                  type="text"
                  placeholder="e.g., RELIANCE"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={handleAnalysis}
                disabled={isProcessing || !uploadedFile || !ticker}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Run Analysis"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {analysisData && (
          <>
            <StatsCards data={analysisData} ticker={ticker} />
            
            <div className="grid lg:grid-cols-2 gap-6">
              <ResultsTable data={analysisData.data} />
              <ChartDisplay data={analysisData.data} ticker={ticker} />
            </div>

            {/* Download Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => handleDownload('csv')}
                >
                  Download CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownload('excel')}
                >
                  Download Excel
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}