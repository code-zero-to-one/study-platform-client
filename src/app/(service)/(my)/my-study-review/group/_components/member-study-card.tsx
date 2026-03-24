'use client';

import dayjs from 'dayjs';
import { Dot, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToastStore } from '@/stores/use-toast-store';
import type { MemberStudyItem } from '@/types/api/group-study.types';

interface Props {
  study: MemberStudyItem;
  basePath: string;
  disableLeaderGuard?: boolean;
  onMemberClick?: (study: MemberStudyItem) => void;
}

export default function MemberStudyCard({
  study,
  basePath,
  disableLeaderGuard,
  onMemberClick,
}: Props) {
  const showToast = useToastStore((state) => state.showToast);
  const startDate = dayjs(study.startTime).format('YYYY.MM.DD');
  const endDate = study.endTime
    ? dayjs(study.endTime).format('YYYY.MM.DD')
    : null;
  const thumbnailUrl = study.thumbnail?.resizedImages?.[0]?.resizedImageUrl;

  // LEADER이거나 disableLeaderGuard인 경우에만 상세 페이지로 이동
  const shouldNavigate = disableLeaderGuard || study.studyRole === 'LEADER';
  const href =
    shouldNavigate && study.studyId ? `${basePath}/${study.studyId}` : null;

  const content = (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={study.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full" />
        )}
        {study.status === 'COMPLETED' ? (
          <div className="absolute inset-0 bg-black opacity-50" />
        ) : (
          <div className="absolute inset-0 rounded-100" />
        )}
      </div>
      <div className="flex flex-col gap-50">
        <div className="font-designer-15b text-text-default">{study.title}</div>
        <div className="text-text-subtle flex flex-row items-center gap-50">
          <div className="font-designer-14m">
            {study.studyRole === 'LEADER' ? '스터디 리더' : '스터디원'}
          </div>
          <div className="flex flex-row">
            <Users size={16} />
            <Dot size={16} />
            <div className="font-designer-12m">
              {study.participantsCount} / {study.maxMembersCount}
            </div>
          </div>
        </div>
        <div className="font-designer-12m text-text-subtle">
          {startDate}
          {endDate && ` ~ ${endDate}`}
        </div>
      </div>
    </>
  );

  const handleNonLeaderClick = () => {
    if (onMemberClick) {
      onMemberClick(study);
    } else {
      showToast('준비중인 기능입니다', 'info');
    }
  };

  return (
    <li className="flex w-full flex-col gap-100">
      {href ? (
        <Link href={href} className="flex w-full flex-col gap-100">
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className="flex w-full flex-col gap-100 text-left"
          onClick={handleNonLeaderClick}
        >
          {content}
        </button>
      )}
    </li>
  );
}
