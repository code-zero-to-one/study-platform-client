import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { ApiError, isApiError } from './api-error';
import { getServerCookie } from '../lib/server-cookie';

// * 인증이 필요한 server-side axios 인스턴스

// json 요청
export const axiosServerInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const onRequestServer = async (config: InternalAxiosRequestConfig) => {
  const accessToken = await getServerCookie('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

axiosServerInstance.interceptors.request.use(onRequestServer);

const onResponseErrorServer = async (error: unknown) => {
  if (isAxiosError(error) && error.response) {
    const errorResponseBody = error.response.data;

    if (isApiError(errorResponseBody)) {
      const accessToken = await getServerCookie('accessToken');

      // 유효하지 않은 accessToken인 경우, 재발급
      if (accessToken && errorResponseBody.errorCode === 'AUTH001') {
        // refresh accessToken
      }

      throw new ApiError(errorResponseBody);
    }
  }
};

axiosServerInstance.interceptors.response.use(
  (config) => config,
  onResponseErrorServer,
);
