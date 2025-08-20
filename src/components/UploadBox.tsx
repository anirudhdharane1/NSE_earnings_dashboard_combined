import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, AlertCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface UploadBoxProps {
  onFileUpload: (files: File[]) => void;              // Array of files
  uploadedFile: File[] | null;
  isProcessing?: boolean;
  onRemoveFile: (idx: number) => void;                // <-- NEW callback
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadBox({ onFileUpload, uploadedFile, isProcessing, onRemoveFile }: UploadBoxProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
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

  const handleFileSelect = useCallback((files: File[]) => {
    setError(null);
    for (const file of files) {
      if (!validateFile(file)) return;
    }
    onFileUpload(files);
    toast({
      title: "Files uploaded successfully",
      description: `${files.length} file${files.length > 1 ? 's' : ''} ready for processing`,
    });
  }, [validateFile, onFileUpload]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesArray = event.target.files ? Array.from(event.target.files) : [];
    if (filesArray.length > 0) {
      handleFileSelect(filesArray);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const filesArray = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (filesArray.length > 0) {
      handleFileSelect(filesArray);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isFocused) return;
    const items = event.clipboardData?.items;
    const files: File[] = [];
    if (items) {
      for (const item of items) {
        if (ALLOWED_TYPES.includes(item.type)) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        handleFileSelect(files);
        toast({
          title: "Image(s) pasted successfully",
          description: `Pasted ${files.length} image${files.length > 1 ? 's' : ''} ready for processing`,
        });
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
        aria-label="Upload earnings data image files"
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
                : "Drag & drop, paste (Ctrl+V), or click to upload multiple images"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP • Max 10MB each
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
          multiple
        />
      </div>

      {error && (
        <div className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {uploadedFile && uploadedFile.length > 0 && (
        <div className="text-sm text-muted-foreground flex flex-col gap-1">
          {uploadedFile.map((file, idx) => (
            <div key={file.name + idx} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {file.name} uploaded
              <button
                type="button"
                aria-label="Remove file"
                className="ml-2 text-destructive hover:text-destructive/80"
                onClick={e => {
                  e.stopPropagation();
                  onRemoveFile(idx);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer"
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
