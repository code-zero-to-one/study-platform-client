import { z } from 'zod';

// 올바른 URL인지 확인
export const isValidUrl = (v: string) => {
  try {
    return Boolean(new URL(v));
  } catch {
    return false;
  }
};

export const UrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidUrl(v), {
    message: '올바른 URL 형식이 아닙니다.',
  });
