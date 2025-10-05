import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';
import { getSincerityPresetByLevelName } from '@/shared/config/sincerity-temp-presets';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';

export default function EntryCard() {
  const temperPreset = getSincerityPresetByLevelName('3단계');

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
    <div className="rounded-100 flex w-full flex-col gap-150 border p-300">
      <div className="flex gap-150">
        <Image
          src="/profile-default.jpg"
          alt="profile"
          width={48}
          height={48}
        />
        <div>
          <div className="flex items-center gap-50">
            <span className="font-designer-14b">홍길동</span>
            <span
              className={cn(
                'font-designer-13r rounded-full px-150 py-50 leading-250',
                temperPreset.bgClass,
                temperPreset.textClass,
              )}
            >
              40.0 ℃
            </span>
          </div>

          <p className="font-designer-13r text-text-subtle">
            {timeAgo('2023-10-01 14:23:00')}
          </p>
        </div>
      </div>
      <p className="font-designer-16r text-text-default">
        프론트엔드 개발자로 2년째 일하고 있으며 주로 React와 TypeScript를
        사용하고 있습니다. 최근에는 Next.js와 디자인 시스템에도 관심을 두고
        있는데, 혼자 공부하기보다 다른 개발자들과 함께 코드 리뷰와 토론을 통해
        깊이 있는 성장을 하고 싶어 이 스터디에 지원하게 되었습니다.
      </p>
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
