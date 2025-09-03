import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { isApiError } from './api-error';
import { getServerCookie } from '../lib/server-cookie';

// * 인증이 필요한 server-side axios 인스턴스

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

const onResponseErrorServer = async (error: unknown) => {
  if (
    isAxiosError(error) &&
    error.response &&
    isApiError(error.response.data)
  ) {
    const errorResponseBody = error.response.data;
    const originalRequest = error.config;

    // 서버 에러 처리
  }
};

axiosServerInstance.interceptors.response.use(
  (config) => config,
  onResponseErrorServer,
);
