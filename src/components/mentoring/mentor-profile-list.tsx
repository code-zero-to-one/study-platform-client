'use client';

import { ArrowUpDown, Search, UserRoundPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import MentorCard from '@/components/card/mentor-card';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import SortDropdown from '@/components/ui/filters/sort-dropdown';
import { BaseInput } from '@/components/ui/input';
import { hasMentorWritePermission } from '@/features/mentoring/model/mentor-permission';
import { useMentorDirectory } from '@/features/mentoring/model/use-mentor-directory';
import { useAuthReady } from '@/hooks/common/use-auth';
import {
  getLowestPriceOption,
  getMentorSettings,
  sortOptions,
  type MentorProfile,
  type MentorSortType,
} from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';

const sortMentors = (mentors: MentorProfile[], sortType: MentorSortType) => {
  const copied = [...mentors];

  if (sortType === 'rating') {
    return copied.sort((a, b) => b.rating - a.rating);
  }

  if (sortType === 'review') {
    return copied.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  if (sortType === 'low-price') {
    return copied.sort((a, b) => {
      const aPrice = getLowestPriceOption(a)?.price ?? Number.MAX_SAFE_INTEGER;
      const bPrice = getLowestPriceOption(b)?.price ?? Number.MAX_SAFE_INTEGER;

      return aPrice - bPrice;
    });
  }

  return copied.sort((a, b) => a.priority - b.priority);
};

function MentorJoinCard() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { isHydrated, isAuthenticated, data } = useAuthReady();

  const handleClick = () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 멘토 등록이 가능합니다.', 'error');
      router.push('/login');

      return;
    }

    if (!hasMentorWritePermission(data?.roleIds)) {
      showToast('멘토/관리자 권한이 필요합니다.', 'error');

      return;
    }

    router.push('/mentoring/become-mentor');
  };

  return (
    <article
      className={cn(
        'hover:shadow-2 hover:border-border-brand rounded-150',
        'border-border-subtle bg-background-default overflow-hidden border',
        'transition-all',
      )}
    >
      <div className="from-background-neutral-strong to-background-accent-blue-strong relative flex h-[180px] flex-col items-center justify-center gap-100 bg-linear-to-br">
        <UserRoundPlus className="text-text-inverse/70 h-[40px] w-[40px]" />
        <p className="font-designer-13b text-text-inverse/60">멘토 모집 중</p>
      </div>

      <div className="px-300 py-200">
        <div className="mb-100">
          <span className="font-designer-12b text-text-brand rounded-500 bg-fill-brand-subtle-default inline-flex items-center px-100 py-50">
            멘토 등록
          </span>
        </div>

        <h3 className="font-designer-20b text-text-default mb-75">
          멘토로 합류하세요
        </h3>

        <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
          실무 경험으로 멘티의 커리어 방향을 잡아주세요.
        </p>

        <p className="font-designer-13r text-text-subtle mb-150">
          1:1 멘토링 · 일정 기반 운영
        </p>

        <div className="mb-200 flex flex-wrap gap-x-300 gap-y-100">
          <span className="font-designer-16r text-text-subtle">쪽지상담</span>
          <span className="font-designer-16r text-text-subtle">전화상담</span>
          <span className="font-designer-16r text-text-subtle">온라인상담</span>
        </div>

        <Button
          color="primary"
          size="medium"
          className="w-full"
          onClick={handleClick}
          disabled={!isHydrated}
        >
          멘토 등록하기
        </Button>
      </div>
    </article>
  );
}

export default function MentorProfileList() {
  const [keyword, setKeyword] = useState('');
  const [sortType, setSortType] = useState<MentorSortType>('default');
  const { isHydrated: isAuthHydrated, isAuthenticated } = useAuthReady();
  const { mentors, hasHydrated } = useMentorDirectory();

  const searchedMentors = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return mentors;
    }

    return mentors.filter((mentor) => {
      const mentorSettings = getMentorSettings(mentor);
      const searchableText = [
        mentor.headline,
        mentor.nickname,
        mentor.role,
        mentor.career,
        mentor.company,
        mentor.summary,
        mentorSettings.mentoringTitle,
        ...mentorSettings.categories,
        ...mentorSettings.skillTags,
        ...mentor.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedKeyword);
    });
  }, [keyword, mentors]);

  const sortedMentors = useMemo(() => {
    return sortMentors(searchedMentors, sortType);
  }, [searchedMentors, sortType]);

  if (!hasHydrated) {
    return (
      <div className="grid grid-cols-1 gap-250 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-200 bg-background-alternative h-[320px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (sortedMentors.length === 0) {
    return (
      <div className="rounded-200 border-border-subtle bg-background-default border px-200 py-700 text-center">
        <p className="font-designer-18b text-text-strong mb-50">
          검색 결과가 없어요
        </p>
        <p className="font-designer-14r text-text-subtle">
          다른 키워드로 다시 검색해보세요.
        </p>
      </div>
    );
  }

  const shouldShowMentorJoinCard =
    keyword.trim().length === 0 && isAuthHydrated && isAuthenticated;
  const leadMentors = shouldShowMentorJoinCard
    ? sortedMentors.slice(0, 3)
    : sortedMentors;
  const remainingMentors = shouldShowMentorJoinCard
    ? sortedMentors.slice(3)
    : [];

  return (
    <section>
      <div className="mb-300 flex flex-col gap-150 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[320px]">
          <Search className="text-text-subtlest pointer-events-none absolute top-1/2 left-150 h-16 w-16 -translate-y-1/2" />
          <BaseInput
            value={keyword}
            onValueChange={setKeyword}
            placeholder="기술 검색"
            size="m"
            className="bg-background-default pl-[38px]"
          />
        </div>

        <SortDropdown
          value={sortType}
          options={sortOptions}
          onChange={(value) => {
            if (
              value === 'default' ||
              value === 'rating' ||
              value === 'review' ||
              value === 'low-price'
            ) {
              setSortType(value);
            }
          }}
          icon={<ArrowUpDown className="h-14 w-14" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-250 md:grid-cols-2 xl:grid-cols-4">
        {leadMentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}

        {shouldShowMentorJoinCard && <MentorJoinCard />}

        {remainingMentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </section>
  );
}
