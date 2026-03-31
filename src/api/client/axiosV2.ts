import axios from 'axios';
import { attachApiLogger } from './api-logger';
import {
  attachAccessTokenToRequest,
  createClientAuthResponseRejectedHandler,
} from './auth-response-interceptor';

// * client-side axios 인스턴스 - openapi에 사용될 용도 (openapi로 전환 완료하면 axiosInstance로 변경)

// json 요청
export const axiosInstanceV2 = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// multipart 요청용
export const axiosInstanceForMultipartV2 = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  timeout: 10000,
  headers: {
    // JS에서 formData 를 넘길땐 Content-Type 생략해야 자동으로 multipart/form-data + boundary 설정됨
  },
});

attachApiLogger(axiosInstanceV2, 'client-v2-json');
attachApiLogger(axiosInstanceForMultipartV2, 'client-v2-multipart');

axiosInstanceV2.interceptors.request.use(attachAccessTokenToRequest);
axiosInstanceForMultipartV2.interceptors.request.use(
  attachAccessTokenToRequest,
);

axiosInstanceV2.interceptors.response.use(
  (config) => config,
  createClientAuthResponseRejectedHandler((requestConfig) =>
    axiosInstanceV2(requestConfig),
  ),
);

// multipart 요청용 인터셉터도 동일하게 적용
axiosInstanceForMultipartV2.interceptors.response.use(
  (config) => config,
  createClientAuthResponseRejectedHandler((requestConfig) =>
    axiosInstanceForMultipartV2(requestConfig),
  ),
);
