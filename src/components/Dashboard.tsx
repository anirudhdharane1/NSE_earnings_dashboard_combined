import { useState } from "react";
import { TrendingUp, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatsCards } from "./StatsCards";
import { ResultsTable } from "./ResultsTable";
import { ChartDisplay } from "./ChartDisplay";
import { HistogramChart } from "./HistogramChart";
import UploadBox from "./UploadBox";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [ticker, setTicker] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setUploadError(null);
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
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('ticker', ticker);
      
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalysisData(data);
      
      toast({
        title: "Analysis complete",
        description: "Earnings impact analysis has been generated",
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      setUploadError(error instanceof Error ? error.message : 'Analysis failed');
      
      toast({
        title: "Analysis failed",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      
      // Fallback to mock data for demonstration
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
          { date: "2023-10-20", move: 5.2, direction: "up" },
          { date: "2023-07-18", move: -3.8, direction: "down" },
          { date: "2023-04-15", move: 2.1, direction: "up" },
          { date: "2023-01-12", move: -4.5, direction: "down" },
          { date: "2022-10-18", move: 7.3, direction: "up" },
          { date: "2022-07-15", move: -1.9, direction: "down" },
          { date: "2022-04-12", move: 3.7, direction: "up" },
          { date: "2022-01-14", move: -5.1, direction: "down" },
        ],
        histogram: [
          { binStart: -6, binEnd: -4, frequency: 3, binLabel: "-6 to -4" },
          { binStart: -4, binEnd: -2, frequency: 4, binLabel: "-4 to -2" },
          { binStart: -2, binEnd: 0, frequency: 2, binLabel: "-2 to 0" },
          { binStart: 0, binEnd: 2, frequency: 1, binLabel: "0 to 2" },
          { binStart: 2, binEnd: 4, frequency: 3, binLabel: "2 to 4" },
          { binStart: 4, binEnd: 6, frequency: 2, binLabel: "4 to 6" },
          { binStart: 6, binEnd: 8, frequency: 2, binLabel: "6 to 8" },
        ],
        mean: 0.8
      };
      setAnalysisData(mockData);
    } finally {
      setIsProcessing(false);
    }
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
        <div className="text-center space-y-8 py-16">
          <h1 className="text-6xl font-bold text-foreground flex items-center justify-center gap-4">
            <TrendingUp className="w-16 h-16 text-primary" />
            NSE Earnings Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Analyze historical earnings impact on stock price movements
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Upload Earnings Data</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadBox 
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                isProcessing={isProcessing}
              />
              {uploadError && (
                <div className="mt-4 text-sm text-destructive">
                  {uploadError}
                </div>
              )}
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

            {/* Histogram Chart */}
            <HistogramChart 
              data={analysisData.histogram}
              ticker={ticker}
              mean={analysisData.mean}
              stdDev1={analysisData.stdDev1}
              stdDev2={analysisData.stdDev2}
              stdDev3={analysisData.stdDev3}
            />

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