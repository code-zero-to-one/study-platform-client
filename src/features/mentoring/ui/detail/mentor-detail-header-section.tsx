'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import type { MentorProfile } from '@/types/mentoring/domain';
import ReviewStars from './review-stars';
interface MentorDetailHeaderSectionProps {
  mentor: MentorProfile;
  mentoringTitleLabel: string;
  profileSummaryLine: string;
  metMenteeCount: number;
  previewMode?: boolean;
  showSettingsEditButton: boolean;
  isHeadlineHighlighted: boolean;
}
export default function MentorDetailHeaderSection({
  mentor,
  mentoringTitleLabel,
  profileSummaryLine,
  metMenteeCount,
  previewMode,
  showSettingsEditButton,
  isHeadlineHighlighted,
}: MentorDetailHeaderSectionProps) {
  return (
    <>
      {' '}
      <div className="mb-400 flex items-center justify-between gap-100">
        {' '}
        <nav className="flex items-center gap-75">
          {' '}
          <Link
            href="/mentoring"
            className="hover:text-text-default font-designer-14r text-text-subtle"
          >
            {' '}
            1:1 멘토링{' '}
          </Link>{' '}
          <ChevronRight className="h-14 w-14 text-text-subtlest" />{' '}
          <span className="font-designer-14r text-text-default">
            {' '}
            {mentor.nickname}{' '}
          </span>{' '}
        </nav>{' '}
        {!previewMode && showSettingsEditButton && (
          <Link href="/mentoring/become-mentor">
            {' '}
            <Button color="outlined" size="small">
              {' '}
              멘토링 설정 수정{' '}
            </Button>{' '}
          </Link>
        )}{' '}
      </div>{' '}
      <section
        data-preview-section="headline"
        className={cn(
          'border-border-subtle mb-500 border-b pb-500',
          isHeadlineHighlighted && 'preview-section-highlight',
        )}
      >
        {' '}
        <h1 className="mb-300 leading-snug sm:text-[30px] font-designer-24b text-text-strong">
          {' '}
          {mentoringTitleLabel}{' '}
        </h1>{' '}
        <div className="flex flex-col gap-250 sm:flex-row sm:items-start sm:gap-400">
          {' '}
          <div className="flex-1">
            {' '}
            <div className="mb-75 flex items-start gap-200">
              {' '}
              <Avatar
                image={mentor.imageUrl}
                alt={mentor.nickname}
                size={48}
                className="shrink-0"
              />{' '}
              <div className="min-w-0 flex-1">
                {' '}
                <p className="font-designer-18b text-text-strong">
                  {' '}
                  {mentor.nickname}{' '}
                </p>{' '}
                <p className="mt-50 font-designer-14b text-text-brand">
                  {' '}
                  {mentor.company}{' '}
                </p>{' '}
                <p className="mt-25 font-designer-13r text-text-subtle">
                  {' '}
                  {profileSummaryLine}{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex flex-wrap items-center gap-100">
              {' '}
              <ReviewStars rating={Math.floor(mentor.rating)} />{' '}
              <span className="font-designer-14b text-text-strong">
                {' '}
                {mentor.rating.toFixed(1)}{' '}
              </span>{' '}
              <span className="font-designer-12r text-text-subtlest">·</span>{' '}
              <span className="font-designer-13r text-text-subtle">
                {' '}
                리뷰 {mentor.reviewCount}개{' '}
              </span>{' '}
              <span className="font-designer-12r text-text-subtlest">·</span>{' '}
              <span className="font-designer-13r text-text-subtle">
                {' '}
                만난 멘티 {metMenteeCount}명{' '}
              </span>{' '}
              <span className="font-designer-12r text-text-subtlest">·</span>{' '}
              <span className="font-designer-13r text-text-subtle">
                {' '}
                멘토링 {mentor.mentoringCount}건{' '}
              </span>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
