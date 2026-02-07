'use client';

import { Clock5, Eye, Flame, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GroupStudyListItemDto } from '@/api/openapi';
import Badge from '@/components/ui/badge';
import StudyStatusBadge from '@/components/ui/badge/study-status-badge';
import Countdown from '@/components/ui/countdown';

import { StudyType } from '../../features/study/group/api/group-study-types';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  STUDY_TYPE_LABELS,
} from '../../features/study/group/const/group-study-const';

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

interface StudyCardProps {
  study: GroupStudyListItemDto & {
    // 프로토타입용 확장 필드
    _prototype?: {
      status: 'RECRUITING' | 'DEADLINE_IMMINENT' | 'IN_PROGRESS' | 'COMPLETED';
      daysLeft?: number;
      endDate?: string;
      viewCount?: number;
      applicantCount?: number;
    };
  };
  href: string;
  onClick?: () => void;
}

export default function StudyCard({ study, href, onClick }: StudyCardProps) {
  const studyType = study.basicInfo?.type as StudyType;
  const badgeColor = studyType ? STUDY_TYPE_BADGE_COLORS[studyType] : 'default';
  const price = study.basicInfo?.price ?? 0;
  const classification = study.basicInfo?.classification;

  // 프로토타입 데이터
  const prototype = study._prototype || {
    status: 'RECRUITING' as const,
    viewCount: 0,
    applicantCount: 0,
  };

  // 경험 수준 (난이도)
  const experienceLevel = study.basicInfo?.experienceLevels?.[0];

  // 종료 상태일 경우 회색 톤 처리
  const isCompleted = prototype.status === 'COMPLETED';

  // 24시간 미만 여부 계산
  const timeLeft = prototype.endDate
    ? new Date(prototype.endDate).getTime() - new Date().getTime()
    : Infinity;
  const hoursLeft = timeLeft / (1000 * 60 * 60);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`hover:shadow-2 hover:border-border-brand rounded-150 cursor-pointer overflow-hidden border border-[#E5E7EB] transition-all ${
        isCompleted ? 'bg-gray-100 opacity-70' : 'bg-white'
      }`}
    >
      {/* 썸네일 영역 */}
      <div className="relative flex h-[180px] items-center justify-center bg-linear-to-br from-[#F87171] to-[#EC4899]">
        <Image
          src={
            study.simpleDetailInfo?.thumbnail?.resizedImages?.[0]
              ?.resizedImageUrl || '/images/default-study-thumbnail.png'
          }
          alt={study.simpleDetailInfo?.title ?? '스터디'}
          fill
          className={`object-cover ${isCompleted ? 'grayscale' : ''}`}
        />

        {/* 헤더: 배지 + 타이틀 + D-Day */}
        <div className="absolute top-200 left-200 right-200 flex items-start justify-between gap-200">
          {/* 상태 배지 (카운트다운 통합) */}
          <div className="flex flex-col gap-100">
            {/* 24시간 미만: 마감까지 카운트다운 (애니메이션) */}
            {prototype.endDate &&
            prototype.status === 'DEADLINE_IMMINENT' &&
            hoursLeft < 24 ? (
              <Badge color="red" className="border-2 border-red-500 animate-pulse">
                <span className="text-xs font-bold">마감까지 </span>
                <Countdown targetDate={prototype.endDate} className="font-bold" />
              </Badge>
            ) : (
              <StudyStatusBadge
                status={prototype.status}
                daysLeft={prototype.daysLeft}
                hoursLeft={hoursLeft}
              />
            )}
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-300 py-200">
        {/* 뱃지 영역 */}
        <div className="mb-100 flex items-center gap-100">
          <Badge color={badgeColor}>
            {studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}
          </Badge>
          {experienceLevel && (
            <Badge color="gray">
              {EXPERIENCE_LEVEL_LABELS[experienceLevel]}
            </Badge>
          )}
        </div>

        {/* 제목 */}
        <h3 className="font-designer-20b text-text-default mb-100 truncate">
          {study.simpleDetailInfo?.title}
        </h3>

        {/* 설명 */}
        <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
          {study.simpleDetailInfo?.summary}
        </p>

        {/* 남은 정원 표시 */}
        <div className="mb-150">
          {(() => {
            const maxMembers = study.basicInfo?.maxMembersCount ?? 0;
            const approvedCount = study.basicInfo?.approvedCount ?? 0;
            const remainingSeats = maxMembers - approvedCount;

            // 모집 마감 (n == 0)
            if (remainingSeats === 0) {
              return (
                <span className="inline-flex min-w-[24px] px-100 py-50 justify-center items-center gap-[2px] text-xs font-medium whitespace-nowrap bg-fill-danger-subtle-default text-text-error rounded-50">
                  <Flame width={16} height={16} className="text-red-500" />
                  모집 마감
                </span>
              );
            }

            // 마감 임박 (0 < n ≤ 3)
            if (remainingSeats > 0 && remainingSeats <= 3) {
              return (
                <span className="inline-flex min-w-[24px] px-100 py-50 justify-center items-center gap-[2px] text-xs font-bold whitespace-nowrap bg-fill-danger-subtle-default text-text-error rounded-50 border-2 border-red-500 animate-pulse">
                  <Flame width={16} height={16} className="text-red-500" />
                  마지막 {remainingSeats}자리!
                </span>
              );
            }

            // 디폴트 (n > 3) - 간단한 스타일
            return (
              <div className="flex items-center gap-50">
                <Flame width={20} height={20} className="text-red-500" />
                <span className="font-designer-13r text-text-error">
                  마감까지 {remainingSeats}명
                </span>
              </div>
            );
          })()}
        </div>

        {/* 하단 정보 (인원·주기·조회수) */}
        <div className="text-text-subtlest flex items-center gap-150">
          <div className="flex items-center gap-50 w-[60px]">
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
          <div className="flex items-center gap-50">
            <Eye width={20} height={20} />
            <span className="font-designer-13r">
              {prototype.viewCount >= 1000
                ? `${(prototype.viewCount / 1000).toFixed(1)}k`
                : prototype.viewCount}
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
                  src="/images/default-profile.png"
                  alt="프로필"
                  width={40}
                  height={40}
                />
              )}
            </div>
            <div>
              <p className="font-designer-15m">
                {classification === 'PREMIUM_STUDY' 
                  ? (study.basicInfo?.leader as any)?.memberName ||
                    (study.basicInfo?.leader as any)?.memberNickname ||
                    '멘토'
                  : (study.basicInfo?.leader as any)?.memberName ||
                    (study.basicInfo?.leader as any)?.memberNickname ||
                    '스터디장'}
              </p>
            </div>
          </div>

          {/* 우측: 멘토스터디만 가격 표시 */}
          {classification === 'PREMIUM_STUDY' && price > 0 && (
            <span className="font-designer-24b text-text-strong">
              {price.toLocaleString()}
              <span className="font-designer-18m text-text-subtlest ml-50">
                원
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
