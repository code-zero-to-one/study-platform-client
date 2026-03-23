'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import MentorProfileMetaList from '@/features/mentoring/ui/common/mentor-profile-meta-list';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentorCareerEntry } from '@/types/mentoring/settings';
import MentorCareerHistoryPanel from './mentor-career-history-panel';
import ReviewStars from './review-stars';

interface MentorDetailHeaderSectionProps {
  mentor: MentorProfile;
  mentoringTitleLabel: string;
  appealLine: string;
  companyLabel: string;
  jobTitleLabel: string;
  careerLabel: string;
  careerEntries: MentorCareerEntry[];
  careerHistory: string[];
  metMenteeCount?: number;
  displayReviewCount: number;
  previewMode?: boolean;
  showSettingsEditButton: boolean;
  isHeadlineHighlighted: boolean;
}

export default function MentorDetailHeaderSection({
  mentor,
  mentoringTitleLabel,
  appealLine,
  companyLabel,
  jobTitleLabel,
  careerLabel,
  careerEntries,
  careerHistory,
  metMenteeCount,
  displayReviewCount,
  previewMode,
  showSettingsEditButton,
  isHeadlineHighlighted,
}: MentorDetailHeaderSectionProps) {
  return (
    <>
      <div className="mb-400 flex items-center justify-between gap-100">
        <nav className="flex items-center gap-75">
          <Link
            href="/mentoring"
            className="font-designer-14r text-text-subtle hover:text-text-default"
          >
            1:1 멘토링
          </Link>
          <ChevronRight className="text-text-subtlest h-14 w-14" />
          <span className="font-designer-14r text-text-default">
            {mentor.nickname}
          </span>
        </nav>
        {!previewMode && showSettingsEditButton && (
          <Link href="/mentoring/become-mentor">
            <Button color="outlined" size="small">
              멘토링 설정 수정
            </Button>
          </Link>
        )}
      </div>

      <section
        data-preview-section="headline"
        className={cn(
          'border-border-subtle mb-500 border-b pb-500',
          isHeadlineHighlighted && 'preview-section-highlight',
        )}
      >
        <>
          <h1 className="font-designer-24b text-text-strong mb-300 leading-snug sm:text-[30px]">
            {mentoringTitleLabel}
          </h1>

          <div className="grid grid-cols-1 gap-300 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div className="min-w-0">
              <div className="mb-125 flex items-start gap-300">
                <Avatar
                  image={mentor.imageUrl}
                  alt={mentor.nickname}
                  size={72}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-designer-20b text-text-strong">
                    {mentor.nickname}
                  </p>
                  <MentorProfileMetaList
                    variant="detail"
                    appealLine={appealLine}
                    companyLabel={companyLabel}
                    jobTitleLabel={jobTitleLabel}
                    careerLabel={careerLabel}
                    className="mt-75"
                  />
                </div>
              </div>
              <div className="mt-100 flex flex-col gap-75">
                <div className="flex items-center gap-100">
                  <ReviewStars rating={mentor.rating} />
                  <span className="font-designer-14b text-text-strong">
                    {mentor.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-75">
                  <span className="font-designer-14b text-text-subtle">
                    리뷰 {displayReviewCount}개
                  </span>
                  <span className="font-designer-12r text-text-subtlest">
                    |
                  </span>
                  {metMenteeCount !== undefined && (
                    <>
                      <span className="font-designer-14b text-text-subtle">
                        만난 멘티 {metMenteeCount}명
                      </span>
                      <span className="font-designer-12r text-text-subtlest">
                        |
                      </span>
                    </>
                  )}
                  <span className="font-designer-14b text-text-subtle">
                    멘토링 {mentor.mentoringCount}건
                  </span>
                </div>
              </div>
            </div>
            <MentorCareerHistoryPanel
              careerEntries={careerEntries}
              careerHistory={careerHistory}
            />
          </div>
        </>
      </section>
    </>
  );
}
