/**
 * 환경 변수에서 마크다운 자산 기본 URL을 가져옵니다.
 * PROD URL이 있으면 우선 사용하고, 없으면 일반 API URL을 사용합니다.
 * @returns 정규화된 기본 URL
 * @example
 * // process.env.NEXT_PUBLIC_API_PROD_BASE_URL = 'https://api.example.com'
 * getRawMarkdownAssetBaseUrl() // 'https://api.example.com'
 */
const getRawMarkdownAssetBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_PROD_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ''
  ).trim();
};

/**
 * @@...@@ 형식의 마크다운 매크로를 풀어서 실제 값을 추출합니다.
 * 매크로 형식으로 감싸진 값을 원본 값으로 변환합니다.
 * @param value 매크로 형식이거나 일반 값
 * @returns 매크로가 풀려진 실제 값
 * @example
 * unwrapMarkdownAssetMacro('@@https://example.com/image.jpg@@') // 'https://example.com/image.jpg'
 * unwrapMarkdownAssetMacro('https://example.com/image.jpg') // 'https://example.com/image.jpg'
 * unwrapMarkdownAssetMacro('/images/file.png') // '/images/file.png'
 */
const unwrapMarkdownAssetMacro = (value: string) => {
  const trimmedValue = value.trim();
  const macroMatch = trimmedValue.match(/^@@(.+?)@@$/);

  return macroMatch?.[1]?.trim() ?? trimmedValue;
};

/**
 * 마크다운 자산 URL을 해석하고 절대 URL로 변환합니다.
 * 상대경로, 특수 프로토콜(http, https, blob, data 등), 로컬 리소스 등을 처리합니다.
 * @param value 해석할 자산 URL (매크로 형식 또는 일반 URL)
 * @param assetBaseUrl 자산 기본 URL (기본값: getRawMarkdownAssetBaseUrl 반환값에서 /api/v1 제거)
 * @returns 해석된 절대 URL 또는 원본 값
 * @example
 * // 기본 URL: 'https://api.example.com'
 * resolveMarkdownAssetUrl('/images/file.png')
 * // 'https://api.example.com/images/file.png'
 *
 * resolveMarkdownAssetUrl('images/file.png')
 * // 'https://api.example.com/images/file.png'
 *
 * resolveMarkdownAssetUrl('https://external.com/image.jpg')
 * // 'https://external.com/image.jpg' (외부 URL 그대로 반환)
 *
 * resolveMarkdownAssetUrl('@@LOCAL@@')
 * // undefined (LOCAL은 특수 값으로 처리)
 *
 * resolveMarkdownAssetUrl('blob:http://localhost/12345')
 * // 'blob:http://localhost/12345' (blob URL 그대로 반환)
 */
const PASS_THROUGH_PREFIXES = [
  'http://',
  'https://',
  'blob:',
  'data:',
  'mailto:',
  'tel:',
  '#',
] as const;

export const resolveMarkdownAssetUrl = (
  value: string,
  assetBaseUrl = getRawMarkdownAssetBaseUrl().replace(/\/api\/v1\/?$/, ''),
) => {
  const assetUrl = unwrapMarkdownAssetMacro(value);

  if (!assetUrl || assetUrl.toUpperCase() === 'LOCAL') {
    return undefined;
  }

  if (PASS_THROUGH_PREFIXES.some((prefix) => assetUrl.startsWith(prefix))) {
    return assetUrl;
  }

  if (assetUrl.match(/^\/?images\//) && assetBaseUrl) {
    return `${assetBaseUrl}/${assetUrl.replace(/^\//, '')}`;
  }

  if (assetUrl.startsWith('/')) {
    return assetUrl;
  }

  if (assetBaseUrl) {
    return `${assetBaseUrl}/${assetUrl.replace(/^\/+/, '')}`;
  }

  return assetUrl;
};
