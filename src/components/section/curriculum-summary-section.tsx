'use client';

import { ExternalLink, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef } from 'react';

import type { CurriculumSummaryDto } from '@/api/openapi';
import LoginModal from '@/components/common/modals/login-modal';
import Tooltip from '@/components/common/ui/tooltip';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useToastStore } from '@/stores/use-toast-store';

const FIRST_INDEX = 0;

interface CurriculumSummarySectionProps {
  curriculumSummary: CurriculumSummaryDto[];
  canAccessAll?: boolean;
  onLockedClick?: () => void;
}

export default function CurriculumSummarySection({
  curriculumSummary,
  canAccessAll = true,
  onLockedClick,
}: CurriculumSummarySectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthReady();
  const loginTriggerRef = useRef<HTMLButtonElement>(null);
  const showToast = useToastStore((state) => state.showToast);

  if (!curriculumSummary?.length) return null;

  const handleClickCurriculum = (id: number | undefined) => {
    if (!id) {
      showToast('미션 정보를 불러올 수 없습니다.', 'error');

      return;
    }
    router.push(`${pathname}?tab=mission&missionId=${id}`);
  };

  const handleLockedClick = () => {
    if (!isAuthenticated) {
      loginTriggerRef.current?.click();
    } else {
      onLockedClick?.();
    }
  };

  return (
    <div className="rounded-150 flex w-full flex-col border border-border-default px-300 py-400 lg:w-[335px]">
      <div className="mb-300 flex items-center gap-100">
        <p className="font-designer-20b">커리큘럼 요약</p>
        <span className="font-designer-16r text-text-subtlest">
          {curriculumSummary.length}주
        </span>
      </div>

      <div className="flex flex-col gap-150">
        {curriculumSummary
          .sort((a, b) => a.weekNum - b.weekNum)
          .map((item, index) => {
            // 스터디 멤버도 아니고 스터디 개설자도 아니며, 첫 번째 미션이 아닌 경우 잠금 처리
            const isLocked = !canAccessAll && index > FIRST_INDEX;

            if (isLocked) {
              return (
                <Tooltip
                  delayDuration={0}
                  key={item.missionId ?? index}
                  trigger={
                    <div
                      className="rounded-100 flex cursor-not-allowed items-center gap-150 border border-border-subtle px-200 py-300"
                      onClick={handleLockedClick}
                    >
                      <span className="font-designer-15m w-250 shrink-0 text-center text-text-subtlest">
                        {item.weekNum}
                      </span>
                      <span className="font-designer-15m text-text-default flex-1 leading-snug">
                        {item.title}
                      </span>
                      <Lock className="h-225 w-225 shrink-0 text-text-subtlest" />
                    </div>
                  }
                  value="스터디 가입하여 확인"
                  side="bottom"
                  contentClassName="font-designer-12m rounded-100 bg-background-neutral-strong whitespace-nowrap px-200 shadow-lg"
                />
              );
            }

            return (
              <div
                key={item.missionId ?? index}
                className="rounded-100 flex cursor-pointer items-center gap-150 border border-border-subtle px-200 py-300 hover:bg-fill-neutral-subtle-hover"
              >
                <span className="font-designer-15m w-250 shrink-0 text-center text-text-subtlest">
                  {item.weekNum}
                </span>
                <span className="font-designer-15m text-text-default flex-1 leading-snug">
                  {item.title}
                </span>
                <ExternalLink
                  onClick={() => handleClickCurriculum(item.missionId)}
                  className="h-225 w-225 shrink-0 cursor-pointer text-text-subtlest"
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
    </div>
  );
}
