import { extractHtmlImageUrls } from '@/utils/markdown-content-images';

type UrlKind = 'remote' | 'image' | 'data-image';

const URL_PATTERNS: Record<UrlKind, RegExp> = {
  remote: /^https?:\/\/\S+$/i,
  image: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?[^\s]*)?$/i,
  'data-image': /^data:image\/[a-z0-9.+-]+;base64,/i,
};

/**
 * URLs가 지정된 타입 선택 패턴과 일치하는지 검증합니다.
 * @param text 검증할 URL 문자열
 * @param kinds 검증할 URL 타입('remote' | 'image' | 'data-image') 또는 타입 배열. 기본값: 'remote'
 * @returns URL이 허용된 타입인지 여부
 * @example
 * isAllowedUrl('https://example.com/image.jpg', 'image') // true
 * isAllowedUrl('https://example.com', ['remote', 'image']) // true
 * isAllowedUrl('data:image/png;base64,iVBOR...', 'data-image') // true
 */
const isAllowedUrl = (text: string, kinds: UrlKind | UrlKind[] = 'remote') => {
  const targets = Array.isArray(kinds) ? kinds : [kinds];

  return targets.some((kind) => URL_PATTERNS[kind].test(text.trim()));
};

/**
 * 클립보드에서 이미지 파일들을 추출합니다.
 * 먼저 직접적인 이미지 파일을 확인하고, 없으면 DataTransferItem API를 통해 추출합니다.
 * @param clipboardData 클립보드 데이터
 * @returns 추출된 이미지 File 객체의 배열
 * @example
 * const files = extractClipboardImageFiles(event.clipboardData)
 * // Ctrl+V로 이미지를 붙여넣으면 File 객체 배열 반환
 */
export const extractClipboardImageFiles = (
  clipboardData: DataTransfer,
): File[] => {
  const clipboardFiles = Array.from(clipboardData.files);
  const directImageFiles = clipboardFiles.filter((file) =>
    file.type.startsWith('image/'),
  );

  if (directImageFiles.length > 0) return directImageFiles;

  const clipboardItems = Array.from(clipboardData.items);
  const imageFileItems = clipboardItems.filter(
    (item) => item.kind === 'file' && item.type.startsWith('image/'),
  );
  const imageFiles = imageFileItems
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);

  return imageFiles;
};

/**
 * 클립보드에서 이미지 소스(URL 또는 Base64)를 추출합니다.
 * HTML 형식의 클립보드 데이터에서 <img> 태그의 src를 우선 추출하고,
 * 없으면 평문 텍스트의 이미지 URL을 추출합니다.
 * @param clipboardData 클립보드 데이터
 * @returns 추출된 이미지 URL 또는 Data URI, 없으면 빈 문자열
 * @example
 * const imageUrl = extractClipboardImageSource(event.clipboardData)
 * // 웹페이지에서 복사한 <img src="https://example.com/image.jpg"> 반환
 */
export const extractClipboardImageSource = (clipboardData: DataTransfer) => {
  const pastedHtml = clipboardData.getData('text/html').trim();
  if (pastedHtml) {
    const imageSource = extractHtmlImageUrls(pastedHtml)[0]?.trim();

    if (imageSource && isAllowedUrl(imageSource, ['remote', 'data-image'])) {
      return imageSource;
    }
  }

  const pastedText = clipboardData.getData('text/plain').trim();
  if (pastedText && isAllowedUrl(pastedText, ['image', 'data-image']))
    return pastedText;

  return '';
};

/**
 * 클립보드 데이터에 이미지가 포함되어 있는지 확인합니다.
 * 직접 이미지 파일, HTML의 <img> 태그, 또는 이미지 URL 문자열을 감지합니다.
 * @param clipboardData 클립보드 데이터
 * @returns 이미지가 포함되어 있는지 여부
 * @example
 * if (hasClipboardImageHint(event.clipboardData)) {
 *   // 이미지를 처리
 * }
 */
export const hasClipboardImageHint = (clipboardData: DataTransfer) => {
  if (extractClipboardImageFiles(clipboardData).length > 0) {
    return true;
  }

  const clipboardItems = Array.from(clipboardData.items);
  const hasHtmlItem = clipboardItems.some((item) => item.type.includes('html'));
  if (hasHtmlItem) {
    return clipboardData.getData('text/html').includes('<img');
  }

  const pastedText = clipboardData.getData('text/plain').trim();

  return isAllowedUrl(pastedText, ['image', 'data-image']);
};
