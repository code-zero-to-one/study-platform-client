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

/**
 * 이미지 너비를 80~400px 범위로 제한합니다.
 * @example
 * clampImageWidth(50) // 80
 * clampImageWidth(200) // 200
 * clampImageWidth(500) // 400
 */
export const clampImageWidth = (value: number) => {
  return Math.min(
    MARKDOWN_IMAGE_MAX_WIDTH,
    Math.max(MARKDOWN_IMAGE_MIN_WIDTH, Math.round(value)),
  );
};

/**
 * 너비 값을 숫자로 파싱하고 유효 범위로 조정합니다.
 * @example
 * parseImageWidth('250') // 250
 * parseImageWidth('50') // 80 (최소값)
 * parseImageWidth('abc') // 200 (기본값)
 * parseImageWidth(undefined) // 200 (기본값)
 */
export const parseImageWidth = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return MARKDOWN_IMAGE_DEFAULT_WIDTH;
  }

  return clampImageWidth(parsed);
};

/**
 * Blob을 File 객체로 변환합니다.
 * @example
 * const blob = new Blob(['image data'], { type: 'image/png' })
 * const file = toFileFromBlob(blob, 'screenshot.png')
 * console.log(file.name) // 'screenshot.png'
 */
export const toFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};

/**
 * MIME 타입에서 파일 확장자를 추출합니다.
 * @example
 * getExtensionFromMime('image/jpeg') // 'jpg'
 * getExtensionFromMime('image/png') // 'png'
 * getExtensionFromMime('image/webp') // 'webp'
 * getExtensionFromMime('image/gif') // 'gif'
 * getExtensionFromMime('unknown/type') // 'type'
 */
export const getExtensionFromMime = (mimeType: string): string => {
  const imageMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return imageMap[mimeType] ?? mimeType.split('/')[1]?.toLowerCase() ?? '';
};

/**
 * 확장자 배열을 input accept 형식으로 변환합니다.
 * @example
 * toImageInputAccept(['jpg', 'png']) // '.jpg,.png'
 * toImageInputAccept(['jpg', 'png', 'webp']) // '.jpg,.png,.webp'
 */
export const toImageInputAccept = (extensions: readonly string[]) => {
  return extensions.map((extension) => `.${extension}`).join(',');
};

/**
 * 파일 확장자가 허용된 목록에 포함되는지 확인합니다.
 * @example
 * isAllowedImageExtension('jpg', ['jpg', 'png']) // true
 * isAllowedImageExtension('gif', ['jpg', 'png']) // false
 * isAllowedImageExtension('png', ['jpg', 'png', 'webp']) // true
 */
export const isAllowedImageExtension = (
  extension: string,
  allowedExtensions: readonly string[],
) => {
  return allowedExtensions.includes(extension);
};

/**
 * 이미지 파일을 검증합니다 (MIME 타입, 확장자, 크기).
 * @example
 * const file = new File(['data'], 'image.jpg', { type: 'image/jpeg' })
 * const config = {
 *   allowedImageExtensions: ['jpg', 'png'],
 *   maxImageCount: 3,
 *   maxImageFileSize: 5 * 1024 * 1024,
 *   uploadImageFile: async (f) => 'url'
 * }
 * const error = validateImageFileForUpload(file, config)
 * console.log(error) // undefined (검증 통과)
 */
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
