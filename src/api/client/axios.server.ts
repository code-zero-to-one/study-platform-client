import axios, { InternalAxiosRequestConfig } from 'axios';
import { getServerCookie } from '../../utils/server-cookie';

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

axiosServerInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    return Promise.reject(error);
  },
);
