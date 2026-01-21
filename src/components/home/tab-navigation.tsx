'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { Trophy, BookOpen, MessageSquareText, Calendar, History } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
}

const TABS = [
  {
    id: 'study',
    label: '스터디',
    icon: Calendar,
    description: '나의 스터디 일정'
  },
  {
    id: 'ranking',
    label: '명예의 전당',
    icon: Trophy,
    description: '랭킹 시스템'
  },
  {
    id: 'archive',
    label: '제로원 아카이브',
    icon: BookOpen,
    description: '학습 자료'
  },
  {
    id: 'history',
    label: '나의 스터디 기록',
    icon: History,
    description: '1:1 스터디 히스토리'
  },
  {
    id: 'community',
    label: '밸런스게임',
    icon: MessageSquareText,
    description: '커뮤니티'
  }
];

export default function TabNavigation({ activeTab }: TabNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/home?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-300 mb-500">
      <div className="flex items-center justify-between">
        <h1 className="font-bold-h3 text-text-strong">제로원 홈</h1>
      </div>
      
      <nav className="flex gap-100 border-b border-border-subtle">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-150 px-300 py-200 font-designer-16m transition-all border-b-2 whitespace-nowrap',
                isActive
                  ? 'text-text-brand border-border-brand bg-fill-brand-subtle-default'
                  : 'text-text-subtle border-transparent hover:text-text-default hover:bg-fill-neutral-subtle-hover'
              )}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
