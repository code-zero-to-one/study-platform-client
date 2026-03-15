'use client';

import { CircleCheck } from 'lucide-react';
import {
  type CSSProperties,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  getMentorDisplayTitle,
  getEnabledMentoringMethods,
  getMentorSettings,
} from '@/features/mentoring/model/mentor-profile-utils';
import { getMentorPublicReadiness } from '@/features/mentoring/model/mentor-public-readiness';
import { useFloatingPanelScrollNudge } from '@/features/mentoring/model/use-floating-panel-scroll-nudge';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import { type MentorRegistrationPreviewHighlightSection } from '@/types/mentoring/registration-view';
import MentorDetailHeaderSection from './mentor-detail-header-section';
import MentorDetailMethodSection from './mentor-detail-method-section';
import MentorDetailReviewSection from './mentor-detail-review-section';
import MentorDetailSidebarCta from './mentor-detail-sidebar-cta';
import MentorMarkdownContent from '../common/mentoring-markdown-content';

type PreviewHighlightSection = MentorRegistrationPreviewHighlightSection;

interface MentorDetailPageProps {
  mentor: MentorProfile;
  previewMode?: boolean;
  showSettingsEditButton?: boolean;
  highlightedSections?: PreviewHighlightSection[];
}

const DETAIL_SIDEBAR_TOP_OFFSET = 108;
const DETAIL_SIDEBAR_BOTTOM_OFFSET = 32;

interface MentorDetailPreparingSectionProps {
  title: string;
  description: string;
}

function MentorDetailPreparingSection({
  title,
  description,
}: MentorDetailPreparingSectionProps) {
  return (
    <div className="rounded-150 border-border-subtle bg-background-alternative border px-250 py-225">
      <p className="font-designer-14b text-text-default mb-50">{title}</p>
      <p className="font-designer-13r text-text-subtle leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function MentorDetailPage({
  mentor,
  previewMode,
  showSettingsEditButton = false,
  highlightedSections,
}: MentorDetailPageProps) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const sidebarPanelRef = useRef<HTMLDivElement>(null);
  const [sidebarViewportRightGap, setSidebarViewportRightGap] = useState(0);
  const isHighlighted = (section: PreviewHighlightSection) =>
    previewMode === true && (highlightedSections?.includes(section) ?? false);
  const mentorSettings = getMentorSettings(mentor);
  const publicReadiness = getMentorPublicReadiness(mentor);
  const shouldBlurDetailContent =
    previewMode !== true && !publicReadiness.isDetailReady;
  const mentoringTitleLabel = getMentorDisplayTitle(mentor);
  const appealLine = mentorSettings.appealLine.trim();
  const companyLabel =
    mentor.company.trim() ||
    (mentorSettings.hideCompanyName ? '' : mentorSettings.companyName.trim());
  const jobTitleLabel = mentorSettings.jobTitle.trim();
  const careerLabel = mentorSettings.careerYears.trim();
  const careerEntries = mentorSettings.careerEntries;

  const enabledMethods = useMemo(() => {
    return getEnabledMentoringMethods(mentor);
  }, [mentor]);
  const interviewQuestions = mentorSettings.interviewQuestions.filter(
    (question) => question.trim().length > 0,
  );
  const visibleSkillTags = Array.from(
    new Set(
      mentorSettings.skillTags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  );
  const deferredDetailedDescription = useDeferredValue(
    mentorSettings.detailedDescription,
  );
  const previewDetailedDescription =
    previewMode === true
      ? deferredDetailedDescription
      : mentorSettings.detailedDescription;
  const metMenteeCount =
    typeof mentor.menteeCount === 'number' ? mentor.menteeCount : undefined;
  const displayReviewCount = Math.max(
    mentor.reviewCount,
    mentor.reviews.length,
  );

  useFloatingPanelScrollNudge({
    enabled: previewMode !== true,
    panelRef: sidebarPanelRef,
    cssVariableName: '--panel-translate-y',
    maxOffset: 18,
    minOffset: 0,
    responseRatio: 0.28,
    targetDamping: 0.76,
    smoothing: 0.26,
    idleThreshold: 0.12,
  });

  const [selectedMethod, setSelectedMethod] = useState<MentoringMethodType>(
    enabledMethods[0] ?? 'note',
  );

  useEffect(() => {
    if (enabledMethods.includes(selectedMethod)) {
      return;
    }

    setSelectedMethod(enabledMethods[0] ?? 'note');
  }, [enabledMethods, selectedMethod]);

  const activeSelectedMethod = enabledMethods.includes(selectedMethod)
    ? selectedMethod
    : (enabledMethods[0] ?? 'note');
  const selectedOption = mentor.methods[activeSelectedMethod];

  useEffect(() => {
    if (previewMode === true) {
      setSidebarViewportRightGap(0);

      return;
    }

    const syncSidebarViewportRightGap = () => {
      const layoutRect = layoutRef.current?.getBoundingClientRect();

      if (!layoutRect) {
        setSidebarViewportRightGap(0);

        return;
      }

      setSidebarViewportRightGap(
        Math.max(0, Math.floor(window.innerWidth - layoutRect.right)),
      );
    };

    syncSidebarViewportRightGap();
    window.addEventListener('resize', syncSidebarViewportRightGap);

    return () =>
      window.removeEventListener('resize', syncSidebarViewportRightGap);
  }, [previewMode]);

  return (
    <div
      ref={layoutRef}
      className={cn(
        'mx-auto w-full px-200 py-300 sm:px-300',
        !previewMode && 'max-w-page sm:py-500 xl:px-400 xl:py-600',
        previewMode && 'py-400',
      )}
      style={
        previewMode
          ? undefined
          : ({
              '--panel-right-offset': `${sidebarViewportRightGap}px`,
              '--panel-top-offset': `${DETAIL_SIDEBAR_TOP_OFFSET}px`,
              '--panel-height': `calc(100dvh - ${DETAIL_SIDEBAR_TOP_OFFSET + DETAIL_SIDEBAR_BOTTOM_OFFSET}px)`,
            } as CSSProperties)
      }
    >
      <div
        className={cn(
          'grid grid-cols-1 gap-500',
          !previewMode && 'xl:grid-cols-content-sidebar-360',
        )}
      >
        <div className="min-w-0">
          <MentorDetailHeaderSection
            mentor={mentor}
            mentoringTitleLabel={mentoringTitleLabel}
            appealLine={appealLine}
            companyLabel={companyLabel}
            jobTitleLabel={jobTitleLabel}
            careerLabel={careerLabel}
            careerEntries={careerEntries}
            careerHistory={mentor.careerHistory}
            metMenteeCount={metMenteeCount}
            displayReviewCount={displayReviewCount}
            previewMode={previewMode}
            showSettingsEditButton={showSettingsEditButton}
            isHeadlineHighlighted={isHighlighted('headline')}
          />

          <>
            <section
              data-preview-section="description"
              className={cn(
                'border-border-subtle mb-500 border-b pb-500',
                isHighlighted('description') && 'preview-section-highlight',
              )}
            >
              <h2 className="font-designer-18b text-text-strong mb-200">
                멘토 소개
              </h2>
              {shouldBlurDetailContent ? (
                <MentorDetailPreparingSection
                  title={publicReadiness.detailOverlayTitle}
                  description={publicReadiness.detailOverlayDescription}
                />
              ) : (
                <MentorMarkdownContent
                  content={previewDetailedDescription}
                  className="mb-250"
                  emptyMessage="멘토 소개가 아직 등록되지 않았습니다."
                />
              )}
              <div className="mt-250 flex flex-wrap gap-100">
                {visibleSkillTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-background-accent-rose-subtle text-background-accent-rose-strong inline-flex min-w-300 items-center justify-center gap-25 whitespace-nowrap rounded-full px-100 py-50 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>

            {!shouldBlurDetailContent && interviewQuestions.length > 0 && (
              <section
                data-preview-section="interview"
                className={cn(
                  'border-border-subtle mb-500 border-b pb-500',
                  isHighlighted('interview') && 'preview-section-highlight',
                )}
              >
                <h2 className="font-designer-18b text-text-strong mb-200">
                  상담 전 준비사항
                </h2>
                <ul className="flex flex-col gap-100">
                  {interviewQuestions.map((question, index) => (
                    <li
                      key={`${question}-${index}`}
                      className="flex items-start gap-100"
                    >
                      <CircleCheck className="text-text-success mt-25 h-16 w-16 shrink-0" />
                      <span className="font-designer-14r text-text-default leading-relaxed">
                        {question}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!shouldBlurDetailContent && (
              <MentorDetailMethodSection
                mentor={mentor}
                enabledMethods={enabledMethods}
                isMethodsHighlighted={isHighlighted('methods')}
              />
            )}

            <MentorDetailReviewSection
              mentor={mentor}
              displayReviewCount={displayReviewCount}
            />
          </>
        </div>

        <aside className={cn('h-fit', !previewMode && 'xl:self-start')}>
          <div
            ref={sidebarPanelRef}
            className={cn(
              !previewMode &&
                'xl:fixed xl:top-panel-offset xl:right-panel-offset xl:z-10 xl:h-panel-height xl:w-360 xl:overflow-hidden xl:transition-none xl:will-change-transform xl:translate-y-panel',
            )}
            style={
              previewMode
                ? undefined
                : ({
                    '--panel-translate-y': '0px',
                  } as CSSProperties)
            }
          >
            <div
              className={cn(
                !previewMode &&
                  'xl:h-full xl:overflow-y-auto xl:overscroll-contain',
              )}
            >
              <MentorDetailSidebarCta
                mentor={mentor}
                appealLine={appealLine}
                companyLabel={companyLabel}
                jobTitleLabel={jobTitleLabel}
                careerLabel={careerLabel}
                metMenteeCount={metMenteeCount}
                displayReviewCount={displayReviewCount}
                enabledMethods={enabledMethods}
                selectedMethod={activeSelectedMethod}
                selectedOption={selectedOption}
                onSelectMethod={setSelectedMethod}
                previewMode={previewMode}
                detailLocked={shouldBlurDetailContent}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
