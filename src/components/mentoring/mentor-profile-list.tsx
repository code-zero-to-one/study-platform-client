'use client';

import { ArrowUpDown, Search, UserRoundPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import MentorCard from '@/components/card/mentor-card';
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
    <article className="rounded-200 border-border-subtle bg-background-accent-orange-default flex min-h-[320px] flex-col justify-between border p-300">
      <div>
        <h3 className="font-designer-24b text-text-strong mb-100">
          누구나 멘토가 될 수 있어요.
        </h3>
        <p className="font-designer-14r text-text-subtle mb-250">
          지식과 경험을 나누고 의미 있는 인사이트를 전해주세요.
        </p>
        <Button
          color="outlined"
          size="medium"
          onClick={handleClick}
          disabled={!isHydrated}
        >
          멘토 되기
        </Button>
      </div>

      <div className="rounded-150 border-border-subtle bg-background-default relative mt-300 h-[120px] overflow-hidden border">
        <div className="bg-background-accent-orange-default absolute top-[-24px] right-[-24px] h-[120px] w-[120px] rounded-full" />
        <div className="bg-background-accent-rose-default absolute bottom-[-36px] left-[-24px] h-[120px] w-[120px] rounded-full" />
        <div className="relative flex h-full items-center justify-center gap-100">
          <UserRoundPlus className="text-text-brand h-24 w-24" />
          <span className="font-designer-20b text-text-brand">
            becoming a Mentor
          </span>
        </div>
      </div>
    </article>
  );
}

export default function MentorProfileList() {
  const [keyword, setKeyword] = useState('');
  const [sortType, setSortType] = useState<MentorSortType>('default');
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

  const shouldShowMentorJoinCard = keyword.trim().length === 0;
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
