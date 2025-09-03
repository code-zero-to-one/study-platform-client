import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { cookies } from 'next/headers';
import { ApiError, isApiError } from './api-error';
import { getServerCookie } from '../lib/server-cookie';

// * server-side axios 인스턴스

// json 요청
export const axiosServerInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const onRequestServer = async (config: InternalAxiosRequestConfig) => {
  const accessToken = await getServerCookie('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

axiosServerInstance.interceptors.request.use(onRequestServer);

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
      const cookieStore = await cookies();
      cookieStore.set('accessToken', newAccessToken, {
        secure: true,
        sameSite: 'strict',
      });

      return newAccessToken;
    }

    return null;
  } catch (error) {
    alert('토큰 갱신에 실패했습니다. 다시 로그인해주세요');
    window.location.href = '/login';

    return null;
  }
};

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
// 토큰 갱신을 기다리는 요청들 저장
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processFailedQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

axiosServerInstance.interceptors.response.use(
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
        if (isRefreshing) {
          // 이미 토큰 갱신 중이면 대기열에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;

                return axiosServerInstance(originalRequest);
              }
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            processFailedQueue(null, newAccessToken);

            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              return axiosServerInstance(originalRequest);
            }
          } else {
            processFailedQueue(new Error('토큰 갱신 실패'), null);
            window.location.href = '/login';

            return Promise.reject(error);
          }
        } catch (refreshError) {
          processFailedQueue(refreshError, null);
          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          // eslint-disable-next-line require-atomic-updates
          isRefreshing = false;
        }
      }

      return Promise.reject(new ApiError(errorResponseBody));
    }

    return Promise.reject(error);
  },
);
