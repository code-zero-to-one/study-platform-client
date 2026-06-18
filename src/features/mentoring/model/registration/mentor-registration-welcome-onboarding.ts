import {
  getMentorPublicReadiness,
  MENTOR_PUBLIC_READINESS_STAGES,
} from '@/features/mentoring/model/mentor-public-readiness';
import { buildWelcomeChecklist } from '@/features/mentoring/model/registration/mentor-registration-preview';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentorRegistrationWelcomeOnboardingState } from '@/types/mentoring/registration-view';

export const buildMentorRegistrationWelcomeOnboarding = ({
  mentor,
  listVisible,
}: {
  mentor: MentorProfile;
  listVisible: boolean;
}): MentorRegistrationWelcomeOnboardingState => {
  const savedPublicReadiness = getMentorPublicReadiness(mentor);
  const checklist = buildWelcomeChecklist(mentor, {
    settlementAccountReady: savedPublicReadiness.isApplicationReady,
  });
  const isDetailPreparing =
    savedPublicReadiness.stage ===
    MENTOR_PUBLIC_READINESS_STAGES.detailPreparing;
  const isApplyReady =
    savedPublicReadiness.stage === MENTOR_PUBLIC_READINESS_STAGES.applyReady;

  return {
    mentorId: mentor.id,
    title: isApplyReady
      ? '저장은 완료되었고 신청 가능 상태로 반영됩니다'
      : isDetailPreparing
        ? '저장은 완료되었지만 공개 준비가 더 필요합니다'
        : '✅ 저장은 완료되었고 상세 공개 준비 상태로 반영됩니다',
    description: listVisible
      ? isApplyReady
        ? '목록 공개가 켜져 있으며 저장된 멘토링 정보가 신청 가능 상태로 반영됩니다.'
        : isDetailPreparing
          ? '현재 목록 공개는 켜져 있지만, 멘토 소개를 포함한 공개 정보를 더 입력해야 상세 공개 기준을 충족할 수 있습니다.'
          : '현재 저장 상태는 상세 공개 기준을 충족한 준비 단계입니다. 멘티 신청은 아직 열리지 않습니다.'
      : isApplyReady
        ? '현재 멘토링 목록 비노출 상태입니다. 목록 공개를 켜면 저장된 프로필이 신청 가능 상태로 노출됩니다.'
        : isDetailPreparing
          ? '현재 멘토링 목록 비노출 상태입니다. 공개 준비를 계속 진행한 뒤 목록 공개를 켜면 노출을 이어갈 수 있습니다.'
          : '현재 멘토링 목록 비노출 상태입니다. 목록 공개를 켜면 상세 공개 준비 상태로 노출되며, 멘티 신청은 아직 열리지 않습니다.',
    isApplicationReady: savedPublicReadiness.isApplicationReady,
    checklist,
  };
};
