import axios, { isAxiosError } from 'axios';
import { ApiError, isApiError } from './api-error';

// * 인증하지 않는 axios 인스턴스
export const axiosAllInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosAllInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      isAxiosError(error) &&
      isApiError(error.response.data)
    ) {
      throw new ApiError(error.response.data);
    }

    return Promise.reject(error);
  },
);
