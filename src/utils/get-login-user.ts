import axios from 'axios';
import { redirect } from 'next/navigation';
import { getServerCookie, setServerCookie } from './server-cookie';

export async function getLoginUserId(): Promise<number | undefined> {
  // memberId 쿠키 우선 확인 (기존 로직)
  const memberIdStr = await getServerCookie('memberId');
  if (!memberIdStr) return null;

  const memberId = Number(memberIdStr);
  if (isNaN(memberId) || memberId <= 0) return null;

  /*
    이하 accessToken 최신화를 위한 로직 
  */

  // 1. accessToken 쿠키 확인
  let accessToken = await getServerCookie('accessToken');
  if (!accessToken) return null;

  // 2. accessToken으로 /auth/me 호출
  try {
    // (SSR 이므로 useQuery 를 쓰지 않고 직접 API 호출)
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      },
    );
    // 3. memberId 쿠키와 /auth/me의 memberId가 다르면 null 반환
    if (Number(res.data.content) !== memberId) return null;

    return memberId;
  } catch (error: any) {
    // 4. 401이면 만료된 토큰이므로 토큰 갱신 시도
    if (error.response?.status === 401) {
      try {
        const refreshRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/access-token/refresh`,
          { withCredentials: true },
        );
        accessToken = refreshRes.data.accessToken;
        // 5. SSR에서 최신화된 AccessToken을 쿠키등록
        await setServerCookie('accessToken', accessToken, { path: '/' });

        // 6. 갱신된 토큰으로 다시 /auth/me 호출
        const res2 = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          },
        );
        if (Number(res2.data.memberId) !== memberId) return null;

        return memberId;
      } catch (refreshError) {
        // 갱신 실패 → 랜딩 페이지로 리다이렉트
        redirect('/');
      }
    } else {
      // 기타 에러 → 랜딩 페이지로 리다이렉트
      redirect('/');
    }
  }
}
