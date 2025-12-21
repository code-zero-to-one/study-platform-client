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
