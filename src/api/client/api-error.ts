class ApiError extends Error {
  public name = 'ApiError';
  public statusCode: number;
  public errorCode: string;
  public errorName: string;
  public message: string;

  public constructor({
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
