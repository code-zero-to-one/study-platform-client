'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface HeaderNavProps {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { href: '/class', loginRequired: false, label: '클래스' },
  { href: '/community', loginRequired: false, label: '커뮤니티' },
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
