'use client';

import { Clock5, Eye, Flame, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { GroupStudyListItemDto } from '@/api/openapi';
import Avatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import StudyCardCountdownBadge from '@/components/common/ui/study-card-countdown-badge';

import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  STUDY_TYPE_LABELS,
} from '@/config/group-study-const';
import type { ExperienceLevel, StudyType } from '@/types/api/group-study.types';

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

function getRecruitmentBadge(remaining: number) {
  if (remaining <= 0)
    return (
      <Badge className="text-text-error bg-fill-danger-subtle-default">
        모집 마감
      </Badge>
    );
  if (remaining <= 3)
    return (
      <Badge
        color="red"
        className="animate-pulse border-2 border-red-500 font-bold"
        leftIcon={<Flame className="text-red-500" size={14} />}
      >
        마지막 {remaining}자리!
      </Badge>
    );

  return (
    <Badge
      className="font-designer-13r text-text-error bg-transparent p-0"
      leftIcon={<Flame className="text-red-500" size={20} />}
    >
      마감까지 {remaining}명
    </Badge>
  );
}

export default function StudyCard({ study, href, onClick }: StudyCardProps) {
  const {
    basicInfo: {
      type,
      price = 0,
      status,
      maxMembersCount = 0,
      approvedCount = 0,
      remainingSlots,
      startDate,
    } = {},
  } = study ?? {};
  const studyType = type as StudyType;

  const isCompleted = study.basicInfo?.status === 'COMPLETED';
  const remaining = remainingSlots ?? maxMembersCount - approvedCount;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`hover:shadow-2 hover:border-border-brand rounded-150 cursor-pointer overflow-hidden border border-[#E5E7EB] transition-all ${isCompleted ? 'bg-black opacity-50' : 'bg-white'}`}
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

        <div className="absolute top-200 left-200">
          <StudyCardCountdownBadge
            startDate={startDate}
            status={status}
            remaining={remaining}
          />
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-300 py-200">
        {/* 뱃지 */}
        <div className="mb-100 flex flex-wrap gap-50">
          <Badge color="gray">
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

        {/* 활성 배지 (RECRUITING·ENDING_SOON·IN_PROGRESS일 때) */}
        {(study.basicInfo?.status === 'RECRUITING' ||
          study.basicInfo?.status === 'ENDING_SOON' ||
          study.basicInfo?.status === 'IN_PROGRESS') && (
          <div className="mb-150">{getRecruitmentBadge(remaining)}</div>
        )}

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
          <div className="text-text-subtlest flex items-center gap-50">
            <Eye width={16} height={16} />
            <span className="font-designer-13r">{study.viewCount}</span>
          </div>
        </div>

        {/* 리더 정보 & 가격 */}
        <div className="mt-500 flex items-center justify-between">
          <div className="flex items-center gap-150">
            <Avatar
              image={
                study.basicInfo?.leader?.profileImage?.resizedImages?.[0]
                  ?.resizedImageUrl
              }
              size={40}
              alt="프로필"
            />
            <div>
              <p className="font-designer-15m">
                {study.basicInfo?.leader?.memberNickname || '스터디장'}
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
          </div>
        </div>
      </div>
    </Link>
  );
}
