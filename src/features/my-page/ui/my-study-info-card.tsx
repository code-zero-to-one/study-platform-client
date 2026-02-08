import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { IoMdPeople } from 'react-icons/io';
import { LuDot } from 'react-icons/lu';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { MemberStudyItem } from '@/features/study/group/api/group-study-types';

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
          <Image
            src={
              thumbnail?.resizedImages[0].resizedImageUrl ||
              '/images/default-study-thumbnail.png'
            }
            alt={`${studyId}`}
            className="rounded-100 h-[244px] w-[280px] object-cover"
            width={244}
            height={210}
          />
          {status === 'COMPLETED' && (
            <div className="rounded-100 absolute inset-0 bg-[#000000] opacity-50" />
          )}
        </div>

        {status === 'RECRUITING' && (
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
              <IoMdPeople />
              <LuDot />
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

      {(status === 'RECRUITING' || status === 'IN_PROGRESS') &&
        participantsCount < maxMembersCount &&
        studyRole === 'LEADER' && (
          <Link href={`/application-list/${studyId}`}>
            <Button color="secondary" className="w-full">
              신청자 N명 확인하기
            </Button>
          </Link>
        )}
    </li>
  );
}
