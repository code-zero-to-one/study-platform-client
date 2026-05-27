import { axiosInstance } from '@/api/client/axios';
import type {
  ClassOnboardingCompleteRequest,
  ClassOnboardingStep1Request,
  ClassOnboardingStep2Request,
  ClassOnboardingStep3Request,
  ClassOnboardingStepResponse,
} from '@/types/api/class-onboarding.types';

export const saveClassOnboardingStep1 = (data: ClassOnboardingStep1Request) =>
  axiosInstance
    .post<{ content: ClassOnboardingStepResponse }>(
      '/v6/class-onboarding/me/step-1',
      data,
    )
    .then((r) => r.data);

export const saveClassOnboardingStep2 = (data: ClassOnboardingStep2Request) =>
  axiosInstance
    .post<{ content: ClassOnboardingStepResponse }>(
      '/v6/class-onboarding/me/step-2',
      data,
    )
    .then((r) => r.data);

export const saveClassOnboardingStep3 = (data: ClassOnboardingStep3Request) =>
  axiosInstance
    .post<{ content: ClassOnboardingStepResponse }>(
      '/v6/class-onboarding/me/step-3',
      data,
    )
    .then((r) => r.data);

export const saveClassOnboardingComplete = (
  data: ClassOnboardingCompleteRequest,
) =>
  axiosInstance
    .post<{ content: ClassOnboardingStepResponse }>(
      '/v6/class-onboarding/me/complete',
      data,
    )
    .then((r) => r.data);
