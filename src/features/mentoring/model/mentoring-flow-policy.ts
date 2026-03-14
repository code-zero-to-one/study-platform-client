import type { MentoringMethodType } from '@/types/mentoring/domain';
import type {
  MentoringPaymentStatus,
  MentoringRefundStatus,
  MentoringSessionIssueType,
} from '@/types/mentoring/management-domain';
import type { MyMentoringStatus } from '@/types/mentoring/my-mentoring';

export const MENTORING_DISCORD_INVITE_URL = 'https://discord.gg/yV4n3PRw';

export const MENTORING_SCHEDULE_RESPONSE_GUIDE =
  '예약형 상담은 신청 후 보통 24시간 안에 멘토 확인이 시작되며, 결과는 나의 멘토링 상세에 반영됩니다.';

export const MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE =
  '예약형 상담 신청이 들어오면 가급적 24시간 안에 확인해주세요. 48시간 내 미응답 시 자동 거절될 수 있습니다.';

export const MENTORING_MENTOR_CHANNEL_GUIDE =
  '기본 진행 채널은 디스코드입니다. 필요한 경우 멘티와 다른 방식도 사전에 협의할 수 있습니다.';

export const MENTORING_DISCORD_INVITE_GUIDE =
  '멘토 운영 전에 ZERO-ONE 멘토링 디스코드 채널에 먼저 입장해두세요. 운영 공지와 진행 링크 공유를 같은 기준으로 맞출 수 있습니다.';

export const MENTORING_NOTE_RESPONSE_GUIDE =
  '쪽지상담은 결제 후 멘토의 첫 답장이 도착하면 바로 진행이 시작됩니다.';

export const MENTORING_REFUND_POLICY_GUIDE =
  '상담 시작 120시간 전까지는 전액 환불이 가능하고, 이후 취소는 개별 안내 기준으로 처리됩니다.';

export const MENTORING_REFUND_POLICY_DETAIL =
  '환불 기준: 시작 120시간 전 전액, 120~24시간 전 30%, 24시간 내 환불 불가';

export const MENTORING_CHANGE_AND_NO_SHOW_GUIDE =
  '일정 변경, 직전 취소, 노쇼 처리 결과는 나의 멘토링과 운영 기록에 함께 남습니다.';

const MENTORING_APPLY_WRITING_GUIDE_MAP: Record<
  MentoringMethodType,
  readonly string[]
> = {
  note: [
    '지금 가장 막힌 질문을 한두 문장으로 먼저 적어주세요.',
    '코드, 문서, 캡처처럼 멘토가 바로 확인해야 할 자료를 함께 남겨주세요.',
    '답변으로 무엇을 얻고 싶은지 짧게 적어두면 첫 답변이 빨라집니다.',
  ],
  simple: [
    '짧게 확인받고 싶은 질문 1~2개를 먼저 적어주세요.',
    '상황 이해에 필요한 링크나 자료가 있으면 함께 남겨주세요.',
    '통화에서 바로 결론을 듣고 싶은 포인트를 적어두면 좋습니다.',
  ],
  deep: [
    '배경, 시도해본 것, 지금 막힌 지점을 순서대로 적어주세요.',
    '같이 볼 코드, 포트폴리오, 문서가 있으면 미리 남겨주세요.',
    '상담이 끝난 뒤 가져가고 싶은 액션 아이템을 적어주세요.',
  ],
  offline: [
    '만남 목적과 현장에서 꼭 다루고 싶은 주제를 먼저 적어주세요.',
    '희망 지역이나 이동 제약이 있으면 함께 적어주세요.',
    '현장에서 볼 자료가 있으면 링크나 파일을 같이 남겨주세요.',
  ],
};

const MENTORING_APPLY_PLACEHOLDER_MAP: Record<MentoringMethodType, string> = {
  note: '핵심 질문, 현재 상황, 확인받고 싶은 자료를 적어주세요.',
  simple: '짧게 답을 받고 싶은 질문과 필요한 맥락을 적어주세요.',
  deep: '배경, 시도한 것, 받고 싶은 피드백을 순서대로 적어주세요.',
  offline: '만남 목적, 희망 지역, 대면으로 꼭 다루고 싶은 내용을 적어주세요.',
};

const MENTORING_METHOD_FLOW_META: Record<
  MentoringMethodType,
  {
    steps: [string, string, string];
    mentorAction: string;
    issueGuide: string;
    channelGuide: string;
    progressGuide: string;
    completionSummary: string;
    completionSteps: [string, string];
  }
> = {
  note: {
    steps: [
      '질문과 자료를 남기면 신청이 접수됩니다.',
      '멘토가 수락하고 첫 답변을 보내면 상담이 시작됩니다.',
      '추가 질문이 필요하면 새 쪽지상담을 다시 신청합니다.',
    ],
    mentorAction: '수락 후 첫 답변 1회로 상담 방향을 분명하게 정리해주세요.',
    issueGuide: '거절, 미응답, 상담 종료 기록은 쪽지상담 화면에 그대로 남습니다.',
    channelGuide:
      '쪽지상담은 서비스 내 쪽지 화면에서 진행됩니다. 추가 질문이 필요하면 새 쪽지상담을 다시 신청해야 해요.',
    progressGuide:
      '답변 상태와 상담 종료 여부는 쪽지상담 화면에서 이어서 확인할 수 있어요.',
    completionSummary:
      '결제가 끝났어요. 멘토가 첫 답변을 보내면 상담이 시작됩니다.',
    completionSteps: [
      '멘토가 신청을 수락하고 첫 답변을 남기면 쪽지상담 화면에서 바로 확인할 수 있습니다.',
      '추가 질문이 필요하면 새 쪽지상담을 다시 신청해주세요.',
    ],
  },
  simple: {
    steps: [
      '희망 시간과 요청서를 함께 제출합니다.',
      '멘토가 짧은 상담 시간을 확정하고 진행 채널을 안내합니다.',
      '확정된 일정과 변경 내역은 나의 멘토링에서 확인합니다.',
    ],
    mentorAction: '수락할 때 확정 시간과 진행 채널을 함께 남겨주세요.',
    issueGuide: '직전 취소, 변경, 노쇼 결과는 나의 멘토링과 운영 기록에 남습니다.',
    channelGuide:
      '기본 진행 채널은 디스코드입니다. 필요한 경우 멘토와 다른 방식도 사전에 협의할 수 있어요.',
    progressGuide:
      '확정된 시간과 통화 안내는 나의 멘토링에서 이어서 확인할 수 있어요.',
    completionSummary:
      '결제가 끝났어요. 멘토가 짧은 상담 시간과 진행 채널을 확인합니다.',
    completionSteps: [
      '멘토 확인 후 확정 시간과 진행 채널이 나의 멘토링 상세에 반영됩니다.',
      '확정된 시간과 통화 안내는 나의 멘토링에서 다시 확인하세요.',
    ],
  },
  deep: {
    steps: [
      '희망 시간과 사전 질문을 제출합니다.',
      '멘토가 화면 공유 또는 화상 기준으로 일정을 확정합니다.',
      '확정 후 링크와 변경 내역은 나의 멘토링에서 이어서 확인합니다.',
    ],
    mentorAction: '수락 시 확정 시간과 링크 또는 진행 도구를 함께 남겨주세요.',
    issueGuide:
      '취소, 일정 재조율, 노쇼 처리는 나의 멘토링과 운영 기록에 함께 남습니다.',
    channelGuide:
      '기본 진행 채널은 디스코드입니다. 필요한 경우 멘토와 다른 방식도 사전에 협의할 수 있어요.',
    progressGuide:
      '확정된 시간과 진행 링크는 나의 멘토링에서 이어서 확인할 수 있어요.',
    completionSummary:
      '결제가 끝났어요. 멘토가 화상 기준 일정과 진행 링크를 확인합니다.',
    completionSteps: [
      '멘토 확인 후 확정 시간과 진행 링크가 나의 멘토링 상세에 반영됩니다.',
      '상담 전에 나의 멘토링에서 시간과 링크를 다시 확인하세요.',
    ],
  },
  offline: {
    steps: [
      '희망 시간과 만남 목적을 제출합니다.',
      '멘토가 일정과 장소 기준을 확정합니다.',
      '확정 후 장소, 변경, 취소 안내를 나의 멘토링에서 확인합니다.',
    ],
    mentorAction: '수락 시 확정 시간과 장소 안내 기준을 함께 남겨주세요.',
    issueGuide:
      '장소 변경, 직전 취소, 노쇼 처리 결과는 기록으로 남겨두는 편이 안전합니다.',
    channelGuide:
      '대면상담은 확정 후 장소를 따로 안내합니다. 일정 조율은 디스코드 또는 멘토와 합의한 채널로 진행할 수 있어요.',
    progressGuide:
      '확정된 시간과 장소 안내는 나의 멘토링에서 이어서 확인할 수 있어요.',
    completionSummary: '결제가 끝났어요. 멘토가 일정과 장소 안내를 확인합니다.',
    completionSteps: [
      '멘토 확인 후 확정 시간과 장소 안내가 나의 멘토링 상세에 반영됩니다.',
      '상담 전에 나의 멘토링에서 시간과 장소를 다시 확인하세요.',
    ],
  },
};

export const getMentoringResponseGuide = (method: MentoringMethodType) => {
  return method === 'note'
    ? MENTORING_NOTE_RESPONSE_GUIDE
    : MENTORING_SCHEDULE_RESPONSE_GUIDE;
};

export const getMentoringMethodFlowMeta = (method: MentoringMethodType) => {
  return MENTORING_METHOD_FLOW_META[method];
};

export const getMentoringChannelGuide = (method: MentoringMethodType) => {
  return MENTORING_METHOD_FLOW_META[method].channelGuide;
};

export const getMentoringProgressCheckGuide = (method: MentoringMethodType) => {
  return MENTORING_METHOD_FLOW_META[method].progressGuide;
};

export const getMentoringCompletionSummary = (method: MentoringMethodType) => {
  return MENTORING_METHOD_FLOW_META[method].completionSummary;
};

export const getMentoringCompletionSteps = (method: MentoringMethodType) => {
  return MENTORING_METHOD_FLOW_META[method].completionSteps;
};

export const getMentoringApplyWritingGuide = (method: MentoringMethodType) => {
  return MENTORING_APPLY_WRITING_GUIDE_MAP[method];
};

export const getMentoringApplyPlaceholder = (method: MentoringMethodType) => {
  return MENTORING_APPLY_PLACEHOLDER_MAP[method];
};

export const getMentoringPendingPaymentGuide = (
  method: MentoringMethodType,
) => {
  return method === 'note'
    ? '입금 확인이 끝나면 멘토 수락과 첫 답변 단계로 이어집니다.'
    : method === 'offline'
      ? '입금 확인이 끝나면 멘토 수락과 일정·장소 확정 단계로 이어집니다.'
      : '입금 확인이 끝나면 멘토 수락과 일정 확정 단계로 이어집니다.';
};

export const getMyMentoringStatusGuide = (status: MyMentoringStatus) => {
  if (status === 'REQUESTED') {
    return '보통 24시간 안에 멘토 확인이 시작되며, 확인 결과는 나의 멘토링 상세에 반영됩니다.';
  }

  if (status === 'PENDING') {
    return '멘토가 보낸 조율안이나 확정 결과를 이 상세 화면에서 바로 확인할 수 있습니다.';
  }

  if (status === 'CONFIRMED') {
    return '확정된 시간과 진행 채널 또는 장소를 상담 전에 다시 한 번 확인해주세요.';
  }

  if (status === 'COMPLETED') {
    return '상담이 끝난 내역입니다. 기억이 남아 있을 때 후기와 다음 액션을 정리해두는 편이 좋습니다.';
  }

  if (status === 'NO_SHOW') {
    return '노쇼 처리 결과와 환불 또는 재예약 안내를 먼저 확인해주세요.';
  }

  if (status === 'CANCELLED') {
    return '취소 사유와 후속 안내를 먼저 확인해주세요. 재상담 여부는 이 화면과 운영 기록을 기준으로 판단하면 됩니다.';
  }

  return '거절 사유를 확인한 뒤 다른 멘토를 비교해 다시 신청할 수 있습니다.';
};

export const getMentoringMentorRequestChecklist = ({
  method,
  paymentStatus,
}: {
  method: MentoringMethodType;
  paymentStatus: MentoringPaymentStatus;
}) => {
  const checklist: string[] = [];

  if (paymentStatus === 'PENDING_TRANSFER') {
    checklist.push(
      '먼저 입금 확인을 끝내야 수락과 답변 또는 일정 확정이 열립니다.',
    );
  } else {
    checklist.push(
      method === 'note'
        ? '수락 후 첫 답변 1회로 현재 판단과 다음 액션을 분명히 남겨주세요.'
        : '수락 시 확정 시간과 진행 채널 또는 장소를 같이 남겨주세요.',
    );
  }

  checklist.push(
    method === 'offline'
      ? '대면상담은 장소, 만나는 기준, 직전 변경 방법까지 함께 안내하는 편이 안전합니다.'
      : method === 'note'
        ? '첫 답변에는 현재 판단, 확인한 자료, 다음 액션을 짧게 정리하는 편이 좋습니다.'
        : '예약형 상담은 직전 변경, 링크 전달, 노쇼 기준까지 같이 남겨두는 편이 안전합니다.',
  );

  checklist.push(
    '수락, 거절, 변경, 취소는 모두 대화 기록과 멘토링 상세에 남으므로 멘티가 다음 행동을 알 수 있게 작성하세요.',
  );

  return checklist;
};

export const getMentoringIssuePlaybook = ({
  viewer,
  issueType,
  refundStatus,
}: {
  viewer: 'mentor' | 'mentee';
  issueType?: MentoringSessionIssueType;
  refundStatus?: MentoringRefundStatus;
}) => {
  if (!issueType || issueType === 'NONE') {
    return {
      title: viewer === 'mentor' ? '운영 처리 기준' : '변경/예외 상황 기준',
      items:
        viewer === 'mentor'
          ? [
              '상담 시작 전 변경이나 취소는 사유를 남기고, 멘티가 다음 행동을 알 수 있게 안내하세요.',
              '상담 시작 후에는 완료, 멘티 노쇼, 멘토 노쇼 중 하나로 바로 기록하는 편이 안전합니다.',
              '환불 대기나 일정 변경이 생기면 운영 기록과 대화 기록에 후속 안내를 남겨두세요.',
            ]
          : [
              '상담 전 변경이나 취소가 생기면 이 화면과 운영 기록에 함께 기록됩니다.',
              '멘토 취소나 노쇼가 발생하면 환불 또는 재예약 안내가 같이 남습니다.',
              '긴급한 상담은 상태 확인 후 새 신청으로 다시 잡는 편이 가장 빠릅니다.',
            ],
    };
  }

  if (issueType === 'MENTOR_CANCELLED') {
    return {
      title: viewer === 'mentor' ? '멘토 취소 후속 처리' : '멘토 취소 안내',
      items:
        viewer === 'mentor'
          ? [
              '취소 사유와 다음 안내를 남겨 멘티가 바로 판단할 수 있게 해주세요.',
              '환불 상태가 PENDING이면 전액 또는 부분 환불 진행 여부를 운영 기록에 같이 남기세요.',
              '대체 일정이 어렵다면 새 신청 경로를 명확히 안내하는 편이 안전합니다.',
            ]
          : [
              '취소 사유와 환불 상태를 먼저 확인하세요.',
              '환불 진행 중이면 이 화면의 운영 기록과 상태를 함께 확인하세요.',
              '같은 주제가 급하면 다른 멘토나 다른 일정으로 새 신청을 넣는 편이 빠릅니다.',
            ],
    };
  }

  if (issueType === 'MENTEE_CANCELLED') {
    return {
      title: viewer === 'mentor' ? '멘티 취소 후속 처리' : '취소 처리 안내',
      items:
        viewer === 'mentor'
          ? [
              '취소 사유를 남기고 환불 기준이 어떻게 적용되는지 멘티가 알 수 있게 안내하세요.',
              '상담 시작 24시간 이내 취소처럼 환불 불가 케이스는 이유를 함께 남겨야 분쟁을 줄일 수 있습니다.',
              '재예약이 가능하다면 새 신청 기준을 같이 남기는 편이 좋습니다.',
            ]
          : [
              '취소 처리 결과와 환불 기준을 먼저 확인하세요.',
              '환불 상태가 PENDING이면 이 화면의 운영 기록과 상태를 같이 확인하세요.',
              '다시 진행하려면 원하는 일정으로 새 신청을 넣는 편이 가장 빠릅니다.',
            ],
    };
  }

  if (issueType === 'MENTOR_NO_SHOW') {
    return {
      title: viewer === 'mentor' ? '멘토 노쇼 후속 처리' : '멘토 노쇼 안내',
      items:
        viewer === 'mentor'
          ? [
              '미입장 사유와 후속 안내를 남겨 멘티가 기다리지 않게 해주세요.',
              '노쇼는 환불 대기로 이어지므로 환불 또는 재예약 방향을 같이 안내하는 편이 안전합니다.',
              '같은 이슈가 반복되지 않게 진행 채널과 리마인드 방식을 다시 점검하세요.',
            ]
          : [
              '멘토 미입장 처리 결과와 환불 또는 재예약 안내를 먼저 확인하세요.',
              '환불 상태가 PENDING이면 이 화면과 대화 기록을 함께 확인하세요.',
              '같은 상담이 급하면 새 일정으로 다시 신청하거나 다른 멘토를 비교하세요.',
            ],
    };
  }

  return {
    title: viewer === 'mentor' ? '멘티 노쇼 후속 처리' : '멘티 노쇼 안내',
    items:
      viewer === 'mentor'
        ? [
            '노쇼 판단 근거와 후속 안내를 남겨 멘티가 결과를 이해할 수 있게 해주세요.',
            '환불 불가 또는 예외 적용 여부를 기록에 남겨야 분쟁을 줄일 수 있습니다.',
            '필요하면 새 신청 기준이나 재예약 불가 기준을 함께 안내하세요.',
          ]
        : [
            '노쇼 처리 결과와 환불 불가 또는 예외 기준을 먼저 확인하세요.',
            '같은 상담이 필요하면 새 신청으로 다시 잡는 편이 가장 빠릅니다.',
            refundStatus === 'NOT_ELIGIBLE'
              ? '이번 건은 환불 대상이 아닐 수 있으니 운영 기록과 상태를 같이 확인하세요.'
              : '환불 상태가 남아 있다면 이 화면의 운영 기록을 확인하세요.',
          ],
  };
};
