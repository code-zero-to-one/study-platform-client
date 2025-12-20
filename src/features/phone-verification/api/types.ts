export interface SendPhoneVerificationCodeRequest {
  realName: string;
  phoneNumber: string;
}

export interface SendPhoneVerificationCodeResponse {
  success: boolean;
  message: string;
}

export interface VerifyPhoneCodeRequest {
  realName: string;
  phoneNumber: string;
  code: string;
}

export interface VerifyPhoneCodeResponse {
  success: boolean;
  message: string;
}
