import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { ApiError, isApiError } from './api-error';
import { attachApiLogger } from './api-logger';
import { getCookie, setCookie } from './cookie';

// * client-side axios 인스턴스

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

attachApiLogger(axiosInstance, 'client-json');
attachApiLogger(axiosInstanceForMultipart, 'client-multipart');

const onRequestClient = (config: InternalAxiosRequestConfig) => {
  const accessToken = getCookie('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

axiosInstance.interceptors.request.use(onRequestClient);
axiosInstanceForMultipart.interceptors.request.use(onRequestClient);

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
  } catch {
    window.location.href = '/login';

    return null;
  }
};

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
// 토큰 갱신을 기다리는 요청들 저장
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processFailedQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error !== undefined) {
      reject(error);
    } else {
      resolve(token ?? '');
    }
  });

  failedQueue = [];
};

const hasAuthToken = (requestConfig?: InternalAxiosRequestConfig) => {
  const accessToken = getCookie('accessToken');
  if (accessToken) {
    return true;
  }

  const authorizationHeader = requestConfig?.headers?.Authorization;
  if (Array.isArray(authorizationHeader)) {
    return authorizationHeader.length > 0;
  }

  return Boolean(authorizationHeader);
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
        // 로그아웃 직후/비회원 요청처럼 인증 정보가 없는 경우에는 재발급 시도를 하지 않음
        if (!hasAuthToken(originalRequest)) {
          return Promise.reject(new ApiError(errorResponseBody));
        }

        if (isRefreshing) {
          // 이미 토큰 갱신 중이면 대기열에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;

                return axiosInstance(originalRequest);
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
            processFailedQueue(undefined, newAccessToken);

            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              return axiosInstance(originalRequest);
            }
          } else {
            processFailedQueue(new Error('토큰 갱신 실패'));
            window.location.href = '/login';

            return Promise.reject(error);
          }
        } catch (refreshError) {
          processFailedQueue(refreshError);
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
        // 로그아웃 직후/비회원 요청처럼 인증 정보가 없는 경우에는 재발급 시도를 하지 않음
        if (!hasAuthToken(originalRequest)) {
          return Promise.reject(new ApiError(errorResponseBody));
        }

        if (isRefreshing) {
          // 이미 토큰 갱신 중이면 대기열에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;

                return axiosInstance(originalRequest);
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
            processFailedQueue(undefined, newAccessToken);

            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              return axiosInstance(originalRequest);
            }
          } else {
            processFailedQueue(new Error('토큰 갱신 실패'));
            window.location.href = '/login';

            return Promise.reject(error);
          }
        } catch (refreshError) {
          processFailedQueue(refreshError);
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
