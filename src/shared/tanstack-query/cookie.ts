interface CookieOptions {
    path?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    maxAge?: number;
    httpOnly?: boolean;
  }
  
  // 쿠키 설정
  export const setCookie = (
    name: string,
    value: string,
    options: CookieOptions = {},
  ): void => {
    const {
      path = '/',
      secure = true,
      sameSite = 'Strict',
      maxAge = 86400, // 1일
      httpOnly = false,
    } = options;
  
    const cookie = [
      `${name}=${encodeURIComponent(value)}`,
      `path=${path}`,
      `max-age=${maxAge}`,
      secure ? 'secure' : '',
      `samesite=${sameSite}`,
      httpOnly ? 'httponly' : '',
    ]
      .filter(Boolean)
      .join('; ');
  
    document.cookie = cookie;
  };
  
  // 쿠키 조회
  export const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    }
  
    return undefined;
  };
  
  // 쿠키 삭제
  export const deleteCookie = (name: string, path = '/'): void => {
    setCookie(name, '', {
      path,
      maxAge: -1,
    });
  };
  
  // 사용자 세션 초기화
  export const clearUserSession = (): void => {
    ['memberId', 'userName', 'profileImage', 'accessToken'].forEach(
      (cookieName) => {
        deleteCookie(cookieName);
      },
    );
  };