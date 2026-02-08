'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import { useAuthReady } from '@/hooks/common/use-auth';
// 내부 구현에서는 store 직접 사용 허용 (서버 상태와 동기화 목적)
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

interface UsePhoneVerificationStatusReturn {
  /** 서버 기준 인증 여부 (로딩 중에만 로컬 캐시 fallback) */
  isVerified: boolean;
  /** 인증된 전화번호 */
  phoneNumber: string | null;
  /** 프로필 쿼리/스토어 하이드레이션 대기 여부 */
  isLoading: boolean;
  /** 프로필 쿼리 실패 여부 */
  isError: boolean;
  /** 인증 완료 시 스토어 즉시 업데이트용 */
  setVerified: (phoneNumber: string) => void;
}

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
 * - memberId 변경(계정 전환) 시 로컬 스토어 자동 리셋
 *
 * 사용법:
 * ```tsx
 * const { isVerified, isLoading, isError, setVerified } = usePhoneVerificationStatus(memberId);
 *
 * // 로딩 중 처리
 * if (isLoading) return <Spinner />;
 *
 * // 에러 처리
 * if (isError) return <ErrorMessage />;
 *
 * // 인증 여부에 따른 UI
 * if (!isVerified) {
 *   return <PhoneVerificationModal onComplete={setVerified} />;
 * }
 *
 * // 인증 완료 후 동작
 * return <ProtectedContent />;
 * ```
 *
 * @param overrideMemberId - 특정 memberId로 조회할 때 사용 (선택). 미지정 시 현재 로그인 유저
 */
export function usePhoneVerificationStatus(
  overrideMemberId?: number,
): UsePhoneVerificationStatusReturn {
  const { memberId: authMemberId } = useAuthReady();
  const memberId = overrideMemberId ?? authMemberId ?? null;

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    isSuccess: isProfileSuccess,
  } = useUserProfileQuery(memberId ?? 0);

  const store = usePhoneVerificationStore();

  // 서버 데이터 기반 인증 상태 계산
  const serverHasIsVerified = typeof userProfile?.isVerified === 'boolean';
  const serverIsVerified = serverHasIsVerified
    ? userProfile!.isVerified
    : false;
  const serverPhoneNumber = userProfile?.memberProfile?.tel ?? null;

  // 스토어가 현재 유저 소유인지 확인 (계정 전환 대응)
  const storeMatchesUser = memberId !== null && store.memberId === memberId;
  const canUseStoreVerified =
    storeMatchesUser && store.hasHydrated && store.isVerified;
  const hasServerProfile = isProfileSuccess && !!userProfile;

  // 서버 데이터를 우선시하여 최종 인증 상태 결정
  // 서버에 tel이 있으면 인증된 것으로 간주 (isVerified보다 tel 존재 여부가 더 확실한 지표)
  const resolvedServerIsVerified = serverHasIsVerified
    ? serverIsVerified
    : !!serverPhoneNumber;

  // 프로필 로딩 중일 때는 Zustand 상태를 임시로 사용 (UI 깜빡임 방지)
  const isLoading =
    !!memberId && !isProfileError && !hasServerProfile && !canUseStoreVerified;

  const isVerified = useMemo(() => {
    // 비로그인 상태
    if (!memberId) return false;

    // 서버 데이터 도착 → 서버 기준 (단일 진실 공급원)
    if (hasServerProfile) {
      return resolvedServerIsVerified;
    }

    // 로딩 중 → 같은 유저의 인증 완료 캐시만 fallback (UI 깜빡임 방지)
    return canUseStoreVerified;
  }, [
    memberId,
    hasServerProfile,
    resolvedServerIsVerified,
    canUseStoreVerified,
  ]);

  const phoneNumber = useMemo(() => {
    if (!memberId) return null;

    // 서버 데이터 우선
    if (hasServerProfile) {
      return serverPhoneNumber;
    }

    // 로딩 중 캐시 fallback
    return canUseStoreVerified ? store.phoneNumber : null;
  }, [
    memberId,
    hasServerProfile,
    serverPhoneNumber,
    canUseStoreVerified,
    store.phoneNumber,
  ]);

  // 서버 → 스토어 동기화
  useEffect(() => {
    if (isProfileLoading || !userProfile || !memberId) return;

    const current = usePhoneVerificationStore.getState();

    if (resolvedServerIsVerified) {
      // 서버가 인증됨 → 스토어 갱신 (memberId 포함)
      if (
        !current.isVerified ||
        current.memberId !== memberId ||
        current.phoneNumber !== serverPhoneNumber
      ) {
        store.setVerified(serverPhoneNumber ?? '', memberId);
      }
    } else {
      // 서버가 미인증 → 같은 유저 캐시 제거
      if (current.isVerified && current.memberId === memberId) {
        store.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isProfileLoading,
    userProfile,
    memberId,
    serverIsVerified,
    serverPhoneNumber,
    resolvedServerIsVerified,
  ]);

  // memberId 변경(계정 전환 / 로그아웃) 시 스토어 리셋
  const prevMemberIdRef = useRef(memberId);
  useEffect(() => {
    const prev = prevMemberIdRef.current;
    prevMemberIdRef.current = memberId;

    if (prev !== null && prev !== memberId) {
      store.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  // 인증 완료 시 호출 — memberId를 자동 주입
  const setVerified = useCallback(
    (phone: string) => {
      store.setVerified(phone, memberId ?? undefined);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memberId],
  );

  return {
    isVerified,
    phoneNumber,
    isLoading,
    isError: isProfileError,
    setVerified,
  };
}
