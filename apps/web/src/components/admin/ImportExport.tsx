'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ImportExportProps {
  onImport?: (data: any[], format: 'json' | 'csv') => Promise<{ success: number; errors: string[] }>;
  onExport?: (format: 'json' | 'csv') => void;
  data?: any[];
  entityName?: string;
  className?: string;
}

export function ImportExport({
  onImport,
  onExport,
  data = [],
  entityName = 'الأحداث',
  className,
}: ImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!onImport) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      let parsedData: any;
      const format = file.name.endsWith('.json') ? 'json' : 'csv';

      if (format === 'json') {
        parsedData = JSON.parse(text);
        if (!Array.isArray(parsedData)) {
          if (parsedData.data && Array.isArray(parsedData.data)) {
            parsedData = parsedData.data;
          } else if (parsedData.events && Array.isArray(parsedData.events)) {
            parsedData = parsedData.events;
          } else {
            throw new Error('صيغة JSON غير صالحة: يجب أن تكون مصفوفة');
          }
        }
      } else {
        parsedData = parseCSV(text);
      }

      const result = await onImport(parsedData, format);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [(error as Error).message || 'حدث خطأ أثناء الاستيراد'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.csv'))) {
      handleFileSelect(file);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Export handlers
  const handleExportJSON = () => {
    const jsonContent = JSON.stringify({ data, exportDate: new Date().toISOString() }, null, 2);
    downloadFile(jsonContent, `${entityName}_export.json`, 'application/json');
    onExport?.('json');
  };

  const handleExportCSV = () => {
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, `${entityName}_export.csv`, 'text/csv');
    onExport?.('csv');
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Import button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowImportModal(true)}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        استيراد
      </Button>

      {/* Export dropdown */}
      <div className="relative group">
        <Button variant="secondary" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          تصدير
        </Button>
        <div className="absolute top-full end-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-t-lg"
          >
            <FileJson className="h-4 w-4 text-blue-500" />
            تصدير كـ JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-b-lg"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-500" />
            تصدير كـ CSV
          </button>
        </div>
      </div>

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowImportModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="font-heading font-bold text-lg">استيراد {entityName}</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="p-1 rounded-lg hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Drop zone */}
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                  dragOver
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-300 hover:border-primary-400'
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {isImporting ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-3" />
                    <p className="text-neutral-600">جاري الاستيراد...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 mb-2">
                      اسحب وأفلت ملف JSON أو CSV هنا
                    </p>
                    <p className="text-sm text-neutral-400 mb-4">أو</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      اختر ملف
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Import result */}
              {importResult && (
                <div className="mt-4">
                  {importResult.success > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg mb-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                      <span>تم استيراد {importResult.success} عنصر بنجاح</span>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">
                          {importResult.errors.length} خطأ
                        </span>
                      </div>
                      <ul className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Format info */}
              <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  الصيغ المدعومة:
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-neutral-600">JSON</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-neutral-600">CSV (UTF-8)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Parse CSV to array of objects
function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj: Record<string, any> = {};

    headers.forEach((header, index) => {
      let value: any = values[index] || '';

      // Try to parse as number or date
      if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
      } else if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        // Keep as date string
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      }

      obj[header] = value;
    });

    data.push(obj);
  }

  return data;
}

// Helper: Parse a single CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

// Helper: Convert array to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get all unique headers
  const headers = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => headers.add(key));
  });
  const headerArray = Array.from(headers);

  // Build CSV content
  const lines: string[] = [];

  // Header row
  lines.push(headerArray.map(escapeCSVValue).join(','));

  // Data rows
  data.forEach((item) => {
    const values = headerArray.map((header) => {
      let value = item[header];

      // Handle nested objects
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value = value.length;
        } else if (value.nameAr) {
          value = value.nameAr;
        } else {
          value = JSON.stringify(value);
        }
      }

      return escapeCSVValue(value);
    });
    lines.push(values.join(','));
  });

  // Add BOM for Excel to recognize UTF-8
  return '\uFEFF' + lines.join('\n');
}

// Helper: Escape CSV value
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';

  const str = String(value);

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

// Helper: Download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
