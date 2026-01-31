export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export const validateImage = (file: File): ImageValidationResult => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يرجى استخدام JPG أو PNG أو WEBP',
    };
  }

  // Check file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم الملف كبير جداً. الحد الأقصى 2MB',
    };
  }

  return { valid: true };
};

export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('فشل في إنشاء سياق الرسم'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('فشل تحميل الصورة'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('فشل قراءة الملف'));
    };

    reader.readAsDataURL(file);
  });
};

export const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('فشل تحميل الصورة'));
    };

    img.src = base64;
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
