'use client';

import { Clock5, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GroupStudyListItemDto } from '@/api/openapi';
import Badge from '@/components/ui/badge';

import { StudyType } from '../../features/study/group/api/group-study-types';
import {
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
  study: GroupStudyListItemDto;
  href: string;
  onClick?: () => void;
}

export default function StudyCard({ study, href, onClick }: StudyCardProps) {
  const studyType = study.basicInfo?.type as StudyType;
  const badgeColor = studyType ? STUDY_TYPE_BADGE_COLORS[studyType] : 'default';
  const price = study.basicInfo?.price ?? 0;

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
          <Image
            src={
              study.simpleDetailInfo.thumbnail.resizedImages[0].resizedImageUrl
            }
            alt={study.simpleDetailInfo?.title ?? '스터디'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center gap-100 text-white">
            <span className="text-[14px] font-bold">ZERO ONE IT</span>
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-300 py-200">
        {/* 뱃지 */}
        <div className="mb-100">
          <Badge color={badgeColor}>
            {studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}
          </Badge>
        </div>

        {/* 제목 */}
        <h3 className="font-designer-20b text-text-default mb-100 truncate">
          {study.simpleDetailInfo?.title}
        </h3>

        {/* 설명 */}
        <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
          {study.simpleDetailInfo?.summary}
        </p>

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
                {(
                  study.basicInfo?.leader as {
                    memberName?: string;
                    memberNickname?: string;
                  }
                )?.memberName ||
                  (
                    study.basicInfo?.leader as {
                      memberName?: string;
                      memberNickname?: string;
                    }
                  )?.memberNickname ||
                  '스터디장'}
              </p>
            </div>
          </div>

          {/* 가격 (0원이면 숨김) */}
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
    </Link>
  );
}
