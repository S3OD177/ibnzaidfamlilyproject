"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, FileImage, FileText, Database, Loader2, Check } from 'lucide-react';
import { exportAsPNG, exportAsPDF, exportAsJSON, getReactFlowElement } from '@/lib/export/exportTree';

interface ExportControlsProps {
  nodes: any[];
  edges: any[];
}

export default function ExportControls({ nodes, edges }: ExportControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type: 'png' | 'pdf' | 'json') => {
    setIsExporting(true);
    setExportStatus('');

    try {
      const element = getReactFlowElement();

      if (!element && type !== 'json') {
        throw new Error('لم يتم العثور على عنصر الشجرة');
      }

      switch (type) {
        case 'png':
          await exportAsPNG(element!, { filename: 'شجرة-العائلة' });
          setExportStatus('تم تصدير الشجرة كصورة PNG بنجاح');
          break;
        case 'pdf':
          await exportAsPDF(element!, { filename: 'شجرة-العائلة' });
          setExportStatus('تم تصدير الشجرة كملف PDF بنجاح');
          break;
        case 'json':
          exportAsJSON(nodes, edges, { filename: 'بيانات-شجرة-العائلة' });
          setExportStatus('تم تصدير البيانات بنجاح');
          break;
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setExportStatus('');
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('فشل التصدير. يرجى المحاولة مرة أخرى');
      setTimeout(() => setExportStatus(''), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`
          flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg
          text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary/30
          transition-all shadow-sm
          ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>تصدير</span>
      </button>

      {isOpen && !isExporting && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleExport('png')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileImage className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-gray-800">صورة PNG</p>
                <p className="text-[10px] text-gray-500">تصدير الشجرة كصورة عالية الجودة</p>
              </div>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-gray-800">ملف PDF</p>
                <p className="text-[10px] text-gray-500">تصدير الشجرة كمستند PDF</p>
              </div>
            </button>

            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="size-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Database className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-gray-800">بيانات JSON</p>
                <p className="text-[10px] text-gray-500">تصدير البيانات للنسخ الاحتياطي</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {exportStatus && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <p className="text-xs font-medium text-gray-700">{exportStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
}
