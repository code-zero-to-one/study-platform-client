// 브라우저(클라이언트)에서 memberId를 해싱하는 함수
export async function hashValue(value: string) {
  const encoder = new TextEncoder();
  const encodedValue = encoder.encode(value.trim()); // value를 UTF-8로 인코딩
  const hash = window.crypto.subtle.digest('SHA-256', encodedValue); // SHA-256 해싱

  return hash.then((hash) => {
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });
}
