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
  // 서버 사이드에서 쿠키 조회를 할 때 발생하는 ReferenceError: document is not defined 에러방지

  /**
    WARNING:
    기존에 존재하던 브라우저 환경 체크를 window -> document 하위로 바꿨습니다.
    Storybook 및 저희 UI / API 테스트 환경을 위해서 Auth 및 userInfo 관련 인터랙션이 필요한데,
    이 시작점이 모두 cookie 값을 가져오는 부분이라 부득이하게 교체했습니다.
    변경으로 인해서 어플리케이션 단에서 특별한 부작용은 없을 것 같고 ( RSC, SSR 호출 시 document 도 window와 같이 아직 존재하지 않습니다.)
    이를 통해,  mocking API 및 Storybook 상에서 cookie 를 미리 설정(document.setCookie)하면
    관련 API 들을 연결시켜서 테스트 하고 작동시켜볼 수 있습니다. 
   */
  if (typeof document === 'undefined') {
    return undefined;
  }
  // if (typeof window === 'undefined') {
  //   return undefined;
  // }

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
