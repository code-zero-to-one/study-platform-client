'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { hashValue } from '@/utils/hash';

import { GroupStudyData } from '../../group/api/group-study-types';
import { REGULAR_MEETING_LABELS } from '../../group/const/group-study-const';

interface PremiumStudyListProps {
  studies: GroupStudyData[];
}

export default function PremiumStudyList({ studies }: PremiumStudyListProps) {
  const { data: authData } = useAuth();

  const handleStudyClick = (study: GroupStudyData) => {
    sendGTMEvent({
      event: 'premium_study_detail_view',
      dl_timestamp: new Date().toISOString(),
      ...(authData?.memberId && {
        dl_member_id: hashValue(String(authData.memberId)),
      }),
      dl_study_id: String(study.basicInfo.groupStudyId),
      dl_study_title: study.simpleDetailInfo.title,
    });
  };

  if (studies.length === 0) {
    return (
      <div className="bg-background-alternative rounded-100 flex h-[640px] flex-col items-center justify-center gap-300">
        <Image
          src="/icons/empty-study-case.svg"
          alt="현재 멘토 스터디가 없습니다."
          width={88}
          height={88}
        />
        <div className="flex flex-col items-center justify-center gap-100">
          <span className="text-text-subtle font-designer-20b">
            스터디가 아직 준비되지 않았습니다.
          </span>
          <span className="text-text-subtlest font-designer-16r">
            원하는 주제로 스터디를 개설해 첫 번째 참여자가 되어보세요.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-300">
      {studies.map((study) => (
        <Link
          key={study.basicInfo.groupStudyId}
          href={`/premium-study/${study.basicInfo.groupStudyId}`}
          onClick={() => handleStudyClick(study)}
          className="cursor-pointer overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
        >
          {/* 썸네일 영역 */}
          <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-[#F87171] to-[#EC4899]">
            {study.simpleDetailInfo.thumbnail?.resizedImages?.[0]
              ?.resizedImageUrl ? (
              <Image
                src={
                  study.simpleDetailInfo.thumbnail.resizedImages[0]
                    .resizedImageUrl
                }
                alt={study.simpleDetailInfo.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center gap-100 text-white">
                <span className="text-[14px] font-bold">ZERO ONE IT</span>
              </div>
            )}
            {study.basicInfo.hostType === 'ZEROONE' && (
              <div className="absolute top-200 left-200">
                <Badge color="red">제로원 스터디</Badge>
              </div>
            )}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="p-300">
            {/* 제목 */}
            <h3 className="font-designer-16b mb-100 truncate text-[#1F2937]">
              {study.simpleDetailInfo.title}
            </h3>

            {/* 설명 */}
            <p className="font-designer-14r mb-300 line-clamp-2 text-[#6B7280]">
              {study.simpleDetailInfo.summary}
            </p>

            {/* 리더 정보 */}
            <div className="mb-300 flex items-center justify-between">
              <div className="flex items-center gap-150">
                <div className="flex h-[32px] w-[32px] items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB]">
                  {study.basicInfo.leader?.profileImage?.resizedImages?.[0]
                    ?.resizedImageUrl ? (
                    <Image
                      src={
                        study.basicInfo.leader.profileImage.resizedImages[0]
                          .resizedImageUrl
                      }
                      alt="프로필"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/icons/user-default.svg"
                      alt="프로필"
                      width={20}
                      height={20}
                    />
                  )}
                </div>
                <div>
                  <p className="font-designer-13b text-[#1F2937]">
                    {study.basicInfo.leader?.memberName || '스터디장'}
                  </p>
                  <p className="font-designer-12r text-[#9CA3AF]">스터디장</p>
                </div>
              </div>
              <div className="font-designer-12r flex items-center gap-150 text-[#9CA3AF]">
                <span>
                  {study.basicInfo.approvedCount}/
                  {study.basicInfo.maxMembersCount}명
                </span>
                <span>
                  {REGULAR_MEETING_LABELS[study.basicInfo.regularMeeting]}
                </span>
              </div>
            </div>

            {/* 가격 및 버튼 */}
            <div className="flex items-center justify-between">
              <span className="font-designer-18b text-[#EF4444]">
                {study.basicInfo.price === 0
                  ? '무료'
                  : `${study.basicInfo.price.toLocaleString()}원`}
              </span>
              <Button color="primary" size="xsmall">
                참여하기
              </Button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
