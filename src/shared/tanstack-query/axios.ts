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
    // const token =
    //   typeof window !== 'undefined'
    //     ? localStorage.getItem('accessToken')
    //     : null;

    // 임시로 토큰 지정 후 사용
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
    // error.config에는 실패한 요청의 모든 설정(URL, 헤더, 데이터 등)이 포함
    const originalRequest = error.config;

    // 401 에러(인증 실패) 발생시 토큰 갱신 후 실패한 요청을 재시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 요청시에는 기존 인터셉터를 사용하지 않는 새로운 axios 인스턴스 사용
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
        // 토큰 갱신 실패시 로그인 페이지로 이동
        // window.location.href = '/';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("요청 헤더 확인", config.headers);

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("에러 확인", error);

    return Promise.reject(error);
  },
);