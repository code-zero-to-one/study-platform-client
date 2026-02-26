'use client';

import { Clock5, Eye, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GroupStudyListItemDto } from '@/api/openapi';
import Badge from '@/components/ui/badge';
import StudyCardCountdownBadge from '@/components/ui/study-card-countdown-badge';

import {
  ExperienceLevel,
  StudyType,
} from '@/features/study/group/api/group-study-types';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  STUDY_TYPE_LABELS,
} from '@/features/study/group/const/group-study-const';

type BadgeColor =
  | 'default'
  | 'primary'
  | 'green'
  | 'red'
  | 'blue'
  | 'orange'
  | 'gray'
  | 'purple';

const STUDY_TYPE_BADGE_COLORS: Record<StudyType, BadgeColor> = {
  PROJECT: 'red',
  MENTORING: 'blue',
  SEMINAR: 'green',
  CHALLENGE: 'orange',
  BOOK_STUDY: 'purple',
  LECTURE_STUDY: 'primary',
};

interface Badge {
  memberName?: string;
  memberNickname?: string;
}

interface StudyCardProps {
  study: GroupStudyListItemDto;
  href: string;
  onClick?: () => void;
  viewCount?: number;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;

  return String(n);
}

export default function StudyCard({
  study,
  href,
  onClick,
  viewCount,
}: StudyCardProps) {
  const studyType = study.basicInfo?.type as StudyType;
  const badgeColor = studyType ? STUDY_TYPE_BADGE_COLORS[studyType] : 'default';
  const price = study.basicInfo?.price ?? 0;
  const isCompleted = study.basicInfo?.status === 'COMPLETED';

  return (
    <Link
      href={href}
      onClick={onClick}
      className="hover:shadow-2 hover:border-border-brand rounded-150 cursor-pointer overflow-hidden border border-[#E5E7EB] bg-white transition-all"
    >
      {/* 썸네일 영역 */}
      <div className="relative flex h-[180px] items-center justify-center bg-linear-to-br from-[#F87171] to-[#EC4899]">
        {study.simpleDetailInfo?.thumbnail?.resizedImages?.[0]
          ?.resizedImageUrl ? (
          <>
            <Image
              src={
                study.simpleDetailInfo.thumbnail.resizedImages[0]
                  .resizedImageUrl
              }
              alt={study.simpleDetailInfo?.title ?? '스터디'}
              fill
              className={`object-cover ${isCompleted ? 'grayscale' : ''}`}
            />
            {isCompleted && (
              <div className="rounded-150 absolute inset-0 bg-gray-100 opacity-40" />
            )}
          </>
        ) : (
          <div className="flex items-center gap-100 text-white">
            <span className="text-[14px] font-bold">ZERO ONE IT</span>
          </div>
        )}

        <div className="absolute top-200 left-200 z-10">
          <StudyCardCountdownBadge
            startDate={study.basicInfo?.startDate}
            status={study.basicInfo?.status}
            remaining={
              (study.basicInfo?.maxMembersCount ?? 0) -
              (study.basicInfo?.approvedCount ?? 0)
            }
          />
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-300 py-200">
        {/* 뱃지 */}
        <div className="mb-100 flex flex-wrap gap-50">
          <Badge color={badgeColor}>
            {studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}
          </Badge>
          {study.basicInfo?.experienceLevels?.map((level) => (
            <Badge key={level} color="gray">
              {EXPERIENCE_LEVEL_LABELS[level as ExperienceLevel]}
            </Badge>
          ))}
        </div>

        {/* 제목 */}
        <h3 className="font-designer-20b text-text-default mb-100 truncate">
          {study.simpleDetailInfo?.title}
        </h3>

        {/* 설명 */}
        <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
          {study.simpleDetailInfo?.summary}
        </p>

        {/* 활성 배지 (RECRUITING / ENDING_SOON 일 때만) */}
        {(study.basicInfo?.status === 'RECRUITING' ||
          study.basicInfo?.status === 'ENDING_SOON') &&
          (() => {
            const remaining =
              (study.basicInfo?.maxMembersCount ?? 0) -
              (study.basicInfo?.approvedCount ?? 0);
            if (remaining <= 0)
              return (
                <div className="mb-150">
                  <span className="rounded-50 border border-red-400 px-200 py-50 text-[13px] font-semibold text-red-500">
                    🔥 모집 마감
                  </span>
                </div>
              );
            if (remaining <= 3)
              return (
                <div className="mb-150">
                  <span className="rounded-50 border border-orange-400 px-200 py-50 text-[13px] font-semibold text-orange-500">
                    🔥 마지막 {remaining}자리!
                  </span>
                </div>
              );

            return (
              <div className="mb-150">
                <span className="text-[13px] font-semibold text-green-600">
                  🔥 마감까지 {remaining}명
                </span>
              </div>
            );
          })()}

        {/* 하단 정보 */}
        <div className="text-text-subtlest flex items-center gap-150">
          <div className="flex items-center gap-50">
            <Users width={20} height={20} />
            <span className="font-designer-13r">
              {study.basicInfo?.maxMembersCount}명
            </span>
          </div>
          <div className="flex items-center gap-50">
            <Clock5 width={20} height={20} />
            <span className="font-designer-13r">
              {study.basicInfo?.regularMeeting
                ? REGULAR_MEETING_LABELS[study.basicInfo.regularMeeting]
                : ''}
            </span>
          </div>
        </div>

        {/* 리더 정보 & 가격 */}
        <div className="mt-500 flex items-center justify-between">
          <div className="flex items-center gap-150">
            <div className="flex h-400 w-400 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB]">
              {study.basicInfo?.leader?.profileImage?.resizedImages?.[0]
                ?.resizedImageUrl ? (
                <Image
                  src={
                    study.basicInfo.leader.profileImage.resizedImages[0]
                      .resizedImageUrl
                  }
                  alt="프로필"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/icons/user-default.svg"
                  alt="프로필"
                  width={40}
                  height={40}
                />
              )}
            </div>
            <div>
              <p className="font-designer-15m">
                {(study.basicInfo?.leader as Badge)?.memberName ||
                  (study.basicInfo?.leader as Badge)?.memberNickname ||
                  '스터디장'}
              </p>
            </div>
          </div>

          {/* 가격 & 조회수 */}
          <div className="flex items-center gap-200">
            {price > 0 && (
              <span className="font-designer-24b text-text-strong">
                {price.toLocaleString()}
                <span className="font-designer-18m text-text-subtlest ml-50">
                  원
                </span>
              </span>
            )}
            {viewCount !== undefined && viewCount > 0 && (
              <div className="text-text-subtlest flex items-center gap-50">
                <Eye width={16} height={16} />
                <span className="font-designer-13r">
                  {formatCount(viewCount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
