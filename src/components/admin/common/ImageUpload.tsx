"use client";

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { validateImage, compressImage, formatFileSize } from '@/lib/utils/imageUtils';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  className?: string;
  showPreview?: boolean;
}

export default function ImageUpload({ value, onChange, className = '', showPreview = true }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Reset error
    setError('');

    // Validate file
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'خطأ في الملف');
      return;
    }

    setIsUploading(true);

    try {
      // Compress and convert to base64
      const base64 = await compressImage(file, 800, 800, 0.8);
      setPreview(base64);
      onChange(base64);
    } catch (err) {
      setError('فشل في معالجة الصورة. يرجى المحاولة مرة أخرى');
      console.error('Image processing error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setPreview('');
    setError('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Upload Area */}
      {!preview && (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-bold text-gray-600">جاري معالجة الصورة...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111813] mb-1">
                  اسحب الصورة هنا أو انقر للتحميل
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP (حتى 2MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && showPreview && (
        <div className="relative">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleClear}
            className="absolute top-2 left-2 size-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all group"
          >
            <X className="w-4 h-4 text-gray-600 group-hover:text-red-500" />
          </button>
        </div>
      )}

      {/* Compact Upload Button (when preview exists) */}
      {preview && (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-full py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary/30 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>تغيير الصورة</span>
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="size-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-xs font-medium text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
