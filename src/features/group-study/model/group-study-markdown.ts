'use client';

import type { GroupStudyPendingDescriptionImage } from '@/types/schemas/group-study-form.schema';
import {
  extractImageUrls,
  extractHtmlImageUrls,
  getFileExtension,
} from '@/utils/markdown-content-images';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';

export const GROUP_STUDY_MARKDOWN_MAX_IMAGE_COUNT = 3;
export const GROUP_STUDY_MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const GROUP_STUDY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

export interface SerializedGroupStudyDescription {
  description: string;
  pendingUploads: GroupStudyPendingDescriptionImage[];
}

const createRandomId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const replaceFirstImageSource = ({
  html,
  currentSource,
  nextSource,
}: {
  html: string;
  currentSource: string;
  nextSource: string;
}) => {
  const escapedSource = currentSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const quotedPattern = new RegExp(
    `(<img[^>]*\\bsrc\\s*=\\s*)(["'])${escapedSource}\\2`,
    'i',
  );

  if (quotedPattern.test(html)) {
    return html.replace(
      quotedPattern,
      `$1"${nextSource.replace(/\$/g, '$$$$')}"`,
    );
  }

  const unquotedPattern = new RegExp(
    `(<img[^>]*\\bsrc\\s*=\\s*)${escapedSource}(?=[\\s>])`,
    'i',
  );

  return html.replace(
    unquotedPattern,
    `$1${nextSource.replace(/\$/g, '$$$$')}`,
  );
};

export const createGroupStudyPendingDescriptionImage = (
  file: File,
): GroupStudyPendingDescriptionImage => {
  const extension = getFileExtension(file.name);
  const normalizedExtension =
    extension && extension !== 'blob' ? extension : 'png';

  return {
    file,
    objectUrl: URL.createObjectURL(file),
    macroFilename: `${createRandomId()}.${normalizedExtension}`,
  };
};

const escapeAtSymbols = (html: string): string => {
  const macroPlaceholders: string[] = [];
  const protectedHtml = html.replace(/@@[^@]+@@/g, (match) => {
    const index = macroPlaceholders.length;
    macroPlaceholders.push(match);

    return `\uFFF0MACRO${index}\uFFF0`;
  });
  const escapedHtml = protectedHtml.replace(/@/g, '\\@');

  return escapedHtml.replace(
    /\uFFF0MACRO(\d+)\uFFF0/g,
    (_, index) => macroPlaceholders[parseInt(index, 10)],
  );
};

export const serializeGroupStudyDescriptionForRequest = ({
  content,
  pendingImages,
}: {
  content: string;
  pendingImages: GroupStudyPendingDescriptionImage[] | undefined;
}): SerializedGroupStudyDescription => {
  const normalizedContent = normalizeMarkdownContent(content);
  if (!normalizedContent || !pendingImages || pendingImages.length === 0) {
    return {
      description: escapeAtSymbols(normalizedContent),
      pendingUploads: [],
    };
  }

  const pendingImageMap = new Map(
    pendingImages.map((image) => [image.objectUrl, image] as const),
  );
  const pendingUploads: GroupStudyPendingDescriptionImage[] = [];
  let nextDescription = normalizedContent;

  for (const imageUrl of extractHtmlImageUrls(normalizedContent)) {
    const pendingImage = pendingImageMap.get(imageUrl);
    if (!pendingImage) {
      continue;
    }

    pendingUploads.push(pendingImage);
    nextDescription = replaceFirstImageSource({
      html: nextDescription,
      currentSource: imageUrl,
      nextSource: `@@${pendingImage.macroFilename}@@`,
    });
  }

  return {
    description: escapeAtSymbols(nextDescription),
    pendingUploads,
  };
};

export const hasPendingBlobImagesInGroupStudyDescription = (
  content: string,
) => {
  return extractImageUrls(content).some((imageUrl) =>
    imageUrl.startsWith('blob:'),
  );
};
