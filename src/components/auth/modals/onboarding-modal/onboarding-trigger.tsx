'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/use-onboarding-store';

export function OnboardingTrigger(): null {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openOnboarding = useOnboardingStore((s) => s.open);

  useEffect(() => {
    if (searchParams.get('onboarding') === 'true') {
      openOnboarding();
      router.replace('/class');
    }
  }, [searchParams, openOnboarding, router]);

  return null;
}
