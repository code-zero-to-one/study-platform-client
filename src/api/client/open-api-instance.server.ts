import { AxiosInstance } from 'axios';
import { Configuration } from '../openapi';

import { axiosServerInstanceV2 } from './axiosV2.server';

// OpenAPI용 Configuration (서버용)
const openapiServerConfig = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// 서버용 API 인스턴스 생성 헬퍼
export const createApiServerInstance = <T>(
  ApiClass: new (
    config: Configuration,
    basePath?: string,
    axios?: AxiosInstance,
  ) => T,
): T => {
  return new ApiClass(
    openapiServerConfig,
    openapiServerConfig.basePath,
    axiosServerInstanceV2,
  );
};
