import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const shouldLog = process.env.NODE_ENV !== 'production';

const normalizeUrl = (config: InternalAxiosRequestConfig) => {
  const base = config.baseURL ?? '';
  const url = config.url ?? '';

  if (!base) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const stringifyParams = (params: InternalAxiosRequestConfig['params']) => {
  if (!params) return '';

  try {
    return JSON.stringify(params);
  } catch {
    return '';
  }
};

const stringifyData = (data: unknown) => {
  if (data === undefined) return '';

  if (typeof data === 'string') return data;

  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
};

export const attachApiLogger = (instance: AxiosInstance, label: string) => {
  if (!shouldLog) return;

  instance.interceptors.request.use((config) => {
    const method = (config.method || 'get').toUpperCase();
    const url = normalizeUrl(config);
    const params = stringifyParams(config.params);

    console.log(
      `[API ${label}] ${method} ${url}${params ? ` params=${params}` : ''}`,
    );

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const method = (response.config.method || 'get').toUpperCase();
      const url = normalizeUrl(response.config);
      const data = stringifyData(response.data);

      console.log(`[API ${label}] ${method} ${url} -> ${response.status}`);
      if (data) {
        console.log(`[API ${label}] response=${data}`);
      }

      return response;
    },
    (error: AxiosError) => {
      const config = error.config;
      const method = config?.method?.toUpperCase() || 'UNKNOWN';
      const url = config ? normalizeUrl(config) : 'unknown';
      const status = error.response?.status;
      const data = stringifyData(error.response?.data);

      console.log(
        `[API ${label}] ${method} ${url} -> ERROR${status ? ` ${status}` : ''}`,
      );
      if (data) {
        console.log(`[API ${label}] response=${data}`);
      }

      return Promise.reject(error);
    },
  );
};
