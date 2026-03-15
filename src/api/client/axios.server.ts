import axios, { InternalAxiosRequestConfig } from 'axios';
import { readServerAccessToken } from '@/features/auth/model/server-auth-session';
import { attachApiLogger } from './api-logger';

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

attachApiLogger(axiosServerInstance, 'server-json');

const onRequestServer = async (config: InternalAxiosRequestConfig) => {
  const accessToken = await readServerAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

axiosServerInstance.interceptors.request.use(onRequestServer);

axiosServerInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    return Promise.reject(error);
  },
);
