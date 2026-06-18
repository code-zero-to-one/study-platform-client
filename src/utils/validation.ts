export function isNumeric(str: string) {
  return /^\d+$/.test(str);
}

/**
 * URL 형식 검증 함수
 * 마침표가 포함되고 공백이 없는 경우에만 유효한 URL로 판단합니다.
 * http/https 프로토콜이 없으면 https://를 붙여서 URL 파싱을 시도합니다.
 */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes(' ') || !trimmed.includes('.')) return false;

  try {
    const withProtocol =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    new URL(withProtocol);

    return true;
  } catch {
    return false;
  }
}
