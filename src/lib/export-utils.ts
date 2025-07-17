// Unified export utilities for consistent export functionality across the application

import { toast } from "@/hooks/use-toast";

// Export format types
export type ExportFormat = "pdf" | "csv" | "json" | "excel" | "word";

// Export configuration interface
export interface ExportConfig {
  filename: string;
  format: ExportFormat;
  includeTimestamp?: boolean;
  dateRange?: { start: string; end: string };
  filters?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Export result interface
export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  size?: number;
  error?: string;
}

// Export data structure for consistent formatting
export interface ExportData {
  title: string;
  data: any;
  exportedAt: string;
  totalRecords: number;
  filters?: Record<string, any>;
  dateRange?: { start: string; end: string };
  metadata?: Record<string, any>;
}

// MIME type mappings for different export formats
export const EXPORT_MIME_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  csv: "text/csv",
  json: "application/json",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// File extension mappings
export const EXPORT_FILE_EXTENSIONS: Record<ExportFormat, string> = {
  pdf: "pdf",
  csv: "csv",
  json: "json",
  excel: "xlsx",
  word: "docx",
};

// Generate consistent filename with timestamp and format
export function generateExportFilename(
  baseName: string,
  format: ExportFormat,
  options: {
    includeTimestamp?: boolean;
    identifier?: string;
    dateRange?: { start: string; end: string };
  } = {}
): string {
  const { includeTimestamp = true, identifier, dateRange } = options;
  
  let filename = baseName;
  
  // Add identifier if provided
  if (identifier) {
    filename += `-${identifier}`;
  }
  
  // Add date range if provided
  if (dateRange) {
    const startDate = new Date(dateRange.start).toISOString().split('T')[0];
    const endDate = new Date(dateRange.end).toISOString().split('T')[0];
    filename += `-${startDate}_to_${endDate}`;
  }
  
  // Add timestamp if requested
  if (includeTimestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    filename += `-${timestamp}`;
  }
  
  return `${filename}.${EXPORT_FILE_EXTENSIONS[format]}`;
}

// Download blob with consistent handling
export function downloadBlob(
  blob: Blob,
  filename: string,
  format: ExportFormat
): Promise<ExportResult> {
  return new Promise((resolve) => {
    try {
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      window.URL.revokeObjectURL(url);
      
      resolve({
        success: true,
        filename,
        format,
        size: blob.size,
      });
    } catch (error) {
      resolve({
        success: false,
        filename,
        format,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

// Format data for JSON export
export function formatJsonExport(data: ExportData): Blob {
  const jsonContent = JSON.stringify(data, null, 2);
  return new Blob([jsonContent], { type: EXPORT_MIME_TYPES.json });
}

// Format data for CSV export
export function formatCsvExport(data: ExportData): Blob {
  let csvContent = `${data.title}\n`;
  csvContent += `Exported at: ${data.exportedAt}\n`;
  csvContent += `Total Records: ${data.totalRecords}\n\n`;
  
  // Add filters if present
  if (data.filters && Object.keys(data.filters).length > 0) {
    csvContent += "Applied Filters:\n";
    Object.entries(data.filters).forEach(([key, value]) => {
      csvContent += `${key}: ${value}\n`;
    });
    csvContent += "\n";
  }
  
  // Add date range if present
  if (data.dateRange) {
    csvContent += `Date Range: ${data.dateRange.start} to ${data.dateRange.end}\n\n`;
  }
  
  // Add the main data based on its structure
  if (Array.isArray(data.data)) {
    csvContent += formatArrayToCsv(data.data);
  } else if (typeof data.data === 'object') {
    csvContent += formatObjectToCsv(data.data);
  }
  
  return new Blob([csvContent], { type: EXPORT_MIME_TYPES.csv });
}

// Format data for PDF export (enhanced text format)
export function formatPdfExport(data: ExportData): Blob {
  let pdfContent = `${data.title.toUpperCase()}\n`;
  pdfContent += "=".repeat(data.title.length + 10) + "\n\n";
  
  pdfContent += `Exported: ${new Date(data.exportedAt).toLocaleString()}\n`;
  pdfContent += `Total Records: ${data.totalRecords}\n\n`;
  
  // Add filters if present
  if (data.filters && Object.keys(data.filters).length > 0) {
    pdfContent += "APPLIED FILTERS\n";
    pdfContent += "-".repeat(20) + "\n";
    Object.entries(data.filters).forEach(([key, value]) => {
      pdfContent += `${key}: ${value}\n`;
    });
    pdfContent += "\n";
  }
  
  // Add date range if present
  if (data.dateRange) {
    pdfContent += `Date Range: ${data.dateRange.start} to ${data.dateRange.end}\n\n`;
  }
  
  // Add the main data
  if (Array.isArray(data.data)) {
    pdfContent += formatArrayToPdf(data.data);
  } else if (typeof data.data === 'object') {
    pdfContent += formatObjectToPdf(data.data);
  }
  
  return new Blob([pdfContent], { type: EXPORT_MIME_TYPES.pdf });
}

// Helper function to format array data to CSV
function formatArrayToCsv(data: any[]): string {
  if (data.length === 0) return "No data available\n";
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  let csvContent = headers.join(",") + "\n";
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvContent += values.join(",") + "\n";
  });
  
  return csvContent;
}

// Helper function to format object data to CSV
function formatObjectToCsv(data: Record<string, any>): string {
  let csvContent = "Property,Value\n";
  
  Object.entries(data).forEach(([key, value]) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const escapedValue = stringValue.includes(',') || stringValue.includes('"') 
      ? `"${stringValue.replace(/"/g, '""')}"` 
      : stringValue;
    csvContent += `${key},${escapedValue}\n`;
  });
  
  return csvContent;
}

// Helper function to format array data to PDF
function formatArrayToPdf(data: any[]): string {
  if (data.length === 0) return "No data available\n";
  
  let pdfContent = "DATA RECORDS\n";
  pdfContent += "-".repeat(20) + "\n\n";
  
  data.forEach((item, index) => {
    pdfContent += `${index + 1}. RECORD\n`;
    pdfContent += "-".repeat(15) + "\n";
    
    Object.entries(item).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      pdfContent += `${formattedKey}: ${formattedValue}\n`;
    });
    
    pdfContent += "\n";
  });
  
  return pdfContent;
}

// Helper function to format object data to PDF
function formatObjectToPdf(data: Record<string, any>): string {
  let pdfContent = "DATA SUMMARY\n";
  pdfContent += "-".repeat(20) + "\n\n";
  
  Object.entries(data).forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    pdfContent += `${formattedKey}: ${formattedValue}\n`;
  });
  
  return pdfContent;
}

// Export hook with consistent error handling and toast notifications
export function useExportHandler() {
  const handleExport = async (
    exportFunction: () => Promise<Blob>,
    config: ExportConfig
  ): Promise<ExportResult> => {
    try {
      // Show loading toast
      toast({
        title: "Preparing export...",
        description: `Generating ${config.format.toUpperCase()} file`,
      });
      
      // Execute export function
      const blob = await exportFunction();
      
      // Generate filename
      const filename = generateExportFilename(
        config.filename,
        config.format,
        {
          includeTimestamp: config.includeTimestamp,
          dateRange: config.dateRange,
        }
      );
      
      // Download file
      const result = await downloadBlob(blob, filename, config.format);
      
      // Show success/error toast
      if (result.success) {
        toast({
          title: "Export successful",
          description: `${filename} has been downloaded`,
        });
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        filename: config.filename,
        format: config.format,
        error: errorMessage,
      };
    }
  };
  
  return { handleExport };
}

// Validate export configuration
export function validateExportConfig(config: ExportConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.filename.trim()) {
    errors.push("Filename is required");
  }
  
  if (!Object.values(EXPORT_FILE_EXTENSIONS).includes(EXPORT_FILE_EXTENSIONS[config.format])) {
    errors.push("Invalid export format");
  }
  
  if (config.dateRange) {
    const start = new Date(config.dateRange.start);
    const end = new Date(config.dateRange.end);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push("Invalid date range");
    } else if (start >= end) {
      errors.push("Start date must be before end date");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get export format display name
export function getExportFormatDisplayName(format: ExportFormat): string {
  const displayNames: Record<ExportFormat, string> = {
    pdf: "PDF Document",
    csv: "CSV Spreadsheet",
    json: "JSON Data",
    excel: "Excel Spreadsheet",
    word: "Word Document",
  };
  
  return displayNames[format] || format.toUpperCase();
}

// Calculate estimated file size based on data
export function estimateExportSize(data: any, format: ExportFormat): string {
  const dataSize = JSON.stringify(data).length;
  
  // Rough size multipliers for different formats
  const sizeMultipliers: Record<ExportFormat, number> = {
    json: 1,
    csv: 0.7,
    pdf: 1.5,
    excel: 2,
    word: 3,
  };
  
  const estimatedBytes = dataSize * sizeMultipliers[format];
  
  if (estimatedBytes < 1024) {
    return `${Math.round(estimatedBytes)} B`;
  } else if (estimatedBytes < 1024 * 1024) {
    return `${Math.round(estimatedBytes / 1024)} KB`;
  } else {
    return `${Math.round(estimatedBytes / (1024 * 1024))} MB`;
  }
}