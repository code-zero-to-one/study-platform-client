import axios from 'axios';
import { attachApiLogger } from './api-logger';
import {
  attachAccessTokenToRequest,
  createClientAuthResponseRejectedHandler,
} from './auth-response-interceptor';

// * client-side axios 인스턴스

// json 요청
export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// multipart 요청용
export const axiosInstanceForMultipart = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 60000, // 파일 업로드 전용 — 클라이언트→백엔드 전송 + 백엔드→S3 처리 여유
  headers: {
    // JS에서 formData 를 넘길땐 Content-Type 생략해야 자동으로 multipart/form-data + boundary 설정됨
  },
});

attachApiLogger(axiosInstance, 'client-json');
attachApiLogger(axiosInstanceForMultipart, 'client-multipart');

axiosInstance.interceptors.request.use(attachAccessTokenToRequest);
axiosInstanceForMultipart.interceptors.request.use(attachAccessTokenToRequest);

axiosInstance.interceptors.response.use(
  (config) => config,
  createClientAuthResponseRejectedHandler((requestConfig) =>
    axiosInstance(requestConfig),
  ),
);

// multipart 요청용 인터셉터도 동일하게 적용
axiosInstanceForMultipart.interceptors.response.use(
  (config) => config,
  createClientAuthResponseRejectedHandler((requestConfig) =>
    axiosInstanceForMultipart(requestConfig),
  ),
);

// v5 Class API 전용 인스턴스
export const axiosInstanceV5 = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v5/`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

attachApiLogger(axiosInstanceV5, 'client-v5-json');
axiosInstanceV5.interceptors.request.use(attachAccessTokenToRequest);
axiosInstanceV5.interceptors.response.use(
  (config) => config,
  createClientAuthResponseRejectedHandler((requestConfig) =>
    axiosInstanceV5(requestConfig),
  ),
);
