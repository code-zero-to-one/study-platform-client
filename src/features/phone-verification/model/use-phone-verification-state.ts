'use client';

import { useState, useCallback } from 'react';

export interface PhoneVerificationState {
  isVerified: boolean;
  phoneNumber: string | null;
  verifiedAt: Date | null;
}

export function usePhoneVerificationState(initialState?: Partial<PhoneVerificationState>) {
  const [state, setState] = useState<PhoneVerificationState>({
    isVerified: initialState?.isVerified ?? false,
    phoneNumber: initialState?.phoneNumber ?? null,
    verifiedAt: initialState?.verifiedAt ?? null,
  });

  const setVerified = useCallback((phoneNumber: string) => {
    setState({
      isVerified: true,
      phoneNumber,
      verifiedAt: new Date(),
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isVerified: false,
      phoneNumber: null,
      verifiedAt: null,
    });
  }, []);

  return {
    ...state,
    setVerified,
    reset,
  };
}

