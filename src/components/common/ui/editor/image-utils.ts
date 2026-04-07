import { getFileExtension } from '@/utils/markdown-content-images';

export interface MarkdownEditorImageConfig {
  allowedImageExtensions: readonly string[];
  maxImageCount: number;
  maxImageFileSize: number;
  uploadImageFile: (file: File) => Promise<string>;
}

export const MARKDOWN_IMAGE_MIN_WIDTH = 200;
export const MARKDOWN_IMAGE_DEFAULT_WIDTH = 480;
export const MARKDOWN_IMAGE_MAX_WIDTH = 800;
export const MARKDOWN_IMAGE_WIDTH_STEP = 10;
export const MARKDOWN_IMAGE_DEFAULT_MAX_COUNT = 3;
export const MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_HEADER_BYTE_LENGTH = 32;
const JPEG_EXTENSIONS = ['jpg', 'jpeg'] as const;
const HEIF_LIKE_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
]);
export const MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
] as const;

const IMAGE_EXTENSION_BY_MIME = {
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

const IMAGE_EXTENSIONS_BY_MIME = {
  'image/gif': ['gif'],
  'image/heic': ['heic'],
  'image/heif': ['heif'],
  'image/jpeg': JPEG_EXTENSIONS,
  'image/png': ['png'],
  'image/webp': ['webp'],
} as const;

type SupportedImageMimeType = keyof typeof IMAGE_EXTENSIONS_BY_MIME;

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
  return (
    IMAGE_EXTENSION_BY_MIME[mimeType as SupportedImageMimeType] ??
    mimeType.split('/')[1]?.toLowerCase() ??
    ''
  );
};

const normalizeImageMimeType = (
  mimeType: string | undefined,
): SupportedImageMimeType | undefined => {
  const normalizedMimeType = mimeType?.trim().toLowerCase();

  if (normalizedMimeType && normalizedMimeType in IMAGE_EXTENSIONS_BY_MIME) {
    return normalizedMimeType as SupportedImageMimeType;
  }

  return undefined;
};

const hasPrefix = (bytes: Uint8Array, prefix: readonly number[]) => {
  if (bytes.length < prefix.length) {
    return false;
  }

  return prefix.every((value, index) => bytes[index] === value);
};

const readAscii = (bytes: Uint8Array, start: number, end: number) => {
  return String.fromCharCode(...bytes.slice(start, end)).toLowerCase();
};

const getIsoBmffBrands = (bytes: Uint8Array) => {
  if (readAscii(bytes, 4, 8) !== 'ftyp') {
    return [];
  }

  const brands = [readAscii(bytes, 8, 12)];

  for (let index = 16; index + 4 <= bytes.length; index += 4) {
    brands.push(readAscii(bytes, index, index + 4));
  }

  return brands.filter(Boolean);
};

const detectImageMimeTypeFromHeader = (
  bytes: Uint8Array,
): SupportedImageMimeType | undefined => {
  if (hasPrefix(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  if (hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  const gifHeader = readAscii(bytes, 0, 6);
  if (gifHeader === 'gif87a' || gifHeader === 'gif89a') {
    return 'image/gif';
  }

  if (readAscii(bytes, 0, 4) === 'riff' && readAscii(bytes, 8, 12) === 'webp') {
    return 'image/webp';
  }

  const brands = getIsoBmffBrands(bytes);
  if (!brands.some((brand) => HEIF_LIKE_BRANDS.has(brand))) {
    return undefined;
  }

  if (brands.some((brand) => brand === 'mif1' || brand === 'msf1')) {
    return 'image/heif';
  }

  return 'image/heic';
};

const replaceFileExtension = (fileName: string, nextExtension: string) => {
  const normalizedFileName = fileName.trim();

  if (!normalizedFileName) {
    return `image.${nextExtension}`;
  }

  const lastDotIndex = normalizedFileName.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return `${normalizedFileName}.${nextExtension}`;
  }

  return `${normalizedFileName.slice(0, lastDotIndex)}.${nextExtension}`;
};

const hasMatchingImageExtension = (
  fileName: string,
  mimeType: SupportedImageMimeType,
) => {
  const extension = getFileExtension(fileName);

  return (IMAGE_EXTENSIONS_BY_MIME[mimeType] as readonly string[]).includes(
    extension,
  );
};

const isHeicLikeImageMimeType = (
  mimeType: string | undefined,
): mimeType is 'image/heic' | 'image/heif' => {
  return mimeType === 'image/heic' || mimeType === 'image/heif';
};

const convertHeicImageFileToJpeg = async (file: File) => {
  try {
    const { default: heic2any } = await import('heic2any');
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    });
    const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

    if (!(convertedBlob instanceof Blob)) {
      throw new Error();
    }

    return new File([convertedBlob], replaceFileExtension(file.name, 'jpg'), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    throw new Error(
      'HEIC/HEIF 이미지를 처리하지 못했습니다. 다른 이미지로 다시 시도해 주세요.',
    );
  }
};

export const normalizeImageFileForUpload = async (file: File) => {
  const detectedMimeType = detectImageMimeTypeFromHeader(
    new Uint8Array(await file.slice(0, IMAGE_HEADER_BYTE_LENGTH).arrayBuffer()),
  );
  const reportedMimeType = normalizeImageMimeType(file.type);

  if (isHeicLikeImageMimeType(detectedMimeType)) {
    return convertHeicImageFileToJpeg(file);
  }

  if (!detectedMimeType && isHeicLikeImageMimeType(reportedMimeType)) {
    return convertHeicImageFileToJpeg(file);
  }

  const resolvedMimeType = detectedMimeType ?? reportedMimeType;
  if (!resolvedMimeType) {
    return file;
  }

  if (
    reportedMimeType === resolvedMimeType &&
    hasMatchingImageExtension(file.name, resolvedMimeType)
  ) {
    return file;
  }

  return new File(
    [file],
    replaceFileExtension(file.name, getExtensionFromMime(resolvedMimeType)),
    {
      type: resolvedMimeType,
      lastModified: file.lastModified,
    },
  );
};

export const getImageFileNormalizationErrorMessage = (
  fileName: string,
  error: unknown,
) => {
  if (error instanceof Error && error.message.trim()) {
    return `${fileName}: ${error.message.trim()}`;
  }

  return `${fileName}: 이미지를 처리하지 못했습니다. 다른 이미지로 다시 시도해 주세요.`;
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
 * const error = getImageFileUploadValidationError(file, config)
 * console.log(error) // undefined (검증 통과)
 */
export const getImageFileUploadValidationError = (
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
