const PREVIEW_SIZE = 640;
const PREVIEW_QUALITY = 0.72;

function normalizeRotation(rotationDegrees: number) {
  return ((rotationDegrees % 360) + 360) % 360;
}

function getOutputType(file: File) {
  if (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/webp'
  ) {
    return file.type;
  }

  return 'image/png';
}

function getOutputExtension(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

function replaceFileExtension(fileName: string, extension: string) {
  return fileName.includes('.')
    ? fileName.replace(/\.[^.]+$/, `.${extension}`)
    : `${fileName}.${extension}`;
}

function drawRotatedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  rotationDegrees: number,
) {
  const rotation = normalizeRotation(rotationDegrees);

  context.save();
  if (rotation === 90) {
    context.translate(height, 0);
    context.rotate(Math.PI / 2);
  } else if (rotation === 180) {
    context.translate(width, height);
    context.rotate(Math.PI);
  } else if (rotation === 270) {
    context.translate(0, width);
    context.rotate((3 * Math.PI) / 2);
  }

  context.drawImage(image, 0, 0, width, height);
  context.restore();
}

export function createImagePreview(
  file: File,
  rotationDegrees = 0,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const rotation = normalizeRotation(rotationDegrees);
      const scale = Math.min(
        1,
        PREVIEW_SIZE / Math.max(image.width, image.height),
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const isSideways = rotation === 90 || rotation === 270;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      URL.revokeObjectURL(url);

      if (!context) {
        reject(new Error('Canvas is unavailable.'));
        return;
      }

      canvas.width = isSideways ? height : width;
      canvas.height = isSideways ? width : height;
      drawRotatedImage(context, image, width, height, rotation);
      resolve(canvas.toDataURL('image/jpeg', PREVIEW_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image preview failed.'));
    };

    image.src = url;
  });
}

export function createRotatedImageFile(
  file: File,
  rotationDegrees: number,
): Promise<File> {
  const rotation = normalizeRotation(rotationDegrees);
  if (rotation === 0) return Promise.resolve(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const isSideways = rotation === 90 || rotation === 270;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const outputType = getOutputType(file);

      URL.revokeObjectURL(url);

      if (!context) {
        reject(new Error('Canvas is unavailable.'));
        return;
      }

      canvas.width = isSideways ? image.height : image.width;
      canvas.height = isSideways ? image.width : image.height;
      drawRotatedImage(context, image, image.width, image.height, rotation);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image rotation failed.'));
            return;
          }

          const fileName = replaceFileExtension(
            file.name,
            getOutputExtension(blob.type || outputType),
          );
          resolve(
            new File([blob], fileName, {
              lastModified: file.lastModified,
              type: blob.type || outputType,
            }),
          );
        },
        outputType,
        PREVIEW_QUALITY,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image rotation failed.'));
    };

    image.src = url;
  });
}
