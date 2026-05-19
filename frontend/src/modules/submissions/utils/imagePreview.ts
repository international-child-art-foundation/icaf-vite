const PREVIEW_SIZE = 640;
const PREVIEW_QUALITY = 0.72;

export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const scale = Math.min(
        1,
        PREVIEW_SIZE / Math.max(image.width, image.height),
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      URL.revokeObjectURL(url);

      if (!context) {
        reject(new Error('Canvas is unavailable.'));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', PREVIEW_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image preview failed.'));
    };

    image.src = url;
  });
}
