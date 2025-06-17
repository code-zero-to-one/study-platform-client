import axios from 'axios';
import { getCookie, setCookie } from './cookie';

export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
    accessToken 은 쿠키에 저장
    refreshToken 은 HttpOnly 쿠키로 JS에서 접근 불가, 백엔드 서버와 쿠키로 통신
*/

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('에러 확인', error);
    console.log('에러 응답 데이터:', error.response?.data);
    console.log('에러 상태코드:', error.response?.status);
    console.log('에러 헤더:', error.response?.headers);
    console.log('에러 전체:', error.toJSON?.() ?? error);

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshApi = axios.create({
          baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
        });
        const res = await refreshApi.get('/auth/access-token/refresh');
        const newAccessToken = res.data.accessToken;

        if (newAccessToken) {
          setCookie('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        }
      } catch (err) {
        // 로그인 페이지 리다이렉트 등 처리
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
