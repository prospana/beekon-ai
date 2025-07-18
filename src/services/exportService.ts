// Enhanced export service with additional formats and features

import { supabase } from "@/integrations/supabase/client";
import {
  ExportFormat,
  ExportData,
  ExportConfig,
  formatJsonExport,
  formatCsvExport,
  formatPdfExport,
  generateExportFilename,
} from "@/lib/export-utils";
import { exportHistoryService } from "./exportHistoryService";
import { ExportType, ExportHistoryRecord } from "@/types/database";

// Export service class with enhanced functionality
export class ExportService {
  private static instance: ExportService;
  
  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Generate Excel export (enhanced CSV with proper formatting)
  private generateExcelExport(data: ExportData): Blob {
    // For now, we'll use enhanced CSV format
    // In a production environment, you would use libraries like SheetJS or ExcelJS
    let excelContent = `sep=,\n`; // Excel separator hint
    
    // Add title and metadata
    excelContent += `${data.title}\n`;
    excelContent += `Exported at,${data.exportedAt}\n`;
    excelContent += `Total Records,${data.totalRecords}\n`;
    excelContent += `\n`;
    
    // Add filters if present
    if (data.filters && Object.keys(data.filters).length > 0) {
      excelContent += `Applied Filters:\n`;
      Object.entries(data.filters).forEach(([key, value]) => {
        excelContent += `${key},${value}\n`;
      });
      excelContent += `\n`;
    }
    
    // Add date range if present
    if (data.dateRange) {
      excelContent += `Date Range,${data.dateRange.start} to ${data.dateRange.end}\n`;
      excelContent += `\n`;
    }
    
    // Add main data
    if (Array.isArray(data.data)) {
      excelContent += this.formatArrayToExcel(data.data);
    } else if (typeof data.data === 'object') {
      excelContent += this.formatObjectToExcel(data.data);
    }
    
    return new Blob([excelContent], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
  }

  // Generate Word export (enhanced structured document)
  private generateWordExport(data: ExportData): Blob {
    // For now, we'll use enhanced text format
    // In a production environment, you would use libraries like docx or mammoth
    let wordContent = `${data.title}\n`;
    wordContent += `${"=".repeat(data.title.length)}\n\n`;
    
    // Document metadata
    wordContent += `Document Information:\n`;
    wordContent += `- Generated: ${new Date(data.exportedAt).toLocaleString()}\n`;
    wordContent += `- Total Records: ${data.totalRecords}\n`;
    
    if (data.dateRange) {
      wordContent += `- Date Range: ${data.dateRange.start} to ${data.dateRange.end}\n`;
    }
    
    wordContent += `\n`;
    
    // Add filters if present
    if (data.filters && Object.keys(data.filters).length > 0) {
      wordContent += `Applied Filters:\n`;
      Object.entries(data.filters).forEach(([key, value]) => {
        wordContent += `- ${key}: ${value}\n`;
      });
      wordContent += `\n`;
    }
    
    // Add main data
    if (Array.isArray(data.data)) {
      wordContent += this.formatArrayToWord(data.data);
    } else if (typeof data.data === 'object') {
      wordContent += this.formatObjectToWord(data.data);
    }
    
    return new Blob([wordContent], { 
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
    });
  }

  // Format array data for Excel
  private formatArrayToExcel(data: Record<string, unknown>[]): string {
    if (data.length === 0) return "No data available\n";
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    let excelContent = headers.join(",") + "\n";
    
    // Add data rows with proper Excel formatting
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle different data types for Excel
        if (typeof value === 'number') {
          return value.toString();
        } else if (typeof value === 'boolean') {
          return value ? "TRUE" : "FALSE";
        } else if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // String values - Excel format
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      excelContent += values.join(",") + "\n";
    });
    
    return excelContent;
  }

  // Format object data for Excel
  private formatObjectToExcel(data: Record<string, unknown>): string {
    let excelContent = "Property,Value\n";
    
    Object.entries(data).forEach(([key, value]) => {
      let formattedValue: string;
      
      if (typeof value === 'number') {
        formattedValue = value.toString();
      } else if (typeof value === 'boolean') {
        formattedValue = value ? "TRUE" : "FALSE";
      } else if (value instanceof Date) {
        formattedValue = value.toISOString().split('T')[0];
      } else if (typeof value === 'object' && value !== null) {
        formattedValue = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        const stringValue = String(value ?? '');
        formattedValue = stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }
      
      excelContent += `${key},${formattedValue}\n`;
    });
    
    return excelContent;
  }

  // Format array data for Word
  private formatArrayToWord(data: Record<string, unknown>[]): string {
    if (data.length === 0) return "No data available\n";
    
    let wordContent = "Data Records\n";
    wordContent += "-".repeat(20) + "\n\n";
    
    data.forEach((item, index) => {
      wordContent += `${index + 1}. Record\n`;
      wordContent += "-".repeat(15) + "\n";
      
      Object.entries(item).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let formattedValue: string;
        
        if (typeof value === 'object' && value !== null) {
          formattedValue = JSON.stringify(value, null, 2);
        } else if (value instanceof Date) {
          formattedValue = value.toLocaleString();
        } else {
          formattedValue = String(value ?? '');
        }
        
        wordContent += `${formattedKey}: ${formattedValue}\n`;
      });
      
      wordContent += "\n";
    });
    
    return wordContent;
  }

  // Format object data for Word
  private formatObjectToWord(data: Record<string, unknown>): string {
    let wordContent = "Data Summary\n";
    wordContent += "-".repeat(20) + "\n\n";
    
    Object.entries(data).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      let formattedValue: string;
      
      if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value, null, 2);
      } else if (value instanceof Date) {
        formattedValue = value.toLocaleString();
      } else {
        formattedValue = String(value ?? '');
      }
      
      wordContent += `${formattedKey}: ${formattedValue}\n`;
    });
    
    return wordContent;
  }

  // Main export function with support for all formats and history tracking
  async exportData(
    data: ExportData,
    format: ExportFormat,
    options: {
      trackHistory?: boolean;
      exportType?: ExportType;
      customFilename?: string;
    } = {}
  ): Promise<Blob> {
    const { trackHistory = true, exportType = "filtered_data", customFilename } = options;
    
    let exportRecord: ExportHistoryRecord | null = null;
    
    try {
      // Create export history record if tracking is enabled
      if (trackHistory) {
        const filename = customFilename || generateExportFilename(
          data.title.toLowerCase().replace(/\s+/g, '_'),
          format,
          { 
            includeTimestamp: true, 
            dateRange: data.dateRange 
          }
        );
        
        exportRecord = await exportHistoryService.createExportRecord({
          export_type: exportType,
          format,
          filename,
          filters: data.filters,
          date_range: data.dateRange,
          metadata: {
            ...data.metadata,
            total_records: data.totalRecords,
            export_title: data.title,
          },
        });
        
        // Mark as processing
        await exportHistoryService.startExportProcessing(exportRecord.id, {
          processing_started: new Date().toISOString(),
        });
      }
      
      // Generate the export
      let blob: Blob;
      switch (format) {
        case "json":
          blob = formatJsonExport(data);
          break;
        case "csv":
          blob = formatCsvExport(data);
          break;
        case "pdf":
          blob = formatPdfExport(data);
          break;
        case "excel":
          blob = this.generateExcelExport(data);
          break;
        case "word":
          blob = this.generateWordExport(data);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      // Mark as completed if tracking is enabled
      if (trackHistory && exportRecord) {
        await exportHistoryService.completeExport(
          exportRecord.id,
          blob.size,
          {
            processing_completed: new Date().toISOString(),
            actual_size: blob.size,
            content_type: blob.type,
          }
        );
      }
      
      return blob;
    } catch (error) {
      // Mark as failed if tracking is enabled
      if (trackHistory && exportRecord) {
        await exportHistoryService.failExport(
          exportRecord.id,
          error instanceof Error ? error.message : "Unknown error",
          {
            error_details: error instanceof Error ? error.stack : undefined,
            failed_at: new Date().toISOString(),
          }
        );
      }
      
      throw error;
    }
  }

  // Export website data (for Websites page)
  async exportWebsiteData(
    websiteIds: string[],
    format: ExportFormat,
    options: {
      includeMetrics?: boolean;
      includeAnalysisHistory?: boolean;
      dateRange?: { start: string; end: string };
    } = {}
  ): Promise<Blob> {
    const { includeMetrics = true, includeAnalysisHistory = false, dateRange } = options;

    // Fetch website data
    const { data: websites, error } = await supabase
      .schema("beekon_data")
      .from("websites")
      .select(`
        id,
        domain,
        display_name,
        created_at,
        updated_at,
        is_active,
        description,
        website_type,
        monitoring_enabled
      `)
      .in("id", websiteIds);

    if (error) throw error;

    let exportData: Record<string, unknown>[] = websites || [];

    // Add metrics if requested
    if (includeMetrics) {
      const metricsPromises = websiteIds.map(async (websiteId) => {
        let metricsQuery = supabase
          .schema("beekon_data")
          .from("llm_analysis_results")
          .select(`
            confidence_score,
            sentiment_score,
            is_mentioned,
            rank_position,
            created_at,
            prompts!inner(
              topics!inner(
                website_id,
                topic_name
              )
            )
          `)
          .eq("prompts.topics.website_id", websiteId);

        if (dateRange) {
          metricsQuery = metricsQuery
            .gte("created_at", dateRange.start)
            .lte("created_at", dateRange.end);
        }

        const { data: metrics } = await metricsQuery;
        return { websiteId, metrics: metrics || [] };
      });

      const metricsResults = await Promise.all(metricsPromises);
      
      // Merge metrics with website data
      exportData = exportData.map((website) => {
        const websiteMetrics = metricsResults.find(m => m.websiteId === website.id);
        return {
          ...website,
          metrics: {
            totalAnalyses: websiteMetrics?.metrics.length || 0,
            averageConfidence: websiteMetrics?.metrics.reduce((sum, m) => sum + (m.confidence_score || 0), 0) / (websiteMetrics?.metrics.length || 1) || 0,
            averageSentiment: websiteMetrics?.metrics.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / (websiteMetrics?.metrics.length || 1) || 0,
            mentionRate: (websiteMetrics?.metrics.filter(m => m.is_mentioned).length || 0) / (websiteMetrics?.metrics.length || 1) * 100,
            averageRank: websiteMetrics?.metrics.reduce((sum, m) => sum + (m.rank_position || 0), 0) / (websiteMetrics?.metrics.length || 1) || 0,
          }
        };
      });
    }

    // Add analysis history if requested
    if (includeAnalysisHistory) {
      const historyPromises = websiteIds.map(async (websiteId) => {
        let historyQuery = supabase
          .schema("beekon_data")
          .from("llm_analysis_results")
          .select(`
            created_at,
            llm_provider,
            is_mentioned,
            rank_position,
            confidence_score,
            sentiment_score,
            response_text,
            prompts!inner(
              prompt_text,
              topics!inner(
                website_id,
                topic_name
              )
            )
          `)
          .eq("prompts.topics.website_id", websiteId)
          .order("created_at", { ascending: false });

        if (dateRange) {
          historyQuery = historyQuery
            .gte("created_at", dateRange.start)
            .lte("created_at", dateRange.end);
        }

        const { data: history } = await historyQuery;
        return { websiteId, history: history || [] };
      });

      const historyResults = await Promise.all(historyPromises);
      
      // Merge history with website data
      exportData = exportData.map((website) => {
        const websiteHistory = historyResults.find(h => h.websiteId === website.id);
        return {
          ...website,
          analysisHistory: websiteHistory?.history || []
        };
      });
    }

    const exportContent: ExportData = {
      title: `Website Data Export`,
      data: exportData,
      exportedAt: new Date().toISOString(),
      totalRecords: exportData.length,
      filters: {
        includeMetrics,
        includeAnalysisHistory,
        websiteCount: websiteIds.length,
      },
      dateRange,
      metadata: {
        exportType: "website_data",
        generatedBy: "Beekon AI Export Service",
      },
    };

    return this.exportData(exportContent, format, { 
      exportType: "website", 
      customFilename: generateExportFilename("website_data", format, { 
        includeTimestamp: true, 
        dateRange 
      }) 
    });
  }

  // Export configuration data (for modals)
  async exportConfigurationData(
    configData: Record<string, unknown>,
    configType: "analysis" | "website_settings" | "workspace",
    format: ExportFormat
  ): Promise<Blob> {
    const exportContent: ExportData = {
      title: `${configType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration`,
      data: configData,
      exportedAt: new Date().toISOString(),
      totalRecords: Array.isArray(configData) ? configData.length : 1,
      metadata: {
        exportType: `${configType}_configuration`,
        generatedBy: "Beekon AI Export Service",
        configType,
      },
    };

    return this.exportData(exportContent, format, { 
      exportType: "configuration", 
      customFilename: generateExportFilename(`${configType}_config`, format, { 
        includeTimestamp: true 
      }) 
    });
  }

  // Export filtered data with advanced options
  async exportFilteredData(
    tableName: string,
    filters: Record<string, unknown>,
    format: ExportFormat,
    options: {
      selectFields?: string;
      orderBy?: string;
      limit?: number;
      dateRange?: { start: string; end: string };
      title?: string;
    } = {}
  ): Promise<Blob> {
    const {
      selectFields = "*",
      orderBy = "created_at",
      limit,
      dateRange,
      title = `${tableName} Export`,
    } = options;

    // Build query
    let query = supabase
      .schema("beekon_data")
      .from(tableName)
      .select(selectFields)
      .order(orderBy, { ascending: false });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply date range
    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    const exportContent: ExportData = {
      title,
      data: data || [],
      exportedAt: new Date().toISOString(),
      totalRecords: data?.length || 0,
      filters,
      dateRange,
      metadata: {
        exportType: "filtered_data",
        tableName,
        generatedBy: "Beekon AI Export Service",
      },
    };

    return this.exportData(exportContent, format, { 
      exportType: "filtered_data", 
      customFilename: generateExportFilename(tableName, format, { 
        includeTimestamp: true, 
        dateRange 
      }) 
    });
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();