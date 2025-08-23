export interface WebPOptions {
  quality: number;
  width?: number;
  height?: number;
}
export const convertToWebP = (
  file: File,
  options: WebPOptions = { quality: 0.8 }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = options.width || img.width;
      canvas.height = options.height || img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          options.quality
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
