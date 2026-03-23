'use client';

import {
  Info,
  Lock,
  MessageCircle,
  Monitor,
  Phone,
  RotateCcw,
  Users,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import {
  formatWon,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  getMentorPublicReadiness,
  MENTOR_APPLY_UNSUPPORTED_MESSAGE,
} from '@/features/mentoring/model/mentor-public-readiness';
import MentorProfileMetaList from '@/features/mentoring/ui/common/mentor-profile-meta-list';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  MentorProfile,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import ReviewStars from './review-stars';

interface MentorDetailSidebarCtaProps {
  mentor: MentorProfile;
  appealLine: string;
  companyLabel: string;
  jobTitleLabel: string;
  careerLabel: string;
  metMenteeCount?: number;
  displayReviewCount: number;
  enabledMethods: MentoringMethodType[];
  selectedMethod: MentoringMethodType;
  selectedOption: MentoringMethodOption;
  onSelectMethod: (method: MentoringMethodType) => void;
  previewMode?: boolean;
  detailLocked?: boolean;
}

const methodSmallIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-16 w-16" />,
  simple: <Phone className="h-16 w-16" />,
  deep: <Monitor className="h-16 w-16" />,
  offline: <Users className="h-16 w-16" />,
};

export default function MentorDetailSidebarCta({
  mentor,
  appealLine,
  companyLabel,
  jobTitleLabel,
  careerLabel,
  metMenteeCount,
  displayReviewCount,
  enabledMethods,
  selectedMethod,
  selectedOption,
  onSelectMethod,
  previewMode,
  detailLocked = false,
}: MentorDetailSidebarCtaProps) {
  const { showToast } = useToastStore();
  const publicReadiness = getMentorPublicReadiness(mentor);
  const isApplicationReady = publicReadiness.isApplicationReady;
  const shouldShowMethodSelection = !detailLocked && enabledMethods.length > 0;
  const acceptancePolicy =
    selectedMethod === 'note'
      ? {
          title: '쪽지상담 수락 정책',
          description:
            '결제 완료 후 멘토의 첫 답장이 수락으로 처리됩니다. 별도 수락 단계 없이 바로 진행됩니다.',
        }
      : {
          title: '예약형 상담 수락 정책',
          description:
            '결제 후 멘토가 48시간 내 수락/거절을 결정합니다. 48시간 내 응답이 없으면 자동 거절되며, 멘토는 거절 사유를 남길 수 있습니다.',
        };

  return (
    <div className="rounded-200 border-border-subtle bg-background-default shadow-1 overflow-hidden border">
      <div className="border-border-subtle border-b px-250 pt-250 pb-200">
        <div className="flex items-start gap-225">
          <Avatar image={mentor.imageUrl} alt={mentor.nickname} size={80} />
          <div className="min-w-0 flex-1">
            <p className="font-designer-18b text-text-strong">
              {mentor.nickname}
            </p>
            <MentorProfileMetaList
              variant="sidebar"
              appealLine={appealLine}
              companyLabel={companyLabel}
              jobTitleLabel={jobTitleLabel}
              careerLabel={careerLabel}
              className="mt-75"
            />
          </div>
        </div>
        <div className="mt-125 flex flex-col gap-75">
          <div className="flex items-center gap-75">
            <ReviewStars rating={mentor.rating} />
            <span className="font-designer-13b text-text-strong">
              {mentor.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-75">
            <span className="font-designer-14b text-text-subtle">
              리뷰 {displayReviewCount}개
            </span>
            <span className="font-designer-12r text-text-subtlest">|</span>
            {metMenteeCount !== undefined && (
              <>
                <span className="font-designer-14b text-text-subtle">
                  만난 멘티 {metMenteeCount}명
                </span>
                <span className="font-designer-12r text-text-subtlest">|</span>
              </>
            )}
            <span className="font-designer-14b text-text-subtle">
              멘토링 {mentor.mentoringCount}건
            </span>
          </div>
        </div>
      </div>

      {shouldShowMethodSelection ? (
        <>
          <div className="border-border-subtle border-b p-250">
            <p className="font-designer-12r text-text-subtlest mb-150">
              상담 방식을 선택하세요
            </p>
            <div className="flex flex-col gap-100">
              {enabledMethods.map((method) => {
                const option = mentor.methods[method];
                const isSelected = selectedMethod === method;

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onSelectMethod(method)}
                    aria-pressed={isSelected}
                    style={
                      previewMode === true
                        ? { pointerEvents: 'auto' }
                        : undefined
                    }
                    className={cn(
                      'rounded-150 flex w-full items-center justify-between border px-150 py-150 text-left transition-colors',
                      isSelected
                        ? 'border-border-brand bg-fill-brand-subtle-default'
                        : 'border-border-subtle bg-background-default hover:border-border-default hover:bg-background-alternative',
                    )}
                  >
                    <div className="flex items-center gap-75">
                      <span
                        className={cn(
                          'text-text-subtle shrink-0',
                          isSelected && 'text-text-brand',
                        )}
                      >
                        {methodSmallIconMap[method]}
                      </span>
                      <div>
                        <p className="font-designer-13b text-text-default">
                          {getMethodLabel(method)}
                        </p>
                        <p className="font-designer-11r text-text-subtlest">
                          {option.durationLabel}
                        </p>
                      </div>
                    </div>
                    <p className="font-designer-14b text-text-strong">
                      {formatWon(option.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-250">
            <div className="mb-200">
              <p className="font-designer-12r text-text-subtlest mb-75">
                {selectedOption.label} · {selectedOption.durationLabel}
              </p>
              <p className="font-designer-22b text-text-strong">
                {formatWon(selectedOption.price)}
              </p>
            </div>

            <Button
              color={isApplicationReady ? 'primary' : 'secondary'}
              size="large"
              className="mb-200 w-full"
              onClick={(event) => {
                event.preventDefault();

                if (previewMode === true || !isApplicationReady) {
                  return;
                }

                showToast(MENTOR_APPLY_UNSUPPORTED_MESSAGE, 'error');
              }}
              disabled={!isApplicationReady}
            >
              {!isApplicationReady && (
                <Lock className="mr-75 h-16 w-16 shrink-0" />
              )}
              {publicReadiness.ctaLabel}
            </Button>

            {!isApplicationReady && (
              <div className="mb-150 flex items-start gap-75">
                <Info className="text-text-subtlest mt-[2px] h-14 w-14 shrink-0" />
                <p className="font-designer-12r text-text-subtlest leading-relaxed">
                  {publicReadiness.applyUnavailableMessage}
                </p>
              </div>
            )}

            <div className="mb-150 flex items-start gap-75">
              <Info className="text-text-subtlest mt-[2px] h-14 w-14 shrink-0" />
              <div>
                <p className="font-designer-12b text-text-subtle mb-25">
                  {acceptancePolicy.title}
                </p>
                <p className="font-designer-11r text-text-subtlest leading-relaxed">
                  {acceptancePolicy.description}
                </p>
              </div>
            </div>

            <div className="border-border-subtlest border-t pt-150">
              <div className="flex items-center justify-center gap-75">
                <RotateCcw className="text-text-subtlest h-12 w-12 shrink-0" />
                <p className="font-designer-11r text-text-subtlest leading-relaxed">
                  멘토링 시작 120시간 전까지 전액 환불 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-250">
          <div className="rounded-150 border-border-subtle bg-background-alternative mb-200 border px-200 py-175">
            <p className="font-designer-14b text-text-default mb-50">
              {detailLocked
                ? publicReadiness.detailOverlayTitle
                : publicReadiness.applyUnavailableTitle}
            </p>
            <p className="font-designer-12r text-text-subtle leading-relaxed">
              {detailLocked
                ? publicReadiness.detailOverlayDescription
                : publicReadiness.applyUnavailableMessage}
            </p>
          </div>

          <Button color="secondary" size="large" className="w-full" disabled>
            <Lock className="mr-75 h-16 w-16 shrink-0" />
            {publicReadiness.ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
