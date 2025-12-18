import { axiosInstance } from '@/api/client/axios';
import type {
  SendPhoneVerificationCodeRequest,
  SendPhoneVerificationCodeResponse,
  VerifyPhoneCodeRequest,
  VerifyPhoneCodeResponse,
} from './types';

/**
 * SMS 인증번호 발송
 */
export async function sendPhoneVerificationCode(
  data: SendPhoneVerificationCodeRequest,
): Promise<SendPhoneVerificationCodeResponse> {
  const res = await axiosInstance.post<{
    statusCode: number;
    timestamp: string;
    content: SendPhoneVerificationCodeResponse;
    message: string;
  }>('/auth/phone/send', data);

  return res.data.content;
}

/**
 * SMS 인증번호 검증
 */
export async function verifyPhoneCode(
  data: VerifyPhoneCodeRequest,
): Promise<VerifyPhoneCodeResponse> {
  const res = await axiosInstance.post<{
    statusCode: number;
    timestamp: string;
    content: VerifyPhoneCodeResponse;
    message: string;
  }>('/auth/phone/verify', data);

  return res.data.content;
}