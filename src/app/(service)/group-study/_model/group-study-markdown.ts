'use client';

import type { GroupStudyPendingDescriptionImage } from '@/types/schemas/group-study-form.schema';
import {
  extractImageUrls,
  extractHtmlImageUrls,
  getFileExtension,
} from '@/utils/markdown-content-images';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
import {
  replaceFirstImageSource,
  escapeAtSymbols,
} from '@/utils/markdown-content-serialize';

export const GROUP_STUDY_MARKDOWN_MAX_IMAGE_COUNT = 3;
export const GROUP_STUDY_MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const GROUP_STUDY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
] as const;

export interface SerializedGroupStudyDescription {
  description: string;
  pendingUploads: GroupStudyPendingDescriptionImage[];
}

/**
 * 브라우저 환경에서 사용할 수 있는 crypto.randomUUID()를 우선 사용하고,
 * 사용할 수 없는 환경에서는 Date.now()와 Math.random()을 조합하여 랜덤 ID를 생성합니다.
 *
 * @returns 고유한 랜덤 ID 문자열
 *
 * @example
 * const id = createRandomId();
 * // "550e8400-e29b-41d4-a716-446655440000" (crypto.randomUUID 사용 시)
 * // "1640995200000-abc123def" (폴백 사용 시)
 */
const createRandomId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * 사용자가 업로드한 파일로부터 그룹 스터디 설명용 펜딩 이미지 객체를 생성합니다.
 * 파일의 확장자를 추출하고, 랜덤 ID를 부여하여 매크로 파일명을 생성합니다.
 *
 * @param file - 사용자가 업로드한 이미지 파일
 * @returns 그룹 스터디 펜딩 이미지 객체
 *
 * @example
 * const file = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
 * const pendingImage = createGroupStudyPendingDescriptionImage(file);
 * // 결과:
 * // {
 * //   file: File,
 * //   objectUrl: "blob:http://localhost:3000/abc123-def456",
 * //   macroFilename: "550e8400-e29b-41d4-a716-446655440000.jpg"
 * // }
 */
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

/**
 * 그룹 스터디 설명을 서버 요청용으로 직렬화합니다.
 * Markdown 콘텐츠를 정규화하고, blob URL을 매크로 파일명으로 변환하며,
 * @ 기호를 이스케이프 처리합니다.
 *
 * @param content - 원본 Markdown 콘텐츠
 * @param pendingImages - 업로드 대기 중인 이미지들 (선택적)
 * @returns 서버 요청용 직렬화된 설명 객체
 *
 * @example
 * const content = '# Study Group\n![alt](blob:http://localhost:3000/abc123)';
 * const pendingImages = [{
 *   file: new File(['data'], 'image.png'),
 *   objectUrl: 'blob:http://localhost:3000/abc123',
 *   macroFilename: 'random-id.png'
 * }];
 *
 * const result = serializeGroupStudyDescriptionForRequest({
 *   content,
 *   pendingImages
 * });
 * // 결과:
 * // {
 * //   description: '# Study Group\n![alt](@@random-id.png@@)',
 * //   pendingUploads: [pendingImage]
 * // }
 */
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

/**
 * 그룹 스터디 설명 콘텐츠에 blob URL로 된 이미지가 있는지 확인합니다.
 * blob URL이 있으면 아직 서버에 업로드되지 않은 로컬 이미지가 있다는 의미입니다.
 *
 * @param content - 확인할 Markdown 콘텐츠
 * @returns blob URL 이미지가 하나라도 있으면 true, 없으면 false
 *
 * @example
 * const content1 = '# Study\n![img](blob:http://localhost:3000/abc123)';
 * const hasBlob1 = hasPendingBlobImagesInGroupStudyDescription(content1);
 * // 결과: true
 *
 * @example
 * const content2 = '# Study\n![img](https://example.com/image.png)';
 * const hasBlob2 = hasPendingBlobImagesInGroupStudyDescription(content2);
 * // 결과: false
 */
export const hasPendingBlobImagesInGroupStudyDescription = (
  content: string,
) => {
  return extractImageUrls(content).some((imageUrl) =>
    imageUrl.startsWith('blob:'),
  );
};
