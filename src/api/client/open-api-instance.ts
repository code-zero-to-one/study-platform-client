import { AxiosInstance } from 'axios';
import { Configuration } from '../openapi';

import { axiosInstanceV2 } from './axiosV2';
import { getCookie } from './cookie';

// OpenAPI용 Configuration
const openapiConfig = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
  accessToken: () => getCookie('accessToken') ?? undefined,
});

// API 인스턴스 생성 헬퍼
// 대부분의 경우 axiosInstance를 사용함
// axiosInstanceForMultipart가 필요한 경우는 별도 구현 필요
export const createApiInstance = <T>(
  ApiClass: new (
    config: Configuration,
    basePath?: string,
    axios?: AxiosInstance,
  ) => T,
): T => {
  return new ApiClass(openapiConfig, openapiConfig.basePath, axiosInstanceV2);
};

export const createApiServerInstance = <T>(
  ApiClass: new (
    config: Configuration,
    basePath?: string,
    axios?: AxiosInstance,
  ) => T,
): T => {
  return new ApiClass(openapiConfig, openapiConfig.basePath, axiosInstanceV2);
};
