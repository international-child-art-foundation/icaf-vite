import type { UploadFileType } from '@icaf/shared';

const UPLOAD_CONTENT_TYPES: Record<UploadFileType, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export type UploadToPresignedUrlOptions = {
  file: Blob;
  fileType: UploadFileType;
  signal?: AbortSignal;
  url: string;
};

export async function uploadToPresignedUrl({
  file,
  fileType,
  signal,
  url,
}: UploadToPresignedUrlOptions): Promise<void> {
  const response = await fetch(url, {
    body: file,
    headers: {
      'Content-Type': UPLOAD_CONTENT_TYPES[fileType],
    },
    method: 'PUT',
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText || 'Upload failed');
  }
}
