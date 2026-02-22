'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';

// ──────────────────────────────────────────
// [임시] 멘토링 플로우 정의 & 테스트 안내
// 디자인 확정 후 제거 예정
// ──────────────────────────────────────────

const FLOW_A_STEPS = [
  {
    id: 'a1',
    label: '① 멘토 지원',
    desc: '멘티/일반 사용자가 /mentoring/become-mentor 페이지에서 멘토 등록 폼 작성·제출',
    badge: 'PENDING',
    badgeColor: 'orange',
    testLink: '/mentoring/become-mentor',
    testLabel: '멘토 등록 페이지 열기',
  },
  {
    id: 'a2',
    label: '② 관리자 심사 시작',
    desc: '관리자가 신청서를 확인하고 IN_REVIEW로 전환. 추가 서류/인터뷰 진행 가능',
    badge: 'IN_REVIEW',
    badgeColor: 'purple',
    testLink: '/admin/mentoring/mentor-applications',
    testLabel: '멘토 심사 화면 이동',
  },
  {
    id: 'a3',
    label: '③ 승인 / 거절',
    desc: 'APPROVED → 멘토로 활동 가능(운영 상태 OPEN 전환). REJECTED → 거절 사유 전달',
    badge: 'APPROVED / REJECTED',
    badgeColor: 'green',
    testLink: '/admin/mentoring/mentor-applications',
    testLabel: '심사 결정 화면 이동',
  },
  {
    id: 'a4',
    label: '④ 멘토 운영 시작',
    desc: '승인된 멘토는 운영 상태가 OPEN으로 설정됨. 이후 REQUESTS_PAUSED / SUSPENDED 전환 가능',
    badge: 'OPEN',
    badgeColor: 'green',
    testLink: '/admin/mentoring/mentor-operations',
    testLabel: '멘토 운영 정보 이동',
  },
];

const FLOW_B_STEPS = [
  {
    id: 'b1',
    label: '① 멘티 신청',
    desc: '/mentoring/[id]/apply 에서 상담 방식·메시지·희망 날짜(예약형) 입력. 수동 이체 메모 작성 후 제출',
    badge: 'PENDING + PENDING_TRANSFER',
    badgeColor: 'orange',
    testLink: '/mentoring',
    testLabel: '멘토 목록 열기',
  },
  {
    id: 'b2',
    label: '② 멘티 입금 → 멘토 입금 확인',
    desc: '멘티가 계좌이체 후 메모 남김. 멘토가 멘토링 관리 화면에서 "입금 확인" 처리 → CONFIRMED',
    badge: 'PENDING_TRANSFER → CONFIRMED',
    badgeColor: 'blue',
    testLink: '/mentoring-management',
    testLabel: '멘토링 관리 화면 열기',
  },
  {
    id: 'b3',
    label: '③ 멘토 수락 + 일정 확정 (예약형)',
    desc: '입금 확인 후 멘토가 수락. 쪽지는 일정 없이 즉시 ACCEPTED. 전화·온라인·대면은 날짜/시간/장소 확정 후 SCHEDULED 세션 생성',
    badge: 'ACCEPTED + SCHEDULED',
    badgeColor: 'green',
    testLink: '/mentoring-management',
    testLabel: '멘토링 관리 화면 열기',
  },
  {
    id: 'b4',
    label: '④ 세션 진행 (예약형만)',
    desc: '약속 일시가 지나면 자동으로 완료 가능 상태가 됨. 멘토가 COMPLETED 처리 또는 사유 입력 후 CANCELLED',
    badge: 'COMPLETED / CANCELLED',
    badgeColor: 'blue',
    testLink: '/admin/mentoring/sessions',
    testLabel: '신청/일정 현황 이동',
  },
  {
    id: 'b5',
    label: '⑤ 멘티 후기 작성',
    desc: '쪽지: 수락 직후 후기 가능. 예약형: 세션 종료 이후 후기 가능. 별점(1~5) + 추천 여부 + 텍스트(10자 이상)',
    badge: '후기 완료',
    badgeColor: 'indigo',
    testLink: '/mentoring-management',
    testLabel: '멘티 후기 화면 열기',
  },
];

const METHOD_ROWS = [
  {
    method: '쪽지 (note)',
    schedule: '없음 (비동기)',
    payment: '수동 이체',
    reviewTiming: '수락 즉시',
    note: '입금확인 → 수락 → 후기',
  },
  {
    method: '15분 전화 (phone)',
    schedule: '날짜·시간 지정',
    payment: '수동 이체',
    reviewTiming: '전화 종료 후',
    note: '입금확인 → 수락+일정 → 세션 → 후기',
  },
  {
    method: '온라인 화상 (online)',
    schedule: '날짜·시간 지정',
    payment: '수동 이체',
    reviewTiming: '화상 종료 후',
    note: '30분 / 60분 선택 가능',
  },
  {
    method: '대면 (offline)',
    schedule: '날짜·시간·장소',
    payment: '수동 이체',
    reviewTiming: '대면 종료 후',
    note: '30분 / 60분 / 90분 선택 가능',
  },
];

const BADGE_COLOR_MAP: Record<string, string> = {
  orange: 'bg-background-accent-orange-subtle text-text-accent-orange',
  purple: 'bg-background-accent-purple-subtle text-text-accent-purple',
  green: 'bg-background-accent-green-subtle text-text-accent-green',
  blue: 'bg-background-accent-blue-subtle text-text-accent-blue',
  indigo: 'bg-background-accent-indigo-subtle text-text-accent-indigo',
};

function StatusChip({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className={`rounded-50 font-designer-12b inline-block px-75 py-25 ${BADGE_COLOR_MAP[color] ?? ''}`}
    >
      {label}
    </span>
  );
}

function FlowStep({
  step,
  index,
  total,
}: {
  step: (typeof FLOW_A_STEPS)[number];
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
        <div className="flex flex-wrap items-center gap-75">
          <p className="font-designer-14b text-text-default">{step.label}</p>
          <StatusChip label={step.badge} color={step.badgeColor} />
        </div>
        <p className="font-designer-13r text-text-subtle mt-50">{step.desc}</p>
        <Link href={step.testLink} className="mt-75 inline-block">
          <Button size="small" color="outlined">
            {step.testLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

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
            [임시] 멘토링 플로우 & 테스트 가이드
          </p>
          <span className="rounded-50 font-designer-12b bg-background-accent-orange-subtle text-text-accent-orange px-75 py-25">
            디자인 완료 후 제거
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          {isOpen ? '접기 ▲' : '펼치기 ▼'}
        </span>
      </button>

      {isOpen && (
        <div className="border-border-subtle flex flex-col gap-300 border-t p-200">
          {/* ── 플로우 A: 멘토 등록 ── */}
          <div>
            <div className="mb-150">
              <p className="font-designer-15b text-text-default">
                A. 멘토 등록 플로우
              </p>
              <p className="font-designer-13r text-text-subtle mt-25">
                일반 사용자가 멘토로 지원하고 관리자 심사를 거쳐 활동하는 전체
                흐름입니다.
              </p>
            </div>
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

          {/* ── 구분선 ── */}
          <div className="border-border-subtle border-t" />

          {/* ── 플로우 B: 멘토링 신청 ── */}
          <div>
            <div className="mb-150">
              <p className="font-designer-15b text-text-default">
                B. 멘토링 신청 플로우 (멘티 → 멘토)
              </p>
              <p className="font-designer-13r text-text-subtle mt-25">
                멘티가 멘토에게 상담을 신청하고 수락·세션 진행·후기 작성까지의
                전체 흐름입니다.
              </p>
            </div>
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

          {/* ── 구분선 ── */}
          <div className="border-border-subtle border-t" />

          {/* ── 상담 방식 비교표 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-150">
              C. 상담 방식별 차이점
            </p>
            <div className="rounded-100 border-border-subtle overflow-hidden border">
              <table className="w-full">
                <thead className="bg-background-neutral-subtle">
                  <tr>
                    <th className="font-designer-13m text-text-default px-150 py-100 text-left">
                      방식
                    </th>
                    <th className="font-designer-13m text-text-default px-150 py-100 text-left">
                      일정
                    </th>
                    <th className="font-designer-13m text-text-default px-150 py-100 text-left">
                      결제
                    </th>
                    <th className="font-designer-13m text-text-default px-150 py-100 text-left">
                      후기 가능 시점
                    </th>
                    <th className="font-designer-13m text-text-default px-150 py-100 text-left">
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {METHOD_ROWS.map((row, index) => (
                    <tr
                      key={row.method}
                      className={
                        index < METHOD_ROWS.length - 1
                          ? 'border-b-border-subtle border-b'
                          : ''
                      }
                    >
                      <td className="font-designer-13b text-text-default px-150 py-100">
                        {row.method}
                      </td>
                      <td className="font-designer-13r text-text-default px-150 py-100">
                        {row.schedule}
                      </td>
                      <td className="font-designer-13r text-text-default px-150 py-100">
                        {row.payment}
                      </td>
                      <td className="font-designer-13r text-text-default px-150 py-100">
                        {row.reviewTiming}
                      </td>
                      <td className="font-designer-13r text-text-subtle px-150 py-100">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 구분선 ── */}
          <div className="border-border-subtle border-t" />

          {/* ── 빠른 테스트 링크 ── */}
          <div>
            <p className="font-designer-15b text-text-default mb-100">
              D. 빠른 테스트 링크
            </p>
            <p className="font-designer-13r text-text-subtle mb-150">
              목데이터 넣기 버튼을 먼저 누른 뒤 아래 링크로 각 화면을
              테스트하세요.
            </p>
            <div className="flex flex-wrap gap-100">
              <Link href="/mentoring">
                <Button size="small" color="outlined">
                  멘토 목록 (/mentoring)
                </Button>
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
                <Button size="small" color="outlined">
                  멘토 지원 폼
                </Button>
              </Link>
              <Link href="/mentoring-management">
                <Button size="small" color="outlined">
                  멘토링 관리 (멘토 뷰)
                </Button>
              </Link>
              <Link href="/admin/mentoring/mentor-applications">
                <Button size="small" color="outlined">
                  멘토 심사 (관리자)
                </Button>
              </Link>
              <Link href="/admin/mentoring/sessions">
                <Button size="small" color="outlined">
                  신청/일정 현황 (관리자)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
