'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';

// ──────────────────────────────────────────────────────────────
// [임시] 멘토링 플로우 정의 & 상태 코드 사전 & 테스트 안내
// 디자인 확정 후 제거 예정
// ──────────────────────────────────────────────────────────────

// ── 색상 맵 ──────────────────────────────────────────────────

const COLOR: Record<string, string> = {
  orange: 'bg-background-accent-orange-subtle text-text-accent-orange',
  purple: 'bg-background-accent-purple-subtle text-text-accent-purple',
  green: 'bg-background-accent-green-subtle text-text-accent-green',
  blue: 'bg-background-accent-blue-subtle text-text-accent-blue',
  indigo: 'bg-background-accent-indigo-subtle text-text-accent-indigo',
  red: 'bg-background-accent-red-subtle text-text-accent-red',
  gray: 'bg-background-neutral-subtle text-text-subtle',
};

// ── 상태 코드 사전 ───────────────────────────────────────────

/**
 * E 섹션에서 표시할 상태 코드 사전.
 * 실제 코드베이스의 타입 정의와 1:1 대응.
 *
 * MentorScreeningStatus  → src/types/mentoring-admin.ts
 * MentorOperationStatus  → src/types/mentoring-admin.ts
 * MentoringRequestStatus → src/types/mentoring-management.ts
 * MentoringPaymentStatus → src/types/mentoring-management.ts
 * MentoringPaymentMode   → src/types/mentoring-management.ts
 * MentoringSessionStatus → src/types/mentoring-management.ts
 * MentoringMethodType    → src/types/mentoring-domain.ts
 */
const ENUM_GROUPS = [
  {
    id: 'screening',
    typeName: 'MentorScreeningStatus',
    title: '멘토 심사 상태',
    desc: '관리자가 멘토 지원서를 심사하는 단계를 나타냅니다.',
    values: [
      {
        value: 'PENDING',
        color: 'orange',
        label: '심사 대기',
        definition:
          '멘토가 등록 폼을 제출했지만 아직 관리자가 검토를 시작하지 않은 상태.',
        setter: '시스템 자동 (등록 폼 제출 시)',
      },
      {
        value: 'IN_REVIEW',
        color: 'purple',
        label: '심사 중',
        definition: '관리자가 지원서를 열람하고 심사를 진행 중인 상태.',
        setter: '관리자',
      },
      {
        value: 'APPROVED',
        color: 'green',
        label: '승인',
        definition:
          '심사 통과. 멘토로 활동 가능한 상태. 운영 상태(MentorOperationStatus)가 OPEN으로 함께 전환됨.',
        setter: '관리자',
      },
      {
        value: 'REJECTED',
        color: 'red',
        label: '반려',
        definition:
          '심사 불통과. 관리자가 입력한 메모(note)가 거절 사유로 기록됨. 지원자에게 사유 노출 필요 — 현재 미구현.',
        setter: '관리자',
      },
    ],
  },
  {
    id: 'operation',
    typeName: 'MentorOperationStatus',
    title: '멘토 운영 상태',
    desc: '승인된 멘토의 현재 활동 가능 여부를 나타냅니다.',
    values: [
      {
        value: 'OPEN',
        color: 'green',
        label: '정상 운영',
        definition: '멘티가 신청할 수 있는 상태. 기본값.',
        setter: '관리자 (심사 승인 시 자동 설정)',
      },
      {
        value: 'REQUESTS_PAUSED',
        color: 'orange',
        label: '신청 일시 중단',
        definition:
          '신규 신청은 받지 않지만 기존 확정 세션은 유지되는 상태. 멘토 자신이 요청하거나 관리자가 설정.',
        setter: '관리자 / 멘토 요청',
      },
      {
        value: 'SUSPENDED',
        color: 'red',
        label: '운영 중단',
        definition:
          '모든 멘토링 활동이 중단된 상태. 정책 위반·장기 미응답 등 사유로 관리자가 설정.',
        setter: '관리자',
      },
    ],
  },
  {
    id: 'request',
    typeName: 'MentoringRequestStatus',
    title: '멘토링 신청 상태',
    desc: '멘티가 보낸 신청 건의 처리 상태입니다.',
    values: [
      {
        value: 'PENDING',
        color: 'orange',
        label: '대기 중',
        definition:
          '멘티가 신청서를 제출한 초기 상태. 멘토가 입금 확인 후 수락 또는 거절 가능.',
        setter: '시스템 자동 (신청 제출 시)',
      },
      {
        value: 'ACCEPTED',
        color: 'green',
        label: '수락됨',
        definition:
          '멘토가 신청을 수락한 상태. 예약형(전화·온라인·대면)은 동시에 MentoringSession이 SCHEDULED로 생성됨.',
        setter: '멘토',
      },
      {
        value: 'REJECTED',
        color: 'red',
        label: '거절됨',
        definition: '멘토가 신청을 거절한 상태. 거절 사유가 대화창에 기록됨.',
        setter: '멘토',
      },
    ],
  },
  {
    id: 'payment',
    typeName: 'MentoringPaymentStatus',
    title: '결제 상태',
    desc: '수동 이체 방식에서 멘티의 입금 처리 상태입니다.',
    values: [
      {
        value: 'PENDING_TRANSFER',
        color: 'orange',
        label: '입금 대기',
        definition:
          '멘티가 아직 이체하지 않았거나, 이체했지만 멘토가 확인 전인 상태. 이 상태에서는 멘토가 수락 불가.',
        setter: '시스템 자동 (신청 제출 시)',
      },
      {
        value: 'CONFIRMED',
        color: 'green',
        label: '입금 확인',
        definition: '멘토가 입금을 직접 확인하고 처리한 상태. 이후 수락 가능.',
        setter: '멘토',
      },
    ],
  },
  {
    id: 'paymentMode',
    typeName: 'MentoringPaymentMode',
    title: '결제 방식',
    desc: '현재 지원하는 결제 수단입니다.',
    values: [
      {
        value: 'MANUAL_TRANSFER',
        color: 'blue',
        label: '수동 계좌이체',
        definition:
          '멘티가 멘토의 계좌로 직접 송금하는 방식. 멘토가 입금 여부를 수동으로 확인 후 처리. 현재 유일한 결제 수단.',
        setter: '시스템 고정',
      },
    ],
  },
  {
    id: 'session',
    typeName: 'MentoringSessionStatus',
    title: '세션 상태',
    desc: '예약형 상담(전화·온라인·대면)에서 생성되는 세션의 진행 상태입니다. 쪽지(note) 방식은 세션이 생성되지 않습니다.',
    values: [
      {
        value: 'SCHEDULED',
        color: 'green',
        label: '예정',
        definition:
          '멘토가 일정을 확정하여 세션이 생성된 상태. 약속 날짜·시간·장소가 고정됨.',
        setter: '시스템 자동 (신청 수락 시)',
      },
      {
        value: 'COMPLETED',
        color: 'blue',
        label: '완료',
        definition:
          '세션이 종료된 상태. 종료 시각이 지났을 때 멘토가 완료 처리하거나, 멘티가 후기 제출 시 자동 전환.',
        setter: '멘토 또는 시스템 자동',
      },
      {
        value: 'CANCELLED',
        color: 'red',
        label: '취소',
        definition:
          '멘토 또는 관리자가 확정된 세션을 취소한 상태. 취소 사유가 대화창에 기록됨.',
        setter: '멘토',
      },
    ],
  },
  {
    id: 'method',
    typeName: 'MentoringMethodType',
    title: '상담 방식',
    desc: '멘토가 제공하는 상담 유형입니다. 각 방식별로 예약 일정 생성 여부가 다릅니다.',
    values: [
      {
        value: 'note',
        color: 'gray',
        label: '쪽지 상담',
        definition:
          '비동기 텍스트 상담. 일정 불필요. 수락 즉시 후기 작성 가능. 세션(MentoringSession) 미생성.',
        setter: '멘토가 등록 시 활성화',
      },
      {
        value: 'phone',
        color: 'gray',
        label: '15분 전화',
        definition:
          '단기 전화 상담. 희망 날짜·시간 선택 필수. 수락 시 15분 세션 생성.',
        setter: '멘토가 등록 시 활성화',
      },
      {
        value: 'online',
        color: 'gray',
        label: '온라인 화상',
        definition:
          '화면 공유·코드 리뷰 등 실시간 상담. 30분 또는 60분 중 멘토가 선택. 수락 시 세션 생성.',
        setter: '멘토가 등록 시 활성화',
      },
      {
        value: 'offline',
        color: 'gray',
        label: '대면',
        definition:
          '직접 만나는 커피챗·심층 상담. 30·60·90분 중 멘토가 선택. 장소 메모 필수. 수락 시 세션 생성.',
        setter: '멘토가 등록 시 활성화',
      },
    ],
  },
] as const;

// ── 플로우 정의 ──────────────────────────────────────────────

interface FlowStepDef {
  id: string;
  label: string;
  desc: string;
  statuses: Array<{ value: string; color: string }>;
  testLink: string;
  testLabel: string;
}

const FLOW_A_STEPS: FlowStepDef[] = [
  {
    id: 'a1',
    label: '① 멘토 지원',
    desc: '일반 사용자가 /mentoring/become-mentor 페이지에서 멘토 등록 폼을 작성·제출합니다.',
    statuses: [{ value: 'PENDING', color: 'orange' }],
    testLink: '/mentoring/become-mentor',
    testLabel: '멘토 등록 페이지 열기',
  },
  {
    id: 'a2',
    label: '② 관리자 심사 시작',
    desc: '관리자가 신청서를 확인하고 심사를 시작합니다. 필요 시 추가 서류나 인터뷰를 요청할 수 있습니다.',
    statuses: [{ value: 'IN_REVIEW', color: 'purple' }],
    testLink: '/admin/mentoring/mentor-applications',
    testLabel: '멘토 심사 화면 이동',
  },
  {
    id: 'a3',
    label: '③ 심사 결정',
    desc: '승인(APPROVED) 시 멘토 운영 상태가 OPEN으로 자동 전환됩니다. 반려(REJECTED) 시 관리자가 입력한 심사 메모(note)가 거절 사유로 기록됩니다. ※ 현재 지원자에게 거절 사유를 보여주는 화면 미구현.',
    statuses: [
      { value: 'APPROVED', color: 'green' },
      { value: 'REJECTED', color: 'red' },
    ],
    testLink: '/admin/mentoring/mentor-applications',
    testLabel: '심사 결정 화면 이동',
  },
  {
    id: 'a4',
    label: '④ 멘토 운영',
    desc: '승인된 멘토는 OPEN 상태에서 신청을 받습니다. 필요 시 REQUESTS_PAUSED(신청 일시 중단) 또는 SUSPENDED(운영 중단)으로 전환할 수 있습니다.',
    statuses: [
      { value: 'OPEN', color: 'green' },
      { value: 'REQUESTS_PAUSED', color: 'orange' },
      { value: 'SUSPENDED', color: 'red' },
    ],
    testLink: '/admin/mentoring/mentor-operations',
    testLabel: '멘토 운영 정보 이동',
  },
];

const FLOW_B_STEPS: FlowStepDef[] = [
  {
    id: 'b1',
    label: '① 멘티 신청',
    desc: '/mentoring/[id]/apply 에서 상담 방식, 신청 메시지, 희망 날짜(예약형)를 입력합니다. 수동 이체 메모를 작성 후 제출하면 신청이 생성됩니다.',
    statuses: [
      { value: 'PENDING', color: 'orange' },
      { value: 'PENDING_TRANSFER', color: 'orange' },
    ],
    testLink: '/mentoring',
    testLabel: '멘토 목록 열기',
  },
  {
    id: 'b2',
    label: '② 멘티 입금 → 멘토 입금 확인',
    desc: '멘티가 계좌이체 후 메모를 남깁니다. 멘토가 멘토링 관리 화면에서 "입금 확인" 버튼을 눌러 결제 상태를 변경합니다. 입금 확인 전에는 수락 버튼이 비활성화됩니다.',
    statuses: [{ value: 'CONFIRMED', color: 'green' }],
    testLink: '/mentoring-management',
    testLabel: '멘토링 관리 화면 열기',
  },
  {
    id: 'b3',
    label: '③ 멘토 수락 / 거절',
    desc: '멘토가 신청을 수락하면 ACCEPTED로 전환됩니다. 쪽지(note)는 일정 없이 즉시 수락. 예약형(전화·온라인·대면)은 날짜·시간·장소를 확정해야 수락 가능하며, 동시에 SCHEDULED 세션이 생성됩니다. 거절 시 사유를 입력합니다.',
    statuses: [
      { value: 'ACCEPTED', color: 'green' },
      { value: 'SCHEDULED', color: 'green' },
      { value: 'REJECTED', color: 'red' },
    ],
    testLink: '/mentoring-management',
    testLabel: '멘토링 관리 화면 열기',
  },
  {
    id: 'b4',
    label: '④ 세션 진행 (예약형만)',
    desc: '약속 일시가 지나면 후기 작성이 열립니다. 멘토가 완료(COMPLETED) 또는 취소(CANCELLED) 처리를 할 수 있습니다. 쪽지(note)는 이 단계가 없습니다.',
    statuses: [
      { value: 'COMPLETED', color: 'blue' },
      { value: 'CANCELLED', color: 'red' },
    ],
    testLink: '/admin/mentoring/sessions',
    testLabel: '신청/일정 현황 이동',
  },
  {
    id: 'b5',
    label: '⑤ 멘티 후기 작성',
    desc: '쪽지: 수락 즉시 후기 가능. 예약형: 세션 종료 이후 후기 가능. 별점(1~5점), 추천 여부(RECOMMEND / NOT_RECOMMEND), 텍스트(10자 이상)를 입력합니다.',
    statuses: [
      { value: 'RECOMMEND', color: 'green' },
      { value: 'NOT_RECOMMEND', color: 'red' },
    ],
    testLink: '/mentoring-management',
    testLabel: '멘티 후기 화면 열기',
  },
];

// ── 공통 컴포넌트 ────────────────────────────────────────────

function EnumChip({ value, color }: { value: string; color: string }) {
  return (
    <code
      className={`rounded-50 font-designer-12b inline-block px-75 py-25 ${COLOR[color] ?? ''}`}
    >
      {value}
    </code>
  );
}

function FlowStep({
  step,
  index,
  total,
}: {
  step: FlowStepDef;
  index: number;
  total: number;
}) {
  return (
    <div className="flex gap-150">
      <div className="flex flex-col items-center">
        <div className="border-border-brand bg-background-accent-blue-subtle flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border">
          <span className="font-designer-12b text-text-accent-blue">
            {index + 1}
          </span>
        </div>
        {index < total - 1 && (
          <div className="bg-border-subtle mt-50 h-full w-[1px]" />
        )}
      </div>
      <div className="pb-150 flex-1">
        <p className="font-designer-14b text-text-default">{step.label}</p>
        <div className="mt-50 flex flex-wrap gap-50">
          {step.statuses.map((s) => (
            <EnumChip key={s.value} value={s.value} color={s.color} />
          ))}
        </div>
        <p className="font-designer-13r text-text-subtle mt-75">{step.desc}</p>
        <Link href={step.testLink} className="mt-75 inline-block">
          <Button size="small" color="outlined">
            {step.testLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────

export default function MentoringFlowGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const registeredMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const firstMentorId =
    registeredMentors.length > 0 ? registeredMentors[0].id : null;

  return (
    // [임시 컴포넌트] 디자인 확정 후 제거 예정
    <section className="rounded-100 border-border-subtle border">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-200"
      >
        <div className="flex items-center gap-100">
          <p className="font-designer-16b text-text-default">
            [임시] 멘토링 플로우 & 상태 코드 사전 & 테스트 가이드
          </p>
          <span className={`rounded-50 font-designer-12b px-75 py-25 ${COLOR.orange}`}>
            디자인 완료 후 제거
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          {isOpen ? '접기 ▲' : '펼치기 ▼'}
        </span>
      </button>

      {isOpen && (
        <div className="border-border-subtle flex flex-col gap-300 border-t p-200">

          {/* ── A. 멘토 등록 플로우 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-25">
              A. 멘토 등록 플로우
            </p>
            <p className="font-designer-13r text-text-subtle mb-150">
              일반 사용자가 멘토로 지원하고 관리자 심사를 거쳐 활동하는 전체 흐름입니다.
            </p>
            <div className="flex flex-col">
              {FLOW_A_STEPS.map((step, index) => (
                <FlowStep
                  key={step.id}
                  step={step}
                  index={index}
                  total={FLOW_A_STEPS.length}
                />
              ))}
            </div>
          </div>

          <div className="border-border-subtle border-t" />

          {/* ── B. 멘토링 신청 플로우 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-25">
              B. 멘토링 신청 플로우 (멘티 → 멘토)
            </p>
            <p className="font-designer-13r text-text-subtle mb-150">
              멘티가 상담을 신청하고 결제 확인·수락·세션·후기까지 이어지는 전체 흐름입니다.
            </p>
            <div className="flex flex-col">
              {FLOW_B_STEPS.map((step, index) => (
                <FlowStep
                  key={step.id}
                  step={step}
                  index={index}
                  total={FLOW_B_STEPS.length}
                />
              ))}
            </div>
          </div>

          <div className="border-border-subtle border-t" />

          {/* ── C. 상담 방식 비교 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-25">
              C. 상담 방식별 차이점
            </p>
            <p className="font-designer-13r text-text-subtle mb-150">
              <EnumChip value="MentoringMethodType" color="gray" /> 기준.
              쪽지(note)는 세션이 생성되지 않아 플로우가 짧습니다.
            </p>
            <div className="rounded-100 border-border-subtle overflow-hidden border">
              <table className="w-full">
                <thead className="bg-background-neutral-subtle">
                  <tr>
                    {['값 (enum)', '한국어 표기', '일정', '세션 생성', '후기 가능 시점', '비고'].map((h) => (
                      <th key={h} className="font-designer-13m text-text-default px-150 py-100 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { value: 'note', label: '쪽지', schedule: '없음 (비동기)', session: '미생성', reviewTiming: '수락 즉시', note: '입금확인 → 수락 → 후기' },
                    { value: 'phone', label: '15분 전화', schedule: '날짜·시간', session: 'SCHEDULED 생성', reviewTiming: '세션 종료 후', note: '입금확인 → 수락+일정 → 세션 → 후기' },
                    { value: 'online', label: '온라인 화상', schedule: '날짜·시간', session: 'SCHEDULED 생성', reviewTiming: '세션 종료 후', note: '30분 / 60분 선택' },
                    { value: 'offline', label: '대면', schedule: '날짜·시간·장소', session: 'SCHEDULED 생성', reviewTiming: '세션 종료 후', note: '30분 / 60분 / 90분 선택' },
                  ].map((row, i, arr) => (
                    <tr key={row.value} className={i < arr.length - 1 ? 'border-b-border-subtle border-b' : ''}>
                      <td className="px-150 py-100">
                        <EnumChip value={row.value} color="gray" />
                      </td>
                      <td className="font-designer-13r text-text-default px-150 py-100">{row.label}</td>
                      <td className="font-designer-13r text-text-default px-150 py-100">{row.schedule}</td>
                      <td className="font-designer-13r text-text-default px-150 py-100">{row.session}</td>
                      <td className="font-designer-13r text-text-default px-150 py-100">{row.reviewTiming}</td>
                      <td className="font-designer-13r text-text-subtle px-150 py-100">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-border-subtle border-t" />

          {/* ── D. 상태 코드 사전 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-25">
              D. 상태 코드 사전 (Enum 정의)
            </p>
            <p className="font-designer-13r text-text-subtle mb-150">
              코드베이스에서 사용하는 모든 상태 타입과 각 값의 정의입니다.
              각 타입명은 실제 TypeScript 타입과 1:1 대응합니다.
            </p>
            <div className="flex flex-col gap-200">
              {ENUM_GROUPS.map((group) => (
                <div key={group.id} className="rounded-100 border-border-subtle overflow-hidden border">
                  <div className="bg-background-neutral-subtle border-border-subtle border-b px-150 py-100">
                    <div className="flex flex-wrap items-center gap-100">
                      <code className="font-designer-13b text-text-default">
                        {group.typeName}
                      </code>
                      <span className="font-designer-13m text-text-subtle">
                        — {group.title}
                      </span>
                    </div>
                    <p className="font-designer-12r text-text-subtlest mt-25">
                      {group.desc}
                    </p>
                  </div>
                  <table className="w-full">
                    <thead className="bg-background-neutral-subtle border-border-subtle border-b">
                      <tr>
                        <th className="font-designer-12m text-text-subtle px-150 py-75 text-left w-[160px]">값</th>
                        <th className="font-designer-12m text-text-subtle px-150 py-75 text-left w-[80px]">라벨</th>
                        <th className="font-designer-12m text-text-subtle px-150 py-75 text-left">정의</th>
                        <th className="font-designer-12m text-text-subtle px-150 py-75 text-left w-[160px]">설정 주체</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.values.map((v, i, arr) => (
                        <tr
                          key={v.value}
                          className={i < arr.length - 1 ? 'border-b-border-subtle border-b' : ''}
                        >
                          <td className="px-150 py-100">
                            <EnumChip value={v.value} color={v.color} />
                          </td>
                          <td className="font-designer-13r text-text-default px-150 py-100">
                            {v.label}
                          </td>
                          <td className="font-designer-13r text-text-default px-150 py-100">
                            {v.definition}
                          </td>
                          <td className="font-designer-12r text-text-subtle px-150 py-100">
                            {v.setter}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          <div className="border-border-subtle border-t" />

          {/* ── E. 빠른 테스트 링크 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-25">
              E. 빠른 테스트 링크
            </p>
            <p className="font-designer-13r text-text-subtle mb-150">
              오른쪽 상단 <strong>목데이터 넣기</strong> 버튼을 먼저 누른 뒤 아래 링크로 각 화면을 테스트하세요.
            </p>
            <div className="flex flex-wrap gap-100">
              <Link href="/mentoring">
                <Button size="small" color="outlined">멘토 목록</Button>
              </Link>
              {firstMentorId !== null && (
                <Link href={`/mentoring/${firstMentorId}`}>
                  <Button size="small" color="outlined">
                    멘토 상세 (#{firstMentorId})
                  </Button>
                </Link>
              )}
              {firstMentorId !== null && (
                <Link href={`/mentoring/${firstMentorId}/apply`}>
                  <Button size="small" color="outlined">
                    멘토링 신청 (#{firstMentorId})
                  </Button>
                </Link>
              )}
              <Link href="/mentoring/become-mentor">
                <Button size="small" color="outlined">멘토 지원 폼</Button>
              </Link>
              <Link href="/mentoring-management">
                <Button size="small" color="outlined">멘토링 관리 (멘토 뷰)</Button>
              </Link>
              <Link href="/admin/mentoring/mentor-applications">
                <Button size="small" color="outlined">멘토 심사 (관리자)</Button>
              </Link>
              <Link href="/admin/mentoring/sessions">
                <Button size="small" color="outlined">신청/일정 현황 (관리자)</Button>
              </Link>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
