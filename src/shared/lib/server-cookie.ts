import { cookies } from 'next/headers';

export const getServerCookie = async (
  name: string,
): Promise<string | undefined> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(name)?.value;

  return value ?? undefined;
};

export const setServerCookie = async(
  name: string,
  value: string,
  options: { path?: string } = {},
): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(name, value, { path: '/', ...options });
};