'use client';

import { Info } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  MENTOR_PUBLIC_EXPOSURE_IDS,
  MENTOR_PUBLIC_EXPOSURE_ORDER,
  MENTOR_PUBLIC_EXPOSURE_POLICY,
  type MentorPublicExposureReadyState,
} from '@/features/mentoring/model/mentor-public-readiness-policy';

type PublicExposureStatus = 'pending' | 'ready' | 'hidden';

const PUBLIC_EXPOSURE_STATUS_META: Record<
  PublicExposureStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '작성 전',
    className: 'border-border-subtle bg-background-default text-text-subtle',
  },
  ready: {
    label: '가능',
    className:
      'border-border-brand bg-fill-brand-subtle-default text-text-brand',
  },
  hidden: {
    label: '비노출',
    className:
      'border-border-default bg-background-alternative text-text-subtle',
  },
};

function PublicExposureStatusBadge({
  status,
}: {
  status: PublicExposureStatus;
}) {
  const meta = PUBLIC_EXPOSURE_STATUS_META[status];

  return (
    <span
      className={cn(
        'font-designer-12b rounded-500 border px-100 py-25',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

interface PublicExposureGuideCardProps {
  listVisible: boolean;
  exposureReadyState: MentorPublicExposureReadyState;
}

export default function PublicExposureGuideCard({
  listVisible,
  exposureReadyState,
}: PublicExposureGuideCardProps) {
  const isListExposureReady =
    exposureReadyState[MENTOR_PUBLIC_EXPOSURE_IDS.listExposure];
  const summary = !isListExposureReady
    ? '기본정보와 멘토정보를 입력하면 저장 후 멘토링 목록에 준비중으로 먼저 노출됩니다.'
    : !listVisible
      ? '기본정보와 멘토정보는 완료됐지만 현재 목록 비노출 상태입니다. 목록 노출을 켜면 저장 후 준비중으로 노출됩니다.'
      : '지금 저장하면 멘토링 목록에 준비중으로 먼저 노출됩니다.';
  const items: Array<{
    key: string;
    title: string;
    description: string;
    status: PublicExposureStatus;
  }> = MENTOR_PUBLIC_EXPOSURE_ORDER.map((exposureId) => ({
    key: exposureId,
    title: MENTOR_PUBLIC_EXPOSURE_POLICY[exposureId].title,
    description: MENTOR_PUBLIC_EXPOSURE_POLICY[exposureId].description,
    status: !exposureReadyState[exposureId]
      ? 'pending'
      : listVisible
        ? 'ready'
        : 'hidden',
  }));

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-200 border px-150 py-150 sm:px-200 sm:py-175">
      <div className="flex items-start gap-100">
        <Info className="text-text-brand mt-25 h-16 w-16 shrink-0" />
        <div className="min-w-0">
          <p className="font-designer-13b text-text-default">공개 흐름 안내</p>
          <p className="font-designer-13r text-text-subtle mt-25 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
      <div className="mt-150 grid grid-cols-1 gap-100 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-150 border-border-subtle bg-background-alternative border px-150 py-150"
          >
            <div className="mb-75 flex items-center justify-between gap-100">
              <p className="font-designer-13b text-text-default">
                {item.title}
              </p>
              <PublicExposureStatusBadge status={item.status} />
            </div>
            <p className="font-designer-12r text-text-subtle leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
