import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface UploadBoxProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  isProcessing?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadBox({ onFileUpload, uploadedFile, isProcessing }: UploadBoxProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please upload ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')} images only.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size too large. Please upload files smaller than 10MB.');
      return false;
    }

    return true;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileUpload(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for processing`,
      });
    }
  }, [validateFile, onFileUpload]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Only set dragOver to false if we're leaving the upload box entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isFocused) return; // Only handle paste when focused
    
    const items = event.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (ALLOWED_TYPES.includes(item.type)) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
            toast({
              title: "Image pasted successfully",
              description: `Pasted image is ready for processing`,
            });
          }
          break;
        }
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer relative
          ${dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25'}
          ${isFocused ? 'ring-2 ring-primary ring-offset-2' : ''}
          ${error ? 'border-destructive bg-destructive/5' : ''}
          ${isProcessing ? 'pointer-events-none opacity-60' : 'hover:border-primary/50 hover:bg-primary/2'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        role="button"
        aria-label="Upload earnings data image file"
        aria-describedby="upload-instructions"
      >
        <div className="text-center space-y-3">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
          ) : error ? (
            <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
          ) : (
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          )}
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground" id="upload-instructions">
              {isProcessing 
                ? "Processing..." 
                : "Drag & drop, paste (Ctrl+V), or click to upload"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP • Max 10MB
            </p>
          </div>
        </div>
        
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {error && (
        <div className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {uploadedFile && !error && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          {uploadedFile.name} uploaded
        </div>
      )}
    </div>
  );
}