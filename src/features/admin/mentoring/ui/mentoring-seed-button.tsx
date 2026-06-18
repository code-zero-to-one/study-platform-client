'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import {
  ADMIN_MENTORING_MOCK_SEED_TAG,
  createServerLikeMentorRegistrationValues,
} from '@/features/admin/mentoring/model/mock-seed';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { isMentoringAdminMockEnabled } from '@/features/mentoring/model/mentoring-feature-flag';
import { useMentorDirectoryStore } from '@/stores/use-mentor-directory-store';
import { useMentorOperationStore } from '@/stores/use-mentor-operation-store';
import { useMentorScreeningStore } from '@/stores/use-mentor-screening-store';
import { useMentoringManagementStore } from '@/stores/use-mentoring-management-store';
import { useToastStore } from '@/stores/use-toast-store';

export default function MentoringSeedButton() {
  const shouldRender = isMentoringAdminMockEnabled();
  const { memberId } = useAuthReady();
  const { showToast } = useToastStore();
  const registerMentorProfile = useMentorDirectoryStore(
    (state) => state.registerMentorProfile,
  );
  const mentorStoreHydrated = useMentorDirectoryStore(
    (state) => state.hasHydrated,
  );
  const seedMockScenario = useMentoringManagementStore(
    (state) => state.seedMockScenario,
  );
  const mentoringStoreHydrated = useMentoringManagementStore(
    (state) => state.hasHydrated,
  );
  const upsertScreeningRecord = useMentorScreeningStore(
    (state) => state.upsertRecord,
  );
  const screeningStoreHydrated = useMentorScreeningStore(
    (state) => state.hasHydrated,
  );
  const upsertOperationRecord = useMentorOperationStore(
    (state) => state.upsertRecord,
  );
  const operationStoreHydrated = useMentorOperationStore(
    (state) => state.hasHydrated,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!shouldRender) {
    return <></>;
  }

  const isStoreReady =
    mentorStoreHydrated &&
    mentoringStoreHydrated &&
    screeningStoreHydrated &&
    operationStoreHydrated;

  const handleSeed = () => {
    if (!memberId) {
      showToast(
        '로그인된 관리자 계정에서만 목데이터를 생성할 수 있습니다.',
        'error',
      );

      return;
    }

    if (!isStoreReady || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const now = dayjs();
      const nowIso = now.toISOString();
      const mentorId = registerMentorProfile(
        memberId,
        createServerLikeMentorRegistrationValues(nowIso),
      );

      seedMockScenario({
        mentorId,
        baseMenteeMemberId: memberId * 1000,
      });

      upsertScreeningRecord({
        mentorId,
        status: 'APPROVED',
        note: `${ADMIN_MENTORING_MOCK_SEED_TAG} 심사 승인 완료`,
        startedAt: now.subtract(3, 'day').toISOString(),
        startedByMemberId: memberId,
        reviewedAt: now.subtract(2, 'day').toISOString(),
        reviewedByMemberId: memberId,
      });

      upsertOperationRecord({
        mentorId,
        status: 'OPEN',
        reason: `${ADMIN_MENTORING_MOCK_SEED_TAG} 기본 운영 상태`,
        changedAt: now.subtract(2, 'day').add(3, 'hour').toISOString(),
        changedByMemberId: memberId,
      });

      showToast(
        '멘토링 목데이터 반영 완료: 등록/심사/운영/신청/일정/후기 데이터가 모두 연결되었습니다.',
        'success',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      size="small"
      color="outlined"
      onClick={handleSeed}
      disabled={!isStoreReady || isSubmitting}
    >
      {isSubmitting ? '목데이터 생성 중...' : '목데이터 넣기'}
    </Button>
  );
}
