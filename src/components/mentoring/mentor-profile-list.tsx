'use client';

import {
  ArrowRight,
  ArrowUpDown,
  Search,
  Sparkles,
  UserRoundPlus,
} from 'lucide-react';
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
    <article className="group rounded-200 border-border-subtle relative flex min-h-[320px] flex-col justify-between overflow-hidden border bg-background-default p-300">
      <div className="pointer-events-none absolute top-[-56px] right-[-24px] h-[180px] w-[180px] rounded-full bg-background-accent-orange-default opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-92px] left-[-32px] h-[220px] w-[220px] rounded-full bg-background-accent-rose-subtle opacity-70 blur-3xl" />

      <div className="relative">
        <span className="font-designer-12b text-text-brand mb-125 inline-flex items-center gap-50 rounded-full bg-fill-brand-subtle-default px-100 py-50">
          <Sparkles className="h-12 w-12" />
          Mentor Invitation
        </span>
        <h3 className="font-designer-24b text-text-strong mb-100 leading-tight">
          당신의 경험이 누군가의
          <br />
          다음 선택이 됩니다.
        </h3>
        <p className="font-designer-14r text-text-subtle mb-200">
          실무에서 쌓은 지식과 경험을 나누고, 멘티에게 실질적인 방향을
          전해주세요.
        </p>
        <div className="mb-250 flex flex-wrap gap-75">
          <span className="font-designer-12m text-text-default rounded-full bg-background-default px-100 py-50">
            1:1 멘토링
          </span>
          <span className="font-designer-12m text-text-default rounded-full bg-background-default px-100 py-50">
            일정 기반 운영
          </span>
        </div>
        <Button
          color="outlined"
          size="medium"
          className="gap-75"
          onClick={handleClick}
          disabled={!isHydrated}
        >
          멘토 등록하기
          <ArrowRight className="h-14 w-14" />
        </Button>
      </div>

      <div className="rounded-150 border-border-subtle bg-background-default relative mt-275 h-[108px] overflow-hidden border">
        <div className="bg-background-accent-orange-subtle absolute top-[-28px] right-[-20px] h-[112px] w-[112px] rounded-full" />
        <div className="bg-background-accent-rose-subtle absolute bottom-[-36px] left-[-24px] h-[112px] w-[112px] rounded-full" />
        <div className="relative flex h-full items-center justify-center gap-100">
          <UserRoundPlus className="text-text-brand h-20 w-20" />
          <span className="font-designer-20b text-text-brand">
            Become a Mentor
          </span>
        </div>
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
