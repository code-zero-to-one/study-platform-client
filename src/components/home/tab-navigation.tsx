'use client';

import {
  Trophy,
  BookOpen,
  MessageSquareText,
  Calendar,
  History,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from '@/api/client/cookie';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { useAuth } from '@/hooks/common/use-auth';

interface TabNavigationProps {
  activeTab: string;
}

const TABS = [
  {
    id: 'study',
    label: '스터디',
    icon: Calendar,
    description: '나의 스터디 일정',
  },
  {
    id: 'ranking',
    label: '명예의 전당',
    icon: Trophy,
    description: '랭킹 시스템',
  },
  {
    id: 'archive',
    label: '제로원 아카이브',
    icon: BookOpen,
    description: '학습 자료',
  },
  {
    id: 'history',
    label: '나의 스터디 기록',
    icon: History,
    description: '1:1 스터디 히스토리',
  },
  {
    id: 'community',
    label: '밸런스게임',
    icon: MessageSquareText,
    description: '커뮤니티',
  },
];

export default function TabNavigation({ activeTab }: TabNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const hasMemberId = !!getCookie('memberId');
  const canViewHistory = isAuthenticated && hasMemberId;
  const visibleTabs = canViewHistory
    ? TABS
    : TABS.filter((tab) => tab.id !== 'history');

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/home?${params.toString()}`);
  };

  return (
    <div className="mb-500 flex flex-col gap-300">
      <div className="flex items-center justify-between">
        <h1 className="font-bold-h3 text-text-strong">제로원 홈</h1>
      </div>

      <nav className="border-border-subtle flex gap-100 border-b">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'font-designer-16m flex items-center gap-150 border-b-2 px-300 py-200 whitespace-nowrap transition-all',
                isActive
                  ? 'text-text-brand border-border-brand bg-fill-brand-subtle-default'
                  : 'text-text-subtle hover:text-text-default hover:bg-fill-neutral-subtle-hover border-transparent',
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
