import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const shouldLog = process.env.NODE_ENV !== 'production';
const shouldLogPayloads =
  shouldLog && process.env.NEXT_PUBLIC_API_LOG_PAYLOADS === 'true';
const MAX_LOG_LENGTH = 500;

const normalizeUrl = (config: InternalAxiosRequestConfig) => {
  const base = config.baseURL ?? '';
  const url = config.url ?? '';

  if (!base) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const truncate = (value: string) =>
  value.length > MAX_LOG_LENGTH
    ? `${value.slice(0, MAX_LOG_LENGTH)}...`
    : value;

const sanitizeValue = (value: unknown): unknown => {
  const seen = new WeakSet<object>();

  const walk = (input: unknown): unknown => {
    if (input === null || input === undefined) return input;

    if (typeof input === 'string') return truncate(input);
    if (typeof input === 'number' || typeof input === 'boolean') return input;
    if (typeof input === 'bigint') return truncate(input.toString());

    if (Array.isArray(input)) {
      return input.slice(0, 50).map((item) => walk(item));
    }

    if (typeof input === 'object') {
      const obj = input as object;
      if (seen.has(obj)) return '[Circular]';
      seen.add(obj);

      const entries = Object.entries(obj as Record<string, unknown>);

      return Object.fromEntries(entries.map(([key, val]) => [key, walk(val)]));
    }

    return truncate(String(input));
  };

  return walk(value);
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(sanitizeValue(value));
  } catch {
    return truncate(String(value));
  }
};

const stringifyParams = (params: InternalAxiosRequestConfig['params']) => {
  if (!params) return '';

  return safeStringify(params);
};

const stringifyData = (data: unknown) => {
  if (data === undefined) return '';
  if (typeof data === 'string') return truncate(data);

  return safeStringify(data);
};

export const attachApiLogger = (instance: AxiosInstance, label: string) => {
  if (!shouldLog) return;

  instance.interceptors.request.use((config) => {
    const method = (config.method || 'get').toUpperCase();
    const url = normalizeUrl(config);
    const params = shouldLogPayloads ? stringifyParams(config.params) : '';

    console.log(
      `[API ${label}] ${method} ${url}${params ? ` params=${params}` : ''}`,
    );

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const method = (response.config.method || 'get').toUpperCase();
      const url = normalizeUrl(response.config);
      const data = shouldLogPayloads ? stringifyData(response.data) : '';

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
      const data = shouldLogPayloads ? stringifyData(error.response?.data) : '';

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
