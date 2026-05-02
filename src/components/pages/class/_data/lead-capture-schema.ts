import { z } from 'zod';

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

const formatPhoneCanonical = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return raw;
};

export const LeadCaptureSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, '전화번호를 입력해주세요.')
    .regex(PHONE_REGEX, "'010-1234-5678' 형식으로 입력해주세요.")
    .transform(formatPhoneCanonical),
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 주소를 입력해주세요.'),
  consent: z.boolean().refine((value) => value === true, {
    message: '오픈 알림을 받으려면 정보 수집에 동의해주세요.',
  }),
});

export type LeadCaptureInput = z.input<typeof LeadCaptureSchema>;
export type LeadCaptureValues = z.output<typeof LeadCaptureSchema>;

export const formatPhoneOnInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};
