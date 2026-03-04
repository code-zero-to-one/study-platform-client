'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import { useUserStore } from '@/stores/useUserStore';
import Button from '@/components/common/ui/button';

const TARGET_MENTOR_ID = 101;

export default function ReviewSeedActions() {
  const router = useRouter();
  const { memberId } = useAuthReady();
  const { memberName, nickname } = useUserStore();
  const { showToast } = useToastStore();
  const createRequest = useMentoringManagementStore(
    (state) => state.createRequest,
  );
  const acceptRequest = useMentoringManagementStore(
    (state) => state.acceptRequest,
  );

  const ensureMember = () => {
    if (!memberId) {
      showToast('로그인된 계정에서만 임시 검증을 실행할 수 있습니다.', 'error');

      return false;
    }

    return true;
  };

  const getMenteeName = () => {
    return memberName ?? nickname ?? '임시 멘티';
  };

  const goToReviewPage = () => {
    router.push('/my-study-review');
  };

  const createNoteReviewReady = () => {
    if (!ensureMember()) {
      return;
    }

    const requestId = createRequest({
      mentorId: TARGET_MENTOR_ID,
      method: 'note',
      paymentMode: 'TOSS_PAYMENTS',
      menteeMemberId: memberId,
      menteeName: getMenteeName(),
      menteeRole: 'ZERO-ONE 멘티',
      requestMessage: `임시 검증용 쪽지상담 신청 (${dayjs().format('HH:mm:ss')})`,
    });

    // TOSS_PAYMENTS: 결제 완료 후 신청 생성이므로 confirmManualPayment 불필요
    const result = acceptRequest({
      mentorId: TARGET_MENTOR_ID,
      requestId,
      mentorNote: '임시 검증용 수락 처리',
    });

    if (!result.ok) {
      showToast(result.reason ?? '임시 데이터 생성에 실패했습니다.', 'error');

      return;
    }

    showToast('쪽지상담 후기 작성 가능 상태를 만들었습니다.', 'success');
    goToReviewPage();
  };

  const createPhoneReviewReady = () => {
    if (!ensureMember()) {
      return;
    }

    const requestId = createRequest({
      mentorId: TARGET_MENTOR_ID,
      method: 'simple',
      paymentMode: 'TOSS_PAYMENTS',
      menteeMemberId: memberId,
      menteeName: getMenteeName(),
      menteeRole: 'ZERO-ONE 멘티',
      preferredDate: dayjs().format('YYYY-MM-DD'),
      preferredTime: dayjs().format('HH:mm'),
      requestMessage: `임시 검증용 간편상담 신청 (${dayjs().format('HH:mm:ss')})`,
    });

    // TOSS_PAYMENTS: 결제 완료 후 신청 생성이므로 confirmManualPayment 불필요
    const startsAt = dayjs()
      .subtract(2, 'hour')
      .startOf('minute')
      .toISOString();
    const endsAt = dayjs().subtract(1, 'hour').startOf('minute').toISOString();
    const result = acceptRequest({
      mentorId: TARGET_MENTOR_ID,
      requestId,
      schedule: {
        startsAt,
        endsAt,
        placeNote: '임시 검증용 간편상담',
      },
      mentorNote: '임시 검증용 일정 확정',
    });

    if (!result.ok) {
      showToast(result.reason ?? '임시 데이터 생성에 실패했습니다.', 'error');

      return;
    }

    showToast('간편상담(완료) 후기 작성 가능 상태를 만들었습니다.', 'success');
    goToReviewPage();
  };

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-250">
      <h2 className="font-designer-18b text-text-default mb-75">
        원클릭 후기 검증
      </h2>
      <p className="font-designer-13r text-text-subtle mb-150">
        버튼을 누르면 임시 신청/수락 데이터가 생성되고 후기 화면으로 이동합니다.
      </p>

      <div className="flex flex-wrap gap-100">
        <Button
          type="button"
          color="primary"
          size="small"
          onClick={createNoteReviewReady}
        >
          쪽지 후기 상태 만들기
        </Button>
        <Button
          type="button"
          color="outlined"
          size="small"
          onClick={createPhoneReviewReady}
        >
          간편(완료) 후기 상태 만들기
        </Button>
      </div>
    </section>
  );
}
