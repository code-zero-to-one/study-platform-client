import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';
import { getSincerityPresetByLevelName } from '@/shared/config/sincerity-temp-presets';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';
import { GroupStudyApply } from '@/features/study/application/api/type';

export default function ProfileCard(props: { data: GroupStudyApply }) {
  const { data: applicant } = props;
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
    <div className="rounded-100 flex w-full cursor-pointer flex-col gap-150 border border-[#E9EAEB] p-300">
      <div className="flex gap-150">
        <Image
          src="/profile-default.jpg"
          alt="profile"
          width={48}
          height={48}
        />
        <div>
          <div className="flex items-center gap-50">
            <span className="font-designer-14b">
              {applicant.applicantInfo.memberName}
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
      <p className="font-designer-16r text-text-default">{applicant.answer}</p>
      <div className="flex w-full justify-end gap-100">
        <Button
          size="medium"
          type="button"
          color="secondary"
          className="w-[120px]"
        >
          반려
        </Button>
        <Button
          size="medium"
          type="button"
          color="primary"
          className="w-[120px]"
        >
          승인
        </Button>
      </div>
    </div>
  );
}
