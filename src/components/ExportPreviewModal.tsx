import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ExportFormat, useExportHandler } from "@/lib/export-utils";
import { exportService } from "@/services/exportService";
import { 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  FileImage,
  Settings,
  Eye,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { useState } from "react";

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  title: string;
  exportType: string;
  defaultFormat?: ExportFormat;
  onExport?: (format: ExportFormat, options: ExportOptions) => Promise<void>;
}

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  includeMetadata: boolean;
  includeTimestamp: boolean;
  includeUserInfo: boolean;
  includeFilters: boolean;
  customTitle?: string;
  customDescription?: string;
  selectedFields?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export function ExportPreviewModal({
  isOpen,
  onClose,
  data,
  title,
  exportType,
  defaultFormat = "json",
  onExport,
}: ExportPreviewModalProps) {
  const { toast } = useToast();
  const { handleExport } = useExportHandler();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<string>("");
  
  // Export options
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [filename, setFilename] = useState(`${exportType}-export`);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [includeUserInfo, setIncludeUserInfo] = useState(false);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [customTitle, setCustomTitle] = useState(title);
  const [customDescription, setCustomDescription] = useState("");

  const formatOptions = [
    { value: "json", label: "JSON", icon: FileText, description: "Structured data format" },
    { value: "csv", label: "CSV", icon: Table, description: "Spreadsheet compatible" },
    { value: "pdf", label: "PDF", icon: FileImage, description: "Printable document" },
    { value: "excel", label: "Excel", icon: FileSpreadsheet, description: "Excel workbook" },
    { value: "word", label: "Word", icon: FileText, description: "Word document" },
  ] as const;

  const handlePreview = async () => {
    setShowPreview(true);
    try {
      const exportOptions: ExportOptions = {
        format,
        filename,
        includeMetadata,
        includeTimestamp,
        includeUserInfo,
        includeFilters,
        customTitle,
        customDescription,
      };

      // Generate preview data
      const previewContent = await generatePreviewContent(data, exportOptions);
      setPreviewData(previewContent);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      toast({
        title: "Preview Failed",
        description: "Failed to generate export preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportClick = async () => {
    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        format,
        filename,
        includeMetadata,
        includeTimestamp,
        includeUserInfo,
        includeFilters,
        customTitle,
        customDescription,
      };

      if (onExport) {
        await onExport(format, exportOptions);
      } else {
        // Default export handling
        const exportData = {
          title: customTitle || title,
          description: customDescription,
          data,
          exportedAt: new Date().toISOString(),
          metadata: {
            exportType,
            format,
            recordCount: Array.isArray(data) ? data.length : 1,
            includeMetadata,
            includeTimestamp,
            includeUserInfo,
            includeFilters,
          },
        };

        const blob = await exportService.exportData(exportData, format, {
          exportType,
          customFilename: filename,
          includeTimestamp,
        });

        await handleExport(
          () => Promise.resolve(blob),
          {
            filename,
            format,
            includeTimestamp,
            metadata: exportData.metadata,
          }
        );
      }

      toast({
        title: "Export Successful",
        description: `${title} exported successfully as ${format.toUpperCase()}.`,
      });

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generatePreviewContent = async (data: any, options: ExportOptions): Promise<string> => {
    // This would generate a preview based on the format
    switch (options.format) {
      case "json":
        return JSON.stringify(data, null, 2).slice(0, 1000) + "...";
      case "csv":
        if (Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]).join(",");
          const rows = data.slice(0, 5).map(row => 
            Object.values(row).map(val => `"${val}"`).join(",")
          ).join("\\n");
          return `${headers}\\n${rows}\\n...`;
        }
        return "No data available for CSV preview";
      case "pdf":
        return "PDF preview not available. The document will contain formatted data with headers, tables, and metadata.";
      case "excel":
        return "Excel preview not available. The workbook will contain data sheets with proper formatting.";
      case "word":
        return "Word preview not available. The document will contain formatted text and tables.";
      default:
        return "Preview not available for this format.";
    }
  };

  const getFormatIcon = (formatValue: string) => {
    const option = formatOptions.find(opt => opt.value === formatValue);
    return option ? option.icon : FileText;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Preview & Options</span>
          </DialogTitle>
          <DialogDescription>
            Customize your export settings and preview the output
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
            />
          </div>

          {/* Custom Title and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customTitle">Custom Title</Label>
              <Input
                id="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter custom title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDescription">Custom Description</Label>
              <Textarea
                id="customDescription"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Enter custom description"
                rows={3}
              />
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <Label className="text-sm font-medium">Export Options</Label>
            </div>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
                />
                <Label htmlFor="includeMetadata" className="text-sm">
                  Include metadata (export info, record counts, etc.)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTimestamp"
                  checked={includeTimestamp}
                  onCheckedChange={(checked) => setIncludeTimestamp(!!checked)}
                />
                <Label htmlFor="includeTimestamp" className="text-sm flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Include timestamp in filename</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeUserInfo"
                  checked={includeUserInfo}
                  onCheckedChange={(checked) => setIncludeUserInfo(!!checked)}
                />
                <Label htmlFor="includeUserInfo" className="text-sm flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Include user information</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFilters"
                  checked={includeFilters}
                  onCheckedChange={(checked) => setIncludeFilters(!!checked)}
                />
                <Label htmlFor="includeFilters" className="text-sm flex items-center space-x-1">
                  <Building className="h-3 w-3" />
                  <span>Include applied filters</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Export Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Format:</span>
                <Badge variant="outline">{format.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Records:</span>
                <span>{Array.isArray(data) ? data.length : 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Filename:</span>
                <span className="font-mono text-xs">
                  {filename}
                  {includeTimestamp && "-YYYY-MM-DD-HH-mm-ss"}
                  .{format}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Label>
              <div className="p-4 bg-muted/30 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {previewData}
                </pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <LoadingButton
            onClick={handleExportClick}
            loading={isExporting}
            icon={React.createElement(getFormatIcon(format), { className: "h-4 w-4" })}
          >
            Export {format.toUpperCase()}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}