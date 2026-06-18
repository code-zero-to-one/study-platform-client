type AsyncFn<T> = () => Promise<T>;

interface SafeServerPrefetchOptions {
  logLabel?: string;
}

export async function safeServerPrefetch<T>(
  fn: AsyncFn<T>,
  options: SafeServerPrefetchOptions = {},
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (options.logLabel) {
      console.warn(`${options.logLabel} failed on server.`, error);
    } else {
      console.warn('Server prefetch failed.', error);
    }

    return undefined;
  }
}
