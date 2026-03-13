'use client';

import { ExternalLink, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import type { CurriculumSummaryDto } from '@/api/openapi';
import LoginModal from '@/components/common/modals/login-modal';
import PhoneVerificationModal from '@/components/common/modals/phone-verification-modal';
import Tooltip from '@/components/common/ui/tooltip';
import { useAuthReady } from '@/hooks/common/use-auth';

const FIRST_WEEK = 1;

interface CurriculumSummarySectionProps {
  curriculumSummary: CurriculumSummaryDto[];
  canAccessAll?: boolean;
}

export default function CurriculumSummarySection({
  curriculumSummary,
  canAccessAll = true,
}: CurriculumSummarySectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthReady();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const loginTriggerRef = useRef<HTMLButtonElement>(null);

  if (!curriculumSummary?.length) return null;

  const handleClickCurriculum = (id: number) => {
    router.push(`${pathname}?tab=mission&missionId=${id}`);
  };

  const handleLockedClick = () => {
    if (!isAuthenticated) {
      loginTriggerRef.current?.click();
    } else {
      setIsPhoneModalOpen(true);
    }
  };

  return (
    <div className="rounded-150 flex w-[335px] flex-col border border-[#D5D7DA] px-300 py-400">
      <div className="mb-300 flex items-center gap-100">
        <p className="font-designer-20b">커리큘럼 요약</p>
        <span className="font-designer-16r text-[#A4A7AE]">
          {curriculumSummary.length}주
        </span>
      </div>

      <div className="flex flex-col gap-150">
        {curriculumSummary.map((item) => {
          const isLocked = !canAccessAll && (item.weekNum ?? 0) > FIRST_WEEK;

          if (isLocked) {
            return (
              <Tooltip
                delayDuration={0}
                key={item.missionId}
                trigger={
                  <div
                    className="rounded-100 flex items-center cursor-not-allowed gap-150 border border-[#E9EAEB] bg-fill-neutral-subtle-default p-300 opacity-80 transition-colors"
                    onClick={handleLockedClick}
                  >
                    <span className="font-designer-15m w-250 shrink-0 text-center text-[#A4A7AE]">
                      {item.weekNum}
                    </span>
                    <span className="font-designer-15m text-text-default flex-1 leading-snug">
                      {item.title}
                    </span>
                    <Lock className="h-225 w-225 shrink-0 text-[#A4A7AE]" />
                  </div>
                }
                value="스터디 가입 후 확인 가능"
                side="bottom"
                contentClassName="font-designer-12m rounded-100 bg-background-neutral-strong whitespace-nowrap px-200 shadow-lg"
              />
            );
          }

          return (
            <div
              key={item.missionId}
              className="rounded-100 flex items-center gap-150 border border-[#E9EAEB] px-200 py-300"
            >
              <span className="font-designer-15m w-250 shrink-0 text-center text-[#A4A7AE]">
                {item.weekNum}
              </span>
              <span className="font-designer-15m text-text-default flex-1 leading-snug">
                {item.title}
              </span>
              <ExternalLink
                onClick={() => handleClickCurriculum(item.missionId)}
                className="h-225 w-225 shrink-0 cursor-pointer text-[#A4A7AE]"
              />
            </div>
          );
        })}
      </div>

      <LoginModal
        openTrigger={
          <button
            ref={loginTriggerRef}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
        }
      />
      <PhoneVerificationModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </div>
  );
}
