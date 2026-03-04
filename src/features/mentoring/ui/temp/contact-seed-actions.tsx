'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/ui/button';
import {
  createDefaultMentorSettings,
  createEmptyWeeklySchedule,
} from '@/features/mentoring/model/mentor-settings';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import { type MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

const buildTempMentorRegistrationValues = (): MentorRegistrationFormValues => {
  const defaults = createDefaultMentorSettings();
  const weekly = createEmptyWeeklySchedule();
  const nowIso = new Date().toISOString();

  weekly.MON = ['20:00'];
  weekly.WED = ['20:00'];

  return {
    ...defaults,
    contactPhone: '01012345678',
    contactEmail: 'mentor-temp@zeroone.dev',
    categories: ['커리어'],
    mentoringTitle: '임시 검증용 멘토링',
    jobGroup: '개발',
    jobTitle: '프론트엔드 개발자',
    careerYears: '5년 이상',
    skillTags: ['React', 'Next.js'],
    companyCategory: '창업',
    companyName: 'ZERO-ONE',
    noteEnabled: true,
    simpleEnabled: true,
    deepEnabled: true,
    offlineEnabled: false,
    schedule: {
      timezone: 'Asia/Seoul',
      slotUnitMinutes: 30,
      weekly,
    },
    detailedDescription:
      '임시 검증용으로 생성된 멘토 프로필입니다. 신청함 운영과 연락 로그를 빠르게 확인할 수 있습니다.',
    interviewQuestions: ['현재 가장 고민인 부분을 간단히 적어주세요.'],
    preNotice: '임시 검증용 사전 안내입니다.',
    settlementDraft: null,
    updatedAt: nowIso,
  };
};

export default function ContactSeedActions() {
  const router = useRouter();
  const { memberId } = useAuthReady();
  const { showToast } = useToastStore();
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const registerMentorProfile = useMentorDirectoryStore(
    (state) => state.registerMentorProfile,
  );
  const createRequest = useMentoringManagementStore(
    (state) => state.createRequest,
  );
  const acceptRequest = useMentoringManagementStore(
    (state) => state.acceptRequest,
  );
  const sendMentorMessage = useMentoringManagementStore(
    (state) => state.sendMentorMessage,
  );
  const ensureMentorId = () => {
    if (!memberId) {
      showToast('로그인된 계정에서만 임시 검증을 실행할 수 있습니다.', 'error');

      return undefined;
    }

    const existingMentorId = mentorIdByMember[memberId];
    if (existingMentorId) {
      return existingMentorId;
    }

    const mentorId = registerMentorProfile(
      memberId,
      buildTempMentorRegistrationValues(),
    );
    showToast('임시 멘토 프로필을 생성했습니다.', 'success');

    return mentorId;
  };

  const goToManagement = () => {
    router.push('/mentoring-management');
  };

  const createPendingContactSeed = () => {
    const mentorId = ensureMentorId();
    if (!mentorId) {
      return;
    }

    createRequest({
      mentorId,
      method: 'simple',
      paymentMode: 'TOSS_PAYMENTS',
      menteeName: '임시 멘티 A',
      menteeRole: '주니어 프론트엔드 개발자',
      preferredDate: dayjs().add(4, 'day').format('YYYY-MM-DD'),
      preferredTime: '20:00',
      requestMessage: `신청함 연락 검증용 신청 (${dayjs().format('HH:mm:ss')})`,
    });

    showToast('신청함 연락 검증 상태를 만들었습니다.', 'success');
    goToManagement();
  };

  const createAcceptedContactSeed = () => {
    const mentorId = ensureMentorId();
    if (!mentorId) {
      return;
    }

    const requestId = createRequest({
      mentorId,
      method: 'simple',
      paymentMode: 'TOSS_PAYMENTS',
      menteeName: '임시 멘티 B',
      menteeRole: '주니어 백엔드 개발자',
      preferredDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      preferredTime: '21:00',
      requestMessage: `수락/연락 로그 검증용 신청 (${dayjs().format('HH:mm:ss')})`,
    });

    const startsAt = dayjs()
      .add(3, 'day')
      .hour(21)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();
    const endsAt = dayjs(startsAt).add(15, 'minute').toISOString();

    // TOSS_PAYMENTS: 결제 완료 후 신청 생성이므로 confirmManualPayment 불필요
    const acceptResult = acceptRequest({
      mentorId,
      requestId,
      schedule: {
        startsAt,
        endsAt,
        placeNote: '임시 검증용 간편상담',
      },
      mentorNote: '일정 확인했습니다. 상담 전날 다시 안내드릴게요.',
    });

    if (!acceptResult.ok) {
      showToast(
        acceptResult.reason ?? '수락 상태 생성에 실패했습니다.',
        'error',
      );

      return;
    }

    const messageResult = sendMentorMessage({
      mentorId,
      requestId,
      content: '상담 전에 핵심 질문 2~3개만 미리 정리해주세요.',
    });
    if (!messageResult.ok) {
      showToast(messageResult.reason ?? '메시지 생성에 실패했습니다.', 'error');

      return;
    }

    showToast('수락/연락 로그 검증 상태를 만들었습니다.', 'success');
    goToManagement();
  };

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-250">
      <h2 className="font-designer-18b text-text-default mb-75">
        원클릭 연락 화면 검증
      </h2>
      <p className="font-designer-13r text-text-subtle mb-150">
        신청함 대화/입금/수락 상태를 생성하고 멘토링 관리 화면으로 이동합니다.
      </p>

      <div className="flex flex-wrap gap-100">
        <Button
          type="button"
          color="outlined"
          size="small"
          onClick={createPendingContactSeed}
        >
          신청함 연락 상태 만들기
        </Button>
        <Button
          type="button"
          color="primary"
          size="small"
          onClick={createAcceptedContactSeed}
        >
          수락/대화 로그 상태 만들기
        </Button>
      </div>
    </section>
  );
}
