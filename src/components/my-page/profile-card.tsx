import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import {
  ApplyStatus,
  GroupStudyApply,
} from '@/types/api/group-study-application.types';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);

interface ProfileCardProps {
  data: GroupStudyApply;
  onClick: (value: ApplyStatus) => void;
}

export default function ProfileCard(props: ProfileCardProps) {
  const { data: applicant, onClick } = props;
  const temperPreset = getSincerityPresetByLevelName(
    applicant.applicantInfo.sincerityTemp.levelName as string,
  );

  const timeAgo = (date: string | Date): string => {
    const now = dayjs();
    const target = dayjs(date);

    if (!target.isValid()) return '';

    const diffMin = now.diff(target, 'minute');
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;

    const diffHour = now.diff(target, 'hour');
    if (diffHour < 24) return `${diffHour}시간 전`;

    const diffDay = now.diff(target, 'day');
    if (diffDay < 7) return `${diffDay}일 전`;

    const diffWeek = Math.floor(diffDay / 7);

    return `${diffWeek}주 전`;
  };

  return (
    <div className="rounded-100 flex w-full cursor-pointer flex-col gap-150 border border-gray-200 p-300">
      <div className="flex gap-150">
        <UserProfileModal
          memberId={applicant.applicantInfo.memberId}
          trigger={
            <div className="relative h-600 w-600 shrink-0 cursor-pointer overflow-hidden rounded-full">
              <Image
                src={
                  applicant.applicantInfo.profileImage?.resizedImages[0]
                    .resizedImageUrl ?? ''
                }
                alt="profile"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          }
        />
        <div>
          <div className="flex items-center gap-50">
            <span className="font-designer-14b">
              {applicant.applicantInfo.memberNickname}
            </span>
            <span
              className={cn(
                'font-designer-13r rounded-full px-150 py-50 leading-250',
                temperPreset.bgClass,
                temperPreset.textClass,
              )}
            >
              {`${applicant.applicantInfo.sincerityTemp.temperature}`} ℃
            </span>
          </div>

          <p className="font-designer-13r text-text-subtle">
            {timeAgo(applicant.createdAt)}
          </p>
        </div>
      </div>
      {applicant.interviewPost.map((q) => {
        const matchedAnswer = applicant.answer.find((a) => a.id === q.id);

        return (
          <div key={q.id} className="mb-4">
            <p className="font-designer-16b text-text-default">
              {q.id}. {q.question}
            </p>

            <p className="font-designer-16r text-text-default">
              {matchedAnswer?.answer ?? '—'}
            </p>
          </div>
        );
      })}

      <div className="flex w-full gap-100">
        <Button
          size="medium"
          type="button"
          color="secondary"
          className="flex-1 sm:flex-none sm:w-[120px]"
          onClick={() => onClick('REJECTED')}
        >
          반려
        </Button>
        <Button
          size="medium"
          type="button"
          color="primary"
          className="flex-1 sm:flex-none sm:w-[120px]"
          onClick={() => onClick('APPROVED')}
        >
          승인
        </Button>
      </div>
    </div>
  );
}
