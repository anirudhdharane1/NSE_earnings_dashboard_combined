import { useState } from "react";
import { TrendingUp, Download } from "lucide-react";
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

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { STOCK_TICKERS } from "./ticker";

export default function Dashboard() {
  // uploadedFile state is now an array of Files or null
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredTickers, setFilteredTickers] = useState(STOCK_TICKERS);
  const [ticker, setTicker] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File[] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setUploadedFile(prev =>
      prev && prev.length > 0
        ? [...prev, ...files.filter(f => !prev.some(prevFile => prevFile.name === f.name && prevFile.size === f.size))]
        : files
    );
    setUploadError(null);
  };

  // Remove a file by index
  const handleRemoveFile = (idx: number) => {
    if (!uploadedFile) return;
    const newFiles = uploadedFile.filter((_, index) => index !== idx);
    setUploadedFile(newFiles.length > 0 ? newFiles : null);
  };

  /*const handleAnalysis = async () => {
    if (!ticker) {
      toast({
      title: "Missing information",
      description: "Please enter a ticker symbol.",
      variant: "destructive",
      });
      return;
      }

    setIsProcessing(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      uploadedFile.forEach(file => {
        formData.append("images", file);
      });
      formData.append("ticker", ticker);
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
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
    } catch (error: any) {
      console.error("Analysis error:", error);
      setUploadError(error?.message || "Analysis failed");
      toast({
        title: "Analysis failed",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };*/

  const handleAnalysis = async () => {
  if (!ticker) {
    toast({
      title: "Missing information",
      description: "Please enter a ticker symbol.",
      variant: "destructive",
    });
    return;
  }
  setIsProcessing(true);
  setUploadError(null);
  try {
    const formData = new FormData();
    if (uploadedFile && uploadedFile.length > 0) {
      uploadedFile.forEach(file => {
        formData.append("images", file);
      });
    }
    formData.append("ticker", ticker);
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
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
  } catch (error: any) {
    console.error("Analysis error:", error);
    setUploadError(error?.message || "Analysis failed");
    toast({
      title: "Analysis failed",
      description: "Please check your connection and try again",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};


  // Export CSV functionality
  const exportCSV = () => {
    if (!analysisData?.results) return;
    const headers = ['Date', 'Price Change (%)', 'Open', 'High', 'Low', 'Close'];
    const rows = analysisData.results.map(row => [
      row.date,
      row.price_change_pct !== null ? row.price_change_pct.toFixed(2) : '',
      row.open !== null ? row.open.toFixed(2) : '',
      row.high !== null ? row.high.toFixed(2) : '',
      row.low !== null ? row.low.toFixed(2) : '',
      row.close !== null ? row.close.toFixed(2) : '',
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ticker}_earnings_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Excel functionality
  const exportExcel = () => {
    if (!analysisData?.results) return;
    const worksheetData = [
      ['Date', 'Price Change (%)', 'Open', 'High', 'Low', 'Close'],
      ...analysisData.results.map(row => [
        row.date,
        row.price_change_pct !== null ? row.price_change_pct.toFixed(2) : '',
        row.open !== null ? row.open.toFixed(2) : '',
        row.high !== null ? row.high.toFixed(2) : '',
        row.low !== null ? row.low.toFixed(2) : '',
        row.close !== null ? row.close.toFixed(2) : '',
      ])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Earnings Data");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `${ticker}_earnings_data.xlsx`);
  };

  const handleDownload = (format: "csv" | "excel") => {
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
            NSE Earnings Dashboard
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
                  placeholder="e.g., TCS"
                  value={ticker}
                  onChange={e => setTicker(e.target.value.toUpperCase())}
                  className="mt-2"
                />
              </div>
                  <Button
      variant="outline"
      className="w-full mt-2"
      onClick={() => setShowDropdown(!showDropdown)}
    >
      {showDropdown ? "Hide Ticker List" : "Select Ticker"}
    </Button>

    {showDropdown && (
      <div className="mt-2 relative">
        <Input
          type="text"
          placeholder="Search tickers…"
          onChange={e => {
            const search = e.target.value.trim().toUpperCase();
            setFilteredTickers(
              STOCK_TICKERS.filter(
                tkr => tkr.includes(search)
              )
            );
          }}
          className="mb-2"
        />
        <div className="max-h-48 overflow-y-auto bg-popover rounded-lg border border-muted shadow-lg absolute w-full z-10">
          {filteredTickers.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No tickers found.</div>
          ) : (
            filteredTickers.map(tkr => (
              <div
                key={tkr}
                className="p-2 cursor-pointer hover:bg-primary/10"
                onClick={() => {
                  setTicker(tkr);
                  setShowDropdown(false);
                }}
              >
                {tkr}
              </div>
            ))
          )}
        </div>
      </div>
    )}

              <Button
                onClick={handleAnalysis}
                /*disabled={isProcessing || !uploadedFile || uploadedFile.length === 0 || !ticker}*/
                disabled={isProcessing || !ticker}
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
                <p className="mb-4 text-sm text-muted-foreground">
                You can source accurate dates of earnings releases of all NSE listed stocks at {" "}
                <a
                href="https://opstra.definedge.com/historical-results-timings"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                this website
                </a>.
                </p>

                <UploadBox
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                isProcessing={isProcessing}
                onRemoveFile={handleRemoveFile}
                />

                {uploadError && (
                <div className="mt-4 text-sm text-destructive">{uploadError}</div>
            )}
            </CardContent>
          </Card>
        </div>
        {/* Results Section */}
        {analysisData && (
          <>
            <StatsCards data={analysisData.stats} ticker={ticker} />
            {/* Responsive results layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column: Results Table */}
              <ResultsTable data={analysisData.results} />
              {/* Right column: ChartDisplay over HistogramChart */}
              <div className="flex flex-col gap-6">
                <ChartDisplay
                  data={analysisData.results.map(item => ({
                    date: item.date,
                    move: item.price_change_pct || 0,
                    direction: (item.price_change_pct || 0) >= 0 ? "up" : "down",
                  }))}
                  ticker={ticker}
                />
                <HistogramChart
                  data={analysisData.results}
                  ticker={ticker}
                  stats={analysisData.stats}
                />
              </div>
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
                  onClick={exportCSV}
                >
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={exportExcel}
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

