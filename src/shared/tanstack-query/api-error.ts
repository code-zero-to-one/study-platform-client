class ApiError extends Error {
  name = 'ApiError';
  statusCode: number;
  errorCode: string;
  errorName: string;
  message: string;

  constructor({
    statusCode,
    errorCode,
    errorName,
    message,
  }: {
    statusCode: number;
    errorCode: string;
    errorName: string;
    message: string;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorName = errorName;
    this.message = message;
  }
}

// API 에러인지 확인하는 함수
const isApiError = (error: unknown): error is ApiError => {
  return (
    error instanceof ApiError ||
    (typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      'errorCode' in error &&
      'errorName' in error &&
      'message' in error)
  );
};

export { ApiError, isApiError };
