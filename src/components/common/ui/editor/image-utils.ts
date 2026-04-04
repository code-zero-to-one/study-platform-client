import { getFileExtension } from '@/utils/markdown-content-images';

export interface MarkdownEditorImageConfig {
  allowedImageExtensions: readonly string[];
  maxImageCount: number;
  maxImageFileSize: number;
  uploadImageFile: (file: File) => Promise<string>;
}

export const MARKDOWN_IMAGE_MIN_WIDTH = 80;
export const MARKDOWN_IMAGE_DEFAULT_WIDTH = 200;
export const MARKDOWN_IMAGE_MAX_WIDTH = 400;
export const MARKDOWN_IMAGE_WIDTH_STEP = 10;
export const MARKDOWN_IMAGE_DEFAULT_MAX_COUNT = 3;
export const MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

export const clampImageWidth = (value: number) => {
  return Math.min(
    MARKDOWN_IMAGE_MAX_WIDTH,
    Math.max(MARKDOWN_IMAGE_MIN_WIDTH, Math.round(value)),
  );
};

export const parseImageWidth = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return MARKDOWN_IMAGE_DEFAULT_WIDTH;
  }

  return clampImageWidth(parsed);
};

export const toFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};

export const getExtensionFromMime = (mimeType: string): string => {
  const imageMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return imageMap[mimeType] ?? mimeType.split('/')[1]?.toLowerCase() ?? '';
};

export const toImageInputAccept = (extensions: readonly string[]) => {
  return extensions.map((extension) => `.${extension}`).join(',');
};

export const isAllowedImageExtension = (
  extension: string,
  allowedExtensions: readonly string[],
) => {
  return allowedExtensions.includes(extension);
};

export const validateImageFileForUpload = (
  file: File,
  resolvedImageConfig: MarkdownEditorImageConfig,
): string | undefined => {
  if (!file.type.startsWith('image/')) {
    return `${file.name}: 이미지 파일이 아닙니다.`;
  }

  const extension = getFileExtension(file.name);
  if (
    extension &&
    extension !== 'blob' &&
    !isAllowedImageExtension(
      extension,
      resolvedImageConfig.allowedImageExtensions,
    )
  ) {
    return `${file.name}: 허용되지 않은 확장자입니다. (${resolvedImageConfig.allowedImageExtensions.join('/')})`;
  }

  if (file.size > resolvedImageConfig.maxImageFileSize) {
    return `${file.name}: ${Math.floor(resolvedImageConfig.maxImageFileSize / (1024 * 1024))}MB를 초과합니다.`;
  }

  return undefined;
};
