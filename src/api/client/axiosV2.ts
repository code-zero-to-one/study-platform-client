import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { ApiError, isApiError } from './api-error';
import { getCookie, setCookie } from './cookie';

// * client-side axios 인스턴스 - openapi에 사용될 용도 (openapi로 전환 완료하면 axiosInstance로 변경)

// json 요청
export const axiosInstanceV2 = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// multipart 요청용
export const axiosInstanceForMultipartV2 = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
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

axiosInstanceV2.interceptors.request.use(onRequestClient);
axiosInstanceForMultipartV2.interceptors.request.use(onRequestClient);

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

axiosInstanceV2.interceptors.response.use(
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

                return axiosInstanceV2(originalRequest);
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

              return axiosInstanceV2(originalRequest);
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

// multipart 요청용 인터셉터도 동일하게 적용
axiosInstanceForMultipartV2.interceptors.response.use(
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

                return axiosInstanceV2(originalRequest);
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

              return axiosInstanceV2(originalRequest);
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
