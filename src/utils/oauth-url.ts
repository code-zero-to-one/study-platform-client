export type AuthProvider = 'kakao' | 'google';

export const getOAuthUrl = (provider: AuthProvider): string => {
  const state = encodeURIComponent(window.location.origin);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (provider === 'kakao') {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;

    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/v1/auth/kakao/redirect-uri&response_type=code&state=${state}`;
  }

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=${API_BASE_URL}/api/v1/auth/google/redirect-uri&client_id=${GOOGLE_CLIENT_ID}&state=${state}`;
};
