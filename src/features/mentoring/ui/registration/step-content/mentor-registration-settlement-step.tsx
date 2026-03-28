'use client';

import { Info } from 'lucide-react';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import type { MentorRegistrationSettlementStepProps } from './mentor-registration-step-content.types';

export default function MentorRegistrationSettlementStep({
  stepFooter,
}: MentorRegistrationSettlementStepProps) {
  return (
    <FormSectionCard
      title={
        <span className="inline-flex items-center gap-75">
          <Info className="text-text-brand h-18 w-18" />
          정산정보 (추후 제공)
        </span>
      }
      description="정산정보 기능은 아직 제공하지 않습니다."
    >
      <div className="rounded-150 border-border-subtle bg-background-alternative border px-200 py-175">
        <div className="flex flex-col gap-75">
          <p className="font-designer-14b text-text-default">
            정산정보는 추후 제공 예정입니다.
          </p>
          <p className="font-designer-12r text-text-subtle">
            현재는 기본정보, 멘토정보, 멘토소개, 가격/시간, 스케줄설정까지
            저장할 수 있으며 정산정보 등록 기능은 아직 열려 있지 않습니다.
          </p>
          <p className="font-designer-12r text-text-subtle">
            멘티 신청 기능도 정산정보 지원과 함께 추후 제공될 예정입니다.
          </p>
        </div>
      </div>
      {stepFooter}
    </FormSectionCard>
  );
}
