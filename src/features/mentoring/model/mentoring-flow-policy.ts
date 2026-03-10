import type { MentoringMethodType } from '@/types/mentoring/domain';
import type { MyMentoringStatus } from '@/types/mentoring/my-mentoring';

export const MENTORING_DEFAULT_CHANNEL_GUIDE =
  '기본 진행 채널은 디스코드이며, 필요한 경우 멘토와 다른 방식도 사전에 협의할 수 있어요.';

export const MENTORING_SCHEDULE_RESPONSE_GUIDE =
  '예약형 상담은 신청 후 보통 24시간 안에 멘토 확인이 시작되며, 결과는 알림으로 안내됩니다.';

export const MENTORING_NOTE_RESPONSE_GUIDE =
  '쪽지상담은 결제 후 멘토의 첫 답장이 도착하면 바로 진행이 시작됩니다.';

export const MENTORING_PROGRESS_CHECK_GUIDE =
  '확정 시간과 진행 링크는 알림과 나의 멘토링에서 이어서 확인할 수 있어요.';

export const MENTORING_APPLY_WRITING_GUIDE = [
  '지금 가장 막히는 지점이나 상담을 신청한 이유',
  '현재 상태를 이해하는 데 필요한 배경 정보나 자료',
  '상담이 끝난 뒤 꼭 얻고 싶은 피드백이나 액션 아이템',
] as const;

export const getMentoringResponseGuide = (method: MentoringMethodType) => {
  return method === 'note'
    ? MENTORING_NOTE_RESPONSE_GUIDE
    : MENTORING_SCHEDULE_RESPONSE_GUIDE;
};

export const getMyMentoringStatusGuide = (status: MyMentoringStatus) => {
  if (status === 'REQUESTED') {
    return '보통 24시간 안에 멘토 확인이 시작되며, 확인 결과는 알림으로 안내됩니다.';
  }

  if (status === 'PENDING') {
    return '멘토가 보낸 조율안이나 확정 결과를 알림과 상세 화면에서 바로 확인할 수 있습니다.';
  }

  return '확정된 시간과 진행 링크를 상담 전에 다시 한 번 확인해주세요.';
};
