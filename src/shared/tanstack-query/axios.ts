import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { ApiError, isApiError } from './api-error';
import { getCookie } from './cookie';

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

const onResponseErrorClient = async (error: unknown) => {
  if (isAxiosError(error) && error.response) {
    const errorResponseBody = error.response.data;

    if (isApiError(errorResponseBody)) {
      const accessToken = getCookie('accessToken');

      // 유효하지 않은 accessToken인 경우, 재발급
      if (accessToken && errorResponseBody.errorCode === 'AUTH001') {
        // refresh accessToken
      }

      throw new ApiError(errorResponseBody);
    }
  }
};

axiosInstance.interceptors.response.use(
  (config) => config,
  onResponseErrorClient,
);
