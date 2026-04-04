import { extractHtmlImageUrls } from '@/utils/markdown-content-images';

type UrlKind = 'remote' | 'image' | 'data-image';

const URL_PATTERNS: Record<UrlKind, RegExp> = {
  remote: /^https?:\/\/\S+$/i,
  image: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?[^\s]*)?$/i,
  'data-image': /^data:image\/[a-z0-9.+-]+;base64,/i,
};

const isAllowedUrl = (text: string, kinds: UrlKind | UrlKind[] = 'remote') => {
  const trimmed = text.trim();
  const targets = Array.isArray(kinds) ? kinds : [kinds];

  return targets.some((kind) => URL_PATTERNS[kind].test(trimmed));
};

export const extractClipboardImageFiles = (
  clipboardData: DataTransfer,
): File[] => {
  const directImageFiles = Array.from(clipboardData.files).filter((file) =>
    file.type.startsWith('image/'),
  );

  if (directImageFiles.length > 0) {
    return directImageFiles;
  }

  return Array.from(clipboardData.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
};

export const extractClipboardImageSource = (clipboardData: DataTransfer) => {
  const pastedHtml = clipboardData.getData('text/html').trim();
  if (pastedHtml) {
    const imageSource = extractHtmlImageUrls(pastedHtml)[0]?.trim();

    if (imageSource && isAllowedUrl(imageSource, ['remote', 'data-image'])) {
      return imageSource;
    }
  }

  const pastedText = clipboardData.getData('text/plain').trim();
  if (pastedText && isAllowedUrl(pastedText, ['image', 'data-image'])) {
    return pastedText;
  }

  return '';
};

export const hasClipboardImageHint = (clipboardData: DataTransfer) => {
  if (extractClipboardImageFiles(clipboardData).length > 0) {
    return true;
  }

  if (
    Array.from(clipboardData.items).some((item) => item.type.includes('html'))
  ) {
    return clipboardData.getData('text/html').includes('<img');
  }

  const pastedText = clipboardData.getData('text/plain').trim();

  return isAllowedUrl(pastedText, ['image', 'data-image']);
};
