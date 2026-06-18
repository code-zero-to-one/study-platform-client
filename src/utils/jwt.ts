export const decodeJwt = (token: string) => {
  if (!token) return null;

  // JWT 형식 검사 (x.y.z 형태여야 함)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null; // 형식이 맞지 않으면 조용히 null 반환
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null; // 디코딩 실패 시 null 반환
  }
};
