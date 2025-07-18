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

// Field mapping configuration for professional column names
export interface FieldMapping {
  [key: string]: {
    displayName: string;
    format?: 'text' | 'number' | 'percentage' | 'currency' | 'date' | 'datetime' | 'boolean' | 'url';
    description?: string;
    width?: number;
    alignment?: 'left' | 'center' | 'right';
  };
}

// Common field mappings for different data types
export const COMMON_FIELD_MAPPINGS: Record<string, FieldMapping> = {
  website: {
    id: { displayName: 'Website ID', format: 'text', description: 'Unique identifier' },
    domain: { displayName: 'Domain', format: 'url', description: 'Website domain name', width: 200 },
    display_name: { displayName: 'Display Name', format: 'text', description: 'Website display name', width: 150 },
    website_type: { displayName: 'Type', format: 'text', description: 'Website category', width: 100 },
    is_active: { displayName: 'Active', format: 'boolean', description: 'Active status', width: 80 },
    monitoring_enabled: { displayName: 'Monitoring', format: 'boolean', description: 'Monitoring status', width: 100 },
    created_at: { displayName: 'Created Date', format: 'date', description: 'Date created', width: 120 },
    updated_at: { displayName: 'Last Updated', format: 'date', description: 'Date last updated', width: 120 },
    description: { displayName: 'Description', format: 'text', description: 'Website description', width: 300 },
    totalAnalyses: { displayName: 'Total Analyses', format: 'number', description: 'Total number of analyses', width: 120 },
    averageConfidence: { displayName: 'Avg. Confidence', format: 'percentage', description: 'Average confidence score', width: 120 },
    averageSentiment: { displayName: 'Avg. Sentiment', format: 'percentage', description: 'Average sentiment score', width: 120 },
    mentionRate: { displayName: 'Mention Rate', format: 'percentage', description: 'Percentage of mentions', width: 120 },
    averageRank: { displayName: 'Avg. Rank', format: 'number', description: 'Average ranking position', width: 100 },
  },
  competitor: {
    id: { displayName: 'Competitor ID', format: 'text', description: 'Unique identifier' },
    competitor_domain: { displayName: 'Domain', format: 'url', description: 'Competitor domain', width: 200 },
    competitor_name: { displayName: 'Company Name', format: 'text', description: 'Competitor name', width: 150 },
    is_active: { displayName: 'Active', format: 'boolean', description: 'Active status', width: 80 },
    created_at: { displayName: 'Added Date', format: 'date', description: 'Date added', width: 120 },
    updated_at: { displayName: 'Last Updated', format: 'date', description: 'Date last updated', width: 120 },
    shareOfVoice: { displayName: 'Share of Voice', format: 'percentage', description: 'Share of voice percentage', width: 120 },
    averageRank: { displayName: 'Avg. Rank', format: 'number', description: 'Average ranking position', width: 100 },
    mentionCount: { displayName: 'Mentions', format: 'number', description: 'Total mentions', width: 100 },
    sentimentScore: { displayName: 'Sentiment Score', format: 'percentage', description: 'Average sentiment', width: 120 },
    analysisStatus: { displayName: 'Analysis Status', format: 'text', description: 'Current analysis status', width: 120 },
  },
  analysis: {
    id: { displayName: 'Analysis ID', format: 'text', description: 'Unique identifier' },
    prompt: { displayName: 'Prompt', format: 'text', description: 'Analysis prompt', width: 300 },
    topic: { displayName: 'Topic', format: 'text', description: 'Analysis topic', width: 150 },
    website_id: { displayName: 'Website ID', format: 'text', description: 'Associated website' },
    status: { displayName: 'Status', format: 'text', description: 'Analysis status', width: 100 },
    confidence: { displayName: 'Confidence', format: 'percentage', description: 'Confidence score', width: 100 },
    created_at: { displayName: 'Created Date', format: 'datetime', description: 'Date created', width: 150 },
    updated_at: { displayName: 'Last Updated', format: 'datetime', description: 'Date last updated', width: 150 },
    llm_provider: { displayName: 'LLM Provider', format: 'text', description: 'AI provider used', width: 120 },
    is_mentioned: { displayName: 'Mentioned', format: 'boolean', description: 'Whether mentioned', width: 100 },
    rank_position: { displayName: 'Rank Position', format: 'number', description: 'Ranking position', width: 100 },
    sentiment_score: { displayName: 'Sentiment', format: 'percentage', description: 'Sentiment score', width: 100 },
    summary_text: { displayName: 'Summary', format: 'text', description: 'Analysis summary', width: 400 },
    response_text: { displayName: 'Full Response', format: 'text', description: 'Complete response', width: 500 },
  },
  dashboard: {
    totalAnalyses: { displayName: 'Total Analyses', format: 'number', description: 'Total number of analyses', width: 120 },
    averageConfidence: { displayName: 'Avg. Confidence', format: 'percentage', description: 'Average confidence score', width: 120 },
    averageSentiment: { displayName: 'Avg. Sentiment', format: 'percentage', description: 'Average sentiment score', width: 120 },
    mentionRate: { displayName: 'Mention Rate', format: 'percentage', description: 'Percentage of mentions', width: 120 },
    topPerformingTopic: { displayName: 'Top Topic', format: 'text', description: 'Best performing topic', width: 150 },
    totalWebsites: { displayName: 'Total Websites', format: 'number', description: 'Number of websites', width: 120 },
    activeWebsites: { displayName: 'Active Websites', format: 'number', description: 'Number of active websites', width: 120 },
    averageRank: { displayName: 'Avg. Rank', format: 'number', description: 'Average ranking position', width: 100 },
    trendDirection: { displayName: 'Trend', format: 'text', description: 'Performance trend', width: 100 },
    period: { displayName: 'Time Period', format: 'text', description: 'Analysis time period', width: 120 },
  }
};

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
  dataType?: string; // For field mapping
}

// MIME type mappings for different export formats
export const EXPORT_MIME_TYPES: Record<ExportFormat, string> = {
  pdf: "text/plain", // Use text/plain for PDF until we implement real PDF generation
  csv: "text/csv",
  json: "application/json",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// File extension mappings
export const EXPORT_FILE_EXTENSIONS: Record<ExportFormat, string> = {
  pdf: "txt", // Use .txt extension for PDF until we implement real PDF generation
  csv: "csv",
  json: "json",
  excel: "xlsx",
  word: "docx",
};

// Format value according to field mapping
export function formatValue(value: any, fieldMapping?: FieldMapping[string]): string {
  if (value === null || value === undefined) return '';
  
  const format = fieldMapping?.format || 'text';
  
  switch (format) {
    case 'percentage':
      const numValue = parseFloat(value);
      return isNaN(numValue) ? '0%' : `${numValue.toFixed(1)}%`;
    
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? '0' : num.toLocaleString();
    
    case 'currency':
      const currencyNum = parseFloat(value);
      return isNaN(currencyNum) ? '$0.00' : `$${currencyNum.toFixed(2)}`;
    
    case 'date':
      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
    
    case 'datetime':
      const datetime = new Date(value);
      return isNaN(datetime.getTime()) ? '' : datetime.toLocaleString();
    
    case 'boolean':
      return value === true ? 'Yes' : value === false ? 'No' : '';
    
    case 'url':
      return value.toString();
    
    default:
      return value.toString();
  }
}

// Get field mapping for a specific data type
export function getFieldMapping(dataType: string): FieldMapping {
  return COMMON_FIELD_MAPPINGS[dataType] || {};
}

// Apply field mapping to transform data
export function applyFieldMapping(data: any[], dataType: string): any[] {
  const fieldMapping = getFieldMapping(dataType);
  
  return data.map(item => {
    const transformedItem: any = {};
    
    Object.entries(item).forEach(([key, value]) => {
      const mapping = fieldMapping[key];
      if (mapping) {
        transformedItem[mapping.displayName] = formatValue(value, mapping);
      } else {
        // For unmapped fields, use a cleaned-up version of the key
        const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        transformedItem[cleanKey] = formatValue(value);
      }
    });
    
    return transformedItem;
  });
}

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
  
  // Clean and standardize base name
  let filename = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
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

// Download blob with enhanced browser compatibility and error handling
export function downloadBlob(
  blob: Blob,
  filename: string,
  format: ExportFormat
): Promise<ExportResult> {
  return new Promise((resolve) => {
    try {
      // Validate blob
      if (!blob || blob.size === 0) {
        resolve({
          success: false,
          filename,
          format,
          error: "Invalid or empty file content",
        });
        return;
      }

      // Log blob details for debugging
      console.log(`Downloading ${format} file:`, {
        filename,
        size: blob.size,
        type: blob.type
      });

      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      
      // Add click handler to detect if download was initiated
      let downloadStarted = false;
      link.addEventListener('click', () => {
        downloadStarted = true;
      });
      
      // Trigger download
      document.body.appendChild(link);
      
      // Use setTimeout to ensure click event is processed
      setTimeout(() => {
        link.click();
        
        // Give browser time to start download before cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          resolve({
            success: downloadStarted,
            filename,
            format,
            size: blob.size,
          });
        }, 100);
      }, 10);
      
    } catch (error) {
      console.error("Download failed:", error);
      resolve({
        success: false,
        filename,
        format,
        error: error instanceof Error ? error.message : "Unknown download error",
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
export function formatCsvExport(data: ExportData, dataType?: string): Blob {
  // Professional CSV header with metadata
  let csvContent = `"${data.title}"\n`;
  csvContent += `"Generated by","Beekon AI"\n`;
  csvContent += `"Exported at","${new Date(data.exportedAt).toLocaleString()}"\n`;
  csvContent += `"Total Records","${data.totalRecords}"\n`;
  
  // Add filters if present
  if (data.filters && Object.keys(data.filters).length > 0) {
    csvContent += `\n"Applied Filters:"\n`;
    Object.entries(data.filters).forEach(([key, value]) => {
      const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      csvContent += `"${cleanKey}","${value}"\n`;
    });
  }
  
  // Add date range if present
  if (data.dateRange) {
    const startDate = new Date(data.dateRange.start).toLocaleDateString();
    const endDate = new Date(data.dateRange.end).toLocaleDateString();
    csvContent += `\n"Date Range","${startDate} to ${endDate}"\n`;
  }
  
  csvContent += `\n`;
  
  // Add the main data based on its structure
  if (Array.isArray(data.data)) {
    csvContent += formatArrayToCsv(data.data, dataType);
  } else if (typeof data.data === 'object') {
    csvContent += formatObjectToCsv(data.data, dataType);
  }
  
  return new Blob([csvContent], { type: EXPORT_MIME_TYPES.csv });
}

// Format data for PDF export (enhanced text format)
export function formatPdfExport(data: ExportData, dataType?: string): Blob {
  let textContent = `╔${"═".repeat(Math.max(data.title.length + 20, 60))}╗\n`;
  textContent += `║${" ".repeat(10)}${data.title.toUpperCase()}${" ".repeat(10)}║\n`;
  textContent += `╚${"═".repeat(Math.max(data.title.length + 20, 60))}╝\n\n`;
  
  // Professional document header
  textContent += `📊 BEEKON AI REPORT\n`;
  textContent += `${"─".repeat(50)}\n\n`;
  
  textContent += `📅 Generated: ${new Date(data.exportedAt).toLocaleString()}\n`;
  textContent += `📈 Total Records: ${data.totalRecords.toLocaleString()}\n`;
  
  // Add date range if present
  if (data.dateRange) {
    const startDate = new Date(data.dateRange.start).toLocaleDateString();
    const endDate = new Date(data.dateRange.end).toLocaleDateString();
    textContent += `📆 Date Range: ${startDate} to ${endDate}\n`;
  }
  
  textContent += `\n`;
  
  // Add filters if present
  if (data.filters && Object.keys(data.filters).length > 0) {
    textContent += `🔍 APPLIED FILTERS\n`;
    textContent += `${"─".repeat(20)}\n`;
    Object.entries(data.filters).forEach(([key, value]) => {
      const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      textContent += `• ${cleanKey}: ${value}\n`;
    });
    textContent += `\n`;
  }
  
  // Add the main data
  if (Array.isArray(data.data)) {
    textContent += formatArrayToPdf(data.data, dataType);
  } else if (typeof data.data === 'object') {
    textContent += formatObjectToPdf(data.data, dataType);
  }
  
  // Add footer
  textContent += `\n${"═".repeat(60)}\n`;
  textContent += `🚀 Generated by Beekon AI - ${new Date().toLocaleDateString()}\n`;
  textContent += `📊 This report contains ${data.totalRecords.toLocaleString()} records.\n`;
  textContent += `🌐 For more insights, visit your Beekon AI dashboard.\n`;
  
  return new Blob([textContent], { type: EXPORT_MIME_TYPES.pdf });
}

// Helper function to format array data to CSV
function formatArrayToCsv(data: any[], dataType?: string): string {
  if (data.length === 0) return `"No data available"\n`;
  
  // Apply field mapping if dataType is provided
  const processedData = dataType ? applyFieldMapping(data, dataType) : data;
  
  // Get headers from the first object
  const headers = Object.keys(processedData[0]);
  
  // Create CSV header with proper quoting
  let csvContent = headers.map(header => `"${header}"`).join(",") + "\n";
  
  // Add data rows
  processedData.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      // Convert to string and escape quotes
      const stringValue = String(value ?? '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    });
    csvContent += values.join(",") + "\n";
  });
  
  return csvContent;
}

// Helper function to format object data to CSV
function formatObjectToCsv(data: Record<string, any>, dataType?: string): string {
  let csvContent = `"Property","Value"\n`;
  
  const fieldMapping = dataType ? getFieldMapping(dataType) : {};
  
  Object.entries(data).forEach(([key, value]) => {
    const mapping = fieldMapping[key];
    const displayName = mapping?.displayName || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedValue = mapping ? formatValue(value, mapping) : (typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
    
    csvContent += `"${displayName}","${formattedValue.replace(/"/g, '""')}"\n`;
  });
  
  return csvContent;
}

// Helper function to format array data to PDF
function formatArrayToPdf(data: any[], dataType?: string): string {
  if (data.length === 0) return "No data available\n";
  
  // Apply field mapping if dataType is provided
  const processedData = dataType ? applyFieldMapping(data, dataType) : data;
  
  let pdfContent = "DATA RECORDS\n";
  pdfContent += "-".repeat(20) + "\n\n";
  
  processedData.forEach((item, index) => {
    pdfContent += `${(index + 1).toString().padStart(3, '0')}. RECORD\n`;
    pdfContent += "-".repeat(15) + "\n";
    
    Object.entries(item).forEach(([key, value]) => {
      const formattedKey = key.length > 25 ? key.substring(0, 25) + '...' : key;
      const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '');
      
      // Wrap long values
      if (formattedValue.length > 80) {
        const wrappedValue = formattedValue.match(/.{1,80}/g)?.join('\n    ') || formattedValue;
        pdfContent += `${formattedKey.padEnd(25)}: ${wrappedValue}\n`;
      } else {
        pdfContent += `${formattedKey.padEnd(25)}: ${formattedValue}\n`;
      }
    });
    
    pdfContent += "\n";
  });
  
  return pdfContent;
}

// Helper function to format object data to PDF
function formatObjectToPdf(data: Record<string, any>, dataType?: string): string {
  let pdfContent = "DATA SUMMARY\n";
  pdfContent += "-".repeat(20) + "\n\n";
  
  const fieldMapping = dataType ? getFieldMapping(dataType) : {};
  
  Object.entries(data).forEach(([key, value]) => {
    const mapping = fieldMapping[key];
    const displayName = mapping?.displayName || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedValue = mapping ? formatValue(value, mapping) : (typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? ''));
    
    const formattedKey = displayName.length > 25 ? displayName.substring(0, 25) + '...' : displayName;
    
    // Wrap long values
    if (formattedValue.length > 80) {
      const wrappedValue = formattedValue.match(/.{1,80}/g)?.join('\n    ') || formattedValue;
      pdfContent += `${formattedKey.padEnd(25)}: ${wrappedValue}\n`;
    } else {
      pdfContent += `${formattedKey.padEnd(25)}: ${formattedValue}\n`;
    }
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
        const formatNote = config.format === 'pdf' 
          ? ' (Note: PDF exports are in readable text format)'
          : '';
        toast({
          title: "Export successful",
          description: `${filename} has been downloaded${formatNote}`,
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