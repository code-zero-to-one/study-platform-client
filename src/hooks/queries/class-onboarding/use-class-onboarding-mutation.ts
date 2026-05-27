import { useMutation } from '@tanstack/react-query';
import {
  saveClassOnboardingComplete,
  saveClassOnboardingStep1,
  saveClassOnboardingStep2,
  saveClassOnboardingStep3,
} from '@/api/endpoints/class-onboarding/class-onboarding';

export const useClassOnboardingStep1Mutation = () =>
  useMutation({ mutationFn: saveClassOnboardingStep1 });

export const useClassOnboardingStep2Mutation = () =>
  useMutation({ mutationFn: saveClassOnboardingStep2 });

export const useClassOnboardingStep3Mutation = () =>
  useMutation({ mutationFn: saveClassOnboardingStep3 });

export const useClassOnboardingCompleteMutation = () =>
  useMutation({
    mutationFn: () =>
      saveClassOnboardingComplete({ confirmedOnboardingCompletion: true }),
  });
