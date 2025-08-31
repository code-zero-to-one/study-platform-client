import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { isApiError } from './api-error';
import { getCookie, setCookie } from './cookie';

// * 인증이 필요한 client-side axios 인스턴스

// json 요청
export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// multipart 요청용
export const axiosInstanceForMultipart = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 10000,
  headers: {
    // JS에서 formData 를 넘길땐 Content-Type 생략해야 자동으로 multipart/form-data + boundary 설정됨
  },
});

const onRequestClient = (config: InternalAxiosRequestConfig) => {
  const accessToken = getCookie('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

axiosInstance.interceptors.request.use(onRequestClient);
axiosInstanceForMultipart.interceptors.request.use(onRequestClient);

const ERROR_MESSAGES = {
  MEM001: '유효하지 않은 입력입니다.',
  MEM002: '회원 정보가 존재하지 않습니다.',
  MEM003: '이미 가입된 회원입니다.',
  MEM004: '아직 스터디를 신청하지 않았습니다.',
  MPR001: '관심사가 중복됐습니다.',
  MPF001: '현재 프로젝트 에서 지원 하는 기능이 아닙니다.',
};

// refresh token을 사용해서 access token을 재갱신하는 함수
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await axios.get<{ content: { accessToken: string } }>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/access-token/refresh`,
      {
        withCredentials: true,
      },
    );

    const newAccessToken = response.data.content.accessToken;

    if (newAccessToken) {
      setCookie('accessToken', newAccessToken);

      return newAccessToken;
    }

    return null;
  } catch (error) {
    alert('토큰 갱신에 실패했습니다. 다시 로그인해주세요');
    window.location.href = '/login';

    return null;
  }
};

axiosInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    if (
      isAxiosError(error) &&
      error.response &&
      isApiError(error.response.data)
    ) {
      // 요청이 전송되었고, 서버는 2xx 외의 상태 코드로 응답
      const errorResponseBody = error.response.data;
      const originalRequest = error.config;

      // 유효하지 않은 accessToken인 경우, 재발급
      if (errorResponseBody.errorCode === 'AUTH001') {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken && originalRequest) {
          // 새로운 access token으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } else {
          // refresh token도 만료된 경우 로그인 페이지로 리다이렉트
          window.location.href = '/login';

          return Promise.reject(error);
        }
      }

      if (errorResponseBody.errorCode in ERROR_MESSAGES) {
        alert(
          ERROR_MESSAGES[
            errorResponseBody.errorCode as keyof typeof ERROR_MESSAGES
          ],
        );
      }
    }

    return Promise.reject(error);
  },
);

// multipart 요청용 인터셉터도 동일하게 적용
axiosInstanceForMultipart.interceptors.response.use(
  (config) => config,
  async (error) => {
    if (
      isAxiosError(error) &&
      error.response &&
      isApiError(error.response.data)
    ) {
      // 요청이 전송되었고, 서버는 2xx 외의 상태 코드로 응답
      const errorResponseBody = error.response.data;
      const originalRequest = error.config;

      // 유효하지 않은 accessToken인 경우, 재발급
      if (errorResponseBody.errorCode === 'AUTH001') {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken && originalRequest) {
          // 새로운 access token으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstanceForMultipart(originalRequest);
        } else {
          // refresh token도 만료된 경우 로그인 페이지로 리다이렉트
          window.location.href = '/login';

          return Promise.reject(error);
        }
      }

      if (errorResponseBody.errorCode in ERROR_MESSAGES) {
        alert(
          ERROR_MESSAGES[
            errorResponseBody.errorCode as keyof typeof ERROR_MESSAGES
          ],
        );
      }
    }

    return Promise.reject(error);
  },
);
