import { axiosInstance } from '@/api/client/axios';
import type {
  ClassOnboardingCompleteRequest,
  ClassOnboardingStep1Request,
  ClassOnboardingStep2Request,
  ClassOnboardingStep3Request,
  ClassOnboardingStepResponse,
} from '@/types/api/class-onboarding.types';

export const saveClassOnboardingStep1 = async (
  data: ClassOnboardingStep1Request,
): Promise<ClassOnboardingStepResponse> => {
  try {
    const { data: resData } = await axiosInstance.post(
      '/v6/class-onboarding/me/step-1',
      data,
    );

    if (resData.statusCode !== 200) {
      throw new Error('Failed to save class onboarding step 1');
    }

    return resData.content;
  } catch (err) {
    console.error('Error saving class onboarding step 1:', err);
    throw err;
  }
};

export const saveClassOnboardingStep2 = async (
  data: ClassOnboardingStep2Request,
): Promise<ClassOnboardingStepResponse> => {
  try {
    const { data: resData } = await axiosInstance.post(
      '/v6/class-onboarding/me/step-2',
      data,
    );

    if (resData.statusCode !== 200) {
      throw new Error('Failed to save class onboarding step 2');
    }

    return resData.content;
  } catch (err) {
    console.error('Error saving class onboarding step 2:', err);
    throw err;
  }
};

export const saveClassOnboardingStep3 = async (
  data: ClassOnboardingStep3Request,
): Promise<ClassOnboardingStepResponse> => {
  try {
    const { data: resData } = await axiosInstance.post(
      '/v6/class-onboarding/me/step-3',
      data,
    );

    if (resData.statusCode !== 200) {
      throw new Error('Failed to save class onboarding step 3');
    }

    return resData.content;
  } catch (err) {
    console.error('Error saving class onboarding step 3:', err);
    throw err;
  }
};

export const saveClassOnboardingComplete = async (
  data: ClassOnboardingCompleteRequest,
): Promise<ClassOnboardingStepResponse> => {
  try {
    const { data: resData } = await axiosInstance.post(
      '/v6/class-onboarding/me/complete',
      data,
    );

    if (resData.statusCode !== 200) {
      throw new Error('Failed to save class onboarding complete');
    }

    return resData.content;
  } catch (err) {
    console.error('Error saving class onboarding complete:', err);
    throw err;
  }
};
