import axios from 'axios';
import { getCookie, setCookie } from './cookie';

// json 요청용
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

/*
    accessToken 은 쿠키에 저장
    refreshToken 은 HttpOnly 쿠키로 JS에서 접근 불가, 백엔드 서버와 쿠키로 통신
*/

// multipart 요청 로깅용
axiosInstanceForMultipart.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log("------------------------")
    console.log("✅ 요청주소", config.url);
    console.log("✅ 요청 Bearer", config.headers.Authorization);
    console.log("✅ 요청내용", config);

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("------------------------")
    console.log("✅ 응답주소", response.request.responseURL);    
    console.log("✅ 응답로그", response);
    
    return response;
  },

  async (error) => {
    console.log('에러 확인', error);
    console.log('에러 상태코드:', error.response?.status);

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
