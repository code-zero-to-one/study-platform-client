/**
 * 전화번호 포맷팅 함수
 * 숫자만 있는 전화번호를 하이픈이 포함된 형식으로 변환합니다.
 * 예: "01012345678" -> "010-1234-5678"
 */
export function formatPhoneNumber(value: string | undefined): string {
  if (!value) return '';
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * 외부 링크 포맷팅 함수
 * http:// 또는 https://로 시작하지 않는 경우 https://를 접두사로 추가합니다.
 */
export function formatExternalLink(url: string | undefined): string {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // 마침표가 있고 공백이 없는 경우에만 https:// 보정 (예: "github" → 보정 안 함)
  if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
    return `https://${trimmedUrl}`;
  }

  return trimmedUrl;
}
