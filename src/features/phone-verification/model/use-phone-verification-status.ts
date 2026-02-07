'use client';

import { useEffect, useMemo } from 'react';
import { useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import { useAuth } from '@/hooks/common/use-auth';
import { usePhoneVerificationStore } from './store';

/**
 * @deprecated usePhoneVerificationStore를 직접 사용하지 마세요.
 * 대신 usePhoneVerificationStatus 훅을 사용하세요.
 *
 * 이유:
 * - usePhoneVerificationStore는 localStorage 기반으로 서버 상태와 불일치할 수 있음
 * - usePhoneVerificationStatus는 서버 상태를 단일 진실 공급원으로 사용
 *
 * @see usePhoneVerificationStatus
 */
export { usePhoneVerificationStore } from './store';

/**
 * 본인인증 상태를 서버 데이터와 동기화하여 반환하는 훅
 *
 * 문제:
 * - Zustand의 localStorage 기반 상태는 다른 브라우저/기기에서의 인증 상태를 반영하지 못함
 * - localStorage가 삭제되면 인증이 풀린 것처럼 보임
 * - 다른 계정이 같은 번호로 인증하면 기존 계정의 인증이 해제되지만 클라이언트는 모름
 *
 * 해결:
 * - 서버의 userProfile.isVerified 또는 memberProfile.tel을 단일 진실 공급원으로 사용
 * - Zustand 상태는 UI 반응성을 위한 캐시로만 활용
 * - 서버 데이터로 Zustand 상태를 자동 동기화
 *
 * @param overrideMemberId - 특정 memberId로 조회할 때 사용 (선택)
 */
export function usePhoneVerificationStatus(overrideMemberId?: number) {
  const { data: authData } = useAuth();
  const memberId = overrideMemberId ?? authData?.memberId ?? null;

  const { data: userProfile, isLoading: isProfileLoading } =
    useUserProfileQuery(memberId ?? 0);

  const {
    isVerified: zustandIsVerified,
    phoneNumber: zustandPhoneNumber,
    setVerified,
    reset,
  } = usePhoneVerificationStore();

  // 서버 데이터 기반 인증 상태 계산
  const serverIsVerified = userProfile?.isVerified ?? false;
  const serverPhoneNumber = userProfile?.memberProfile?.tel ?? null;

  // 서버 데이터를 우선시하여 최종 인증 상태 결정
  // 서버에 tel이 있으면 인증된 것으로 간주 (isVerified보다 tel 존재 여부가 더 확실한 지표)
  const isVerified = useMemo(() => {
    // 프로필 로딩 중일 때는 Zustand 상태를 임시로 사용 (UI 깜빡임 방지)
    if (isProfileLoading && !userProfile) {
      return zustandIsVerified;
    }

    // 서버에 전화번호가 있으면 인증 완료
    if (serverPhoneNumber) {
      return true;
    }

    // 서버의 isVerified 플래그 확인
    if (serverIsVerified) {
      return true;
    }

    // 서버 데이터가 없으면 미인증
    return false;
  }, [
    isProfileLoading,
    userProfile,
    zustandIsVerified,
    serverPhoneNumber,
    serverIsVerified,
  ]);

  const phoneNumber = useMemo(() => {
    if (isProfileLoading && !userProfile) {
      return zustandPhoneNumber;
    }

    return serverPhoneNumber ?? null;
  }, [isProfileLoading, userProfile, zustandPhoneNumber, serverPhoneNumber]);

  // 서버 데이터와 Zustand 상태 동기화
  useEffect(() => {
    if (isProfileLoading || !userProfile) return;

    if (serverPhoneNumber) {
      // 서버에 전화번호가 있으면 Zustand도 동기화
      if (!zustandIsVerified || zustandPhoneNumber !== serverPhoneNumber) {
        setVerified(serverPhoneNumber);
      }
    } else if (!serverIsVerified) {
      // 서버에서 인증이 해제되었으면 Zustand도 초기화
      if (zustandIsVerified) {
        reset();
      }
    }
  }, [
    isProfileLoading,
    userProfile,
    serverPhoneNumber,
    serverIsVerified,
    zustandIsVerified,
    zustandPhoneNumber,
    setVerified,
    reset,
  ]);

  return {
    isVerified,
    phoneNumber,
    isLoading: isProfileLoading,
    // 원본 상태들 (디버깅용)
    _serverIsVerified: serverIsVerified,
    _serverPhoneNumber: serverPhoneNumber,
    _zustandIsVerified: zustandIsVerified,
    _zustandPhoneNumber: zustandPhoneNumber,
    // Zustand 액션 (인증 완료 시 호출용)
    setVerified,
    reset,
  };
}
