'use client';

import { CircleCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import {
  getMentorDisplayTitle,
  getEnabledMentoringMethods,
  getMentorSettings,
} from '@/features/mentoring/model/mentor-profile-utils';
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

export default function MentorDetailPage({
  mentor,
  previewMode,
  showSettingsEditButton = false,
  highlightedSections,
}: MentorDetailPageProps) {
  const isHighlighted = (section: PreviewHighlightSection) =>
    previewMode === true && (highlightedSections?.includes(section) ?? false);
  const mentorSettings = getMentorSettings(mentor);
  const mentoringTitleLabel = getMentorDisplayTitle(mentor);
  const appealLine = mentorSettings.appealLine.trim();
  const jobGroupLabel = mentorSettings.jobGroup.trim();
  const jobTitleLabel = mentorSettings.jobTitle.trim();
  const careerLabel = mentorSettings.careerYears.trim();
  const companyCategoryLabel = mentorSettings.companyCategory.trim();
  const profileSummaryLine = Array.from(
    new Set(
      [jobGroupLabel, jobTitleLabel, careerLabel]
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  ).join(' · ');
  const headlineBadges: Array<{
    key: string;
    value: string;
    color: 'green' | 'gray';
  }> = [];

  if (appealLine.length > 0) {
    headlineBadges.push({
      key: 'appealLine',
      value: appealLine,
      color: 'green',
    });
  }

  if (companyCategoryLabel.length > 0 && companyCategoryLabel !== '기타') {
    headlineBadges.push({
      key: 'companyCategory',
      value: companyCategoryLabel,
      color: 'gray',
    });
  }

  const enabledMethods = useMemo(() => {
    return getEnabledMentoringMethods(mentor);
  }, [mentor]);
  const interviewQuestions = mentorSettings.interviewQuestions.filter(
    (question) => question.trim().length > 0,
  );
  const metMenteeCount = mentor.menteeCount ?? mentor.mentoringCount;

  const [selectedMethod, setSelectedMethod] = useState<MentoringMethodType>(
    enabledMethods[0] ?? 'note',
  );
  const selectedOption = mentor.methods[selectedMethod];

  return (
    <div
      className={cn(
        'mx-auto w-full px-200 py-300 sm:px-300',
        !previewMode && 'max-w-[1280px] sm:py-500 xl:px-400 xl:py-600',
        previewMode && 'py-400',
      )}
    >
      <div
        className={cn(
          'grid grid-cols-1 gap-500',
          !previewMode && 'xl:grid-cols-[1fr_360px]',
        )}
      >
        <div className="min-w-0">
          <MentorDetailHeaderSection
            mentor={mentor}
            mentoringTitleLabel={mentoringTitleLabel}
            profileSummaryLine={profileSummaryLine}
            metMenteeCount={metMenteeCount}
            previewMode={previewMode}
            showSettingsEditButton={showSettingsEditButton}
            isHeadlineHighlighted={isHighlighted('headline')}
          />

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
            <MentorMarkdownContent
              content={mentorSettings.detailedDescription}
              className="mb-250"
              emptyMessage="멘토 소개가 아직 등록되지 않았습니다."
            />
            <div className="mb-200 flex flex-wrap gap-100">
              {mentorSettings.skillTags.map((tag) => (
                <Badge key={tag} color="blue" shape="round">
                  #{tag}
                </Badge>
              ))}
            </div>
            {mentorSettings.mentoringTitle && (
              <div className="rounded-150 bg-background-alternative p-200">
                <p className="font-designer-13r text-text-subtle leading-relaxed">
                  {mentorSettings.mentoringTitle}
                </p>
              </div>
            )}
          </section>

          {interviewQuestions.length > 0 && (
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
                {interviewQuestions.map((question) => (
                  <li key={question} className="flex items-start gap-100">
                    <CircleCheck className="text-text-success mt-[2px] h-16 w-16 shrink-0" />
                    <span className="font-designer-14r text-text-default leading-relaxed">
                      {question}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <MentorDetailMethodSection
            mentor={mentor}
            enabledMethods={enabledMethods}
            isMethodsHighlighted={isHighlighted('methods')}
          />

          {mentorSettings.preNotice.trim() && (
            <section
              data-preview-section="notice"
              className={cn(
                'border-border-subtle mb-500 border-b pb-500',
                isHighlighted('notice') && 'preview-section-highlight',
              )}
            >
              <h2 className="font-designer-18b text-text-strong mb-200">
                멘토링 사전 안내
              </h2>
              <p className="font-designer-14r text-text-subtle leading-loose whitespace-pre-line">
                {mentorSettings.preNotice}
              </p>
            </section>
          )}

          <MentorDetailReviewSection mentor={mentor} />
        </div>

        <aside
          className={cn(
            'h-fit',
            !previewMode && 'lg:sticky lg:top-[88px] lg:self-start',
          )}
        >
          <MentorDetailSidebarCta
            mentor={mentor}
            profileSummaryLine={profileSummaryLine}
            metMenteeCount={metMenteeCount}
            enabledMethods={enabledMethods}
            selectedMethod={selectedMethod}
            selectedOption={selectedOption}
            onSelectMethod={setSelectedMethod}
            headlineBadges={headlineBadges}
          />
        </aside>
      </div>
    </div>
  );
}
