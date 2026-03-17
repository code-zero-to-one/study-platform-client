import dayjs from 'dayjs';
import { Dot, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import type { MemberStudyItem } from '@/types/api/group-study.types';

interface MyStudyInfoCardProps extends MemberStudyItem {
  type: 'GROUP_STUDY';
}

export default function MyStudyInfoCard({
  studyId,
  thumbnail,
  status,
  startTime,
  endTime,
  participantsCount,
  maxMembersCount,
  pendingCount,
  studyRole,
  title,
}: MyStudyInfoCardProps) {
  const startDate = dayjs(startTime).format('YYYY.MM.DD');
  const endDate = endTime ? dayjs(endTime).format('YYYY.MM.DD') : null;

  return (
    <li className="flex w-full flex-col gap-100">
      <Link
        href={`/group-study/${studyId}`}
        className="flex w-full flex-col gap-100"
      >
        <div className="relative">
          <UserAvatar
            image={thumbnail?.resizedImages[0]?.resizedImageUrl ?? undefined}
            size={244}
            className={`rounded-100 h-study-card w-full object-cover ${status === 'COMPLETED' ? 'grayscale' : ''}`}
          />
          {status === 'COMPLETED' && (
            <div className="rounded-100 absolute inset-0 bg-black opacity-50" />
          )}
        </div>

        {(status === 'RECRUITING' || status === 'ENDING_SOON') && (
          <div className="inline-block w-auto">
            <Badge color="purple">시작 전</Badge>
          </div>
        )}
        {status === 'IN_PROGRESS' && (
          <div className="inline-block w-auto">
            <Badge color="blue">진행 중</Badge>
          </div>
        )}

        <div className="flex flex-col gap-50">
          <div className="font-designer-15b">{title}</div>

          <div className="text-text-subtle flex flex-row items-center justify-start gap-50">
            <div className="font-designer-14m">
              {studyRole === 'LEADER' ? '스터디 리더' : '스터디원'}
            </div>
            <div className="flex flex-row">
              <Users size={16} />
              <Dot size={16} />
              <div className="font-designer-12m">
                {participantsCount} / {maxMembersCount}
              </div>
            </div>
          </div>

          <div className="font-designer-12m text-text-subtle">
            <div>
              {startDate} ~{endDate && ` ${endDate}`}
            </div>
          </div>
        </div>
      </Link>

      {!!pendingCount &&
        (status === 'RECRUITING' ||
          status === 'ENDING_SOON' ||
          status === 'IN_PROGRESS') &&
        participantsCount < maxMembersCount &&
        studyRole === 'LEADER' && (
          <Link href={`/application-list/${studyId}`}>
            <Button color="secondary" className="w-full">
              {`신청자 ${pendingCount}명 확인하기`}
            </Button>
          </Link>
        )}
    </li>
  );
}
