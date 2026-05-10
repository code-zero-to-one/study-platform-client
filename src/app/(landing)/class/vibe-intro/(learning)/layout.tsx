'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const TABS = [
  { label: '학습 여정 맵', href: '/class/vibe-intro/home' },
  { label: '빌더 피드', href: '/class/vibe-intro/feed' },
  { label: '질문답변', href: '/class/vibe-intro/qa' },
];

export default function VibeIntroLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Banner */}
      <div
        className="flex h-[120px] w-full items-center justify-center"
        style={{
          background:
            'linear-gradient(90deg, var(--color-rose-100) 0%, var(--color-gray-0) 53.37%, var(--color-rose-100) 100%)',
        }}
      >
        <div className="flex items-center gap-350">
          <Image
            src="/class/vibe-intro/discord-avatar.png"
            alt="Discord"
            width={54}
            height={54}
            className="rounded-150 shrink-0"
          />
          <div className="flex flex-col">
            <p className="font-designer-20b text-gray-800">
              Study with Me,{' '}
              <span className="text-text-brand">디스코드에서 함께 공부</span>
              해요
            </p>
            <p className="font-designer-16r text-gray-800">
              실시간으로 운영진이 도와드려요! 빌더들과 소통해요.
            </p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex w-full border-b border-border-default">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/class/vibe-intro/home' &&
              pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex h-875 w-6000 flex-col items-center justify-center gap-125',
                isActive
                  ? 'font-designer-24b text-text-brand'
                  : 'font-designer-24r text-gray-400',
              )}
            >
              {tab.label}
              <div
                className={cn(
                  'h-25 w-full',
                  isActive ? 'bg-background-brand-default' : '',
                )}
              />
            </Link>
          );
        })}
      </div>

      {children}
    </>
  );
}
