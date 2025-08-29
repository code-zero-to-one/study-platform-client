import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { isApiError } from './api-error';
import { getCookie, setCookie } from './cookie';

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

const ERROR_MESSAGES = {
  MEM001: '유효하지 않은 입력입니다.',
  MEM002: '회원 정보가 존재하지 않습니다.',
  MEM003: '이미 가입된 회원입니다.',
  MEM004: '아직 스터디를 신청하지 않았습니다.',
  MPR001: '관심사가 중복됐습니다.',
  MPF001: '현재 프로젝트 에서 지원 하는 기능이 아닙니다.',
};

axiosInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    if (isAxiosError(error) && error.response) {
      const errorResponseBody = error.response.data;

      if (isApiError(errorResponseBody)) {
        const accessToken = getCookie('accessToken');

        const originalRequest = error.config;

        // 유효하지 않은 accessToken인 경우, 재발급
        if (accessToken && errorResponseBody.errorCode === 'AUTH001') {
        }

        if (errorResponseBody.errorCode in ERROR_MESSAGES) {
          alert(
            ERROR_MESSAGES[
              errorResponseBody.errorCode as keyof typeof ERROR_MESSAGES
            ],
          );
        }
      }
    }
  },
);
