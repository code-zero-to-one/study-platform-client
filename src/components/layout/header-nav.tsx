'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface HeaderNavProps {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { href: '/home', loginRequired: false, label: '1:1 스터디' },
  { href: '/mentoring', loginRequired: false, label: '1:1 멘토링' },
  { href: '/group-study', loginRequired: false, label: '그룹스터디' },
  { href: '/premium-study', loginRequired: false, label: '멘토스터디' },
  { href: '/insights', loginRequired: false, label: '인사이트' },
];

export default function HeaderNav({ isLoggedIn }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="font-designer-14m flex flex-grow items-center gap-300 px-600">
      {NAV_ITEMS.map((item) => {
        const href = item.loginRequired && !isLoggedIn ? '/login' : item.href;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(isActive ? 'text-text-brand' : 'text-text-subtle')}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
