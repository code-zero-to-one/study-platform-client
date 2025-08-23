import { z } from 'zod';

// 올바른 URL인지 확인
export const isValidUrl = (v: string) => {
  try {
    const _ = new URL(v);

    return true;
  } catch {
    return false;
  }
};

export const UrlSchema = z.string().trim().refine(isValidUrl, {
  message: '올바른 URL 형식이 아닙니다.',
});
