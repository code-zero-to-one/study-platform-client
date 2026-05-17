'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface HeaderNavProps {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { href: '/class', label: '클래스', comingSoon: false },
  { href: '/community', label: '커뮤니티', comingSoon: true },
  { href: '/insight', label: '인사이트', comingSoon: true },
];

export default function HeaderNav({ isLoggedIn: _isLoggedIn }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="font-designer-14m flex grow items-center gap-250 px-600">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);

        if (item.comingSoon) {
          return (
            <div key={item.label} className="group relative p-100">
              <span
                className={cn(
                  'cursor-default',
                  isActive ? 'text-text-brand' : 'text-text-subtle',
                )}
              >
                {item.label}
              </span>
              <div className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-50 group-hover:block">
                <div className="relative flex items-center justify-center rounded-100 bg-background-brand-default px-125 py-75">
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      top: -21,
                      width: 41,
                      height: 41,
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        bottom: '25%',
                        left: '10.26%',
                        right: '10.26%',
                        top: '4.88%',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        aria-hidden="true"
                        className="block size-full max-w-none"
                        src="/icons/comming-soon-arrow.svg"
                      />
                    </div>
                  </div>
                  <p className="font-designer-13m whitespace-nowrap text-gray-0">
                    Coming Soon
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'p-100',
              isActive ? 'text-text-brand' : 'text-text-subtle',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
