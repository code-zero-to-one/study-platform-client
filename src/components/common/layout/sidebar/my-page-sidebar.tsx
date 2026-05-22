'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useLogoutMutation } from '@/hooks/queries/auth/use-auth-mutation';

interface IconProps {
  className?: string;
}

function PersonOutlineIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-300', className)}
    >
      <path d="M8 1.9C9.16 1.9 10.1 2.84 10.1 4C10.1 5.16 9.16 6.1 8 6.1C6.84 6.1 5.9 5.16 5.9 4C5.9 2.84 6.84 1.9 8 1.9ZM8 10.9C10.97 10.9 14.1 12.36 14.1 13V14.1H1.9V13C1.9 12.36 5.03 10.9 8 10.9ZM8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0ZM8 9C5.33 9 0 10.34 0 13V15C0 15.55 0.45 16 1 16H15C15.55 16 16 15.55 16 15V13C16 10.34 10.67 9 8 9Z" />
    </svg>
  );
}

function ClassIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-300', className)}
    >
      <path d="M14 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H14C15.1 20 16 19.1 16 18V2C16 0.9 15.1 0 14 0ZM2 2H7V10L4.5 8.5L2 10V2Z" />
    </svg>
  );
}

function ModeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 15.0021 15"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-250', className)}
    >
      <path d="M9.21667 5.01667L9.98333 5.78333L2.43333 13.3333H1.66667V12.5667L9.21667 5.01667ZM12.2167 0C12.0083 0 11.7917 0.0833333 11.6333 0.241667L10.1083 1.76667L13.2333 4.89167L14.7583 3.36667C15.0833 3.04167 15.0833 2.51667 14.7583 2.19167L12.8083 0.241667C12.6417 0.075 12.4333 0 12.2167 0ZM9.21667 2.65833L0 11.875V15H3.125L12.3417 5.78333L9.21667 2.65833Z" />
    </svg>
  );
}

function EditNoteIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 18.1325 15"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-300', className)}
    >
      <path d="M11 5C11 5.55 10.55 6 10 6H1C0.45 6 0 5.55 0 5C0 4.45 0.45 4 1 4H10C10.55 4 11 4.45 11 5ZM0 1C0 1.55 0.45 2 1 2H10C10.55 2 11 1.55 11 1C11 0.45 10.55 0 10 0H1C0.45 0 0 0.45 0 1ZM7 9C7 8.45 6.55 8 6 8H1C0.45 8 0 8.45 0 9C0 9.55 0.45 10 1 10H6C6.55 10 7 9.55 7 9ZM15.01 6.87L15.72 6.16C16.11 5.77 16.74 5.77 17.13 6.16L17.84 6.87C18.23 7.26 18.23 7.89 17.84 8.28L17.13 8.99L15.01 6.87ZM14.3 7.58L9.14 12.74C9.05 12.83 9 12.95 9 13.09V14.5C9 14.78 9.22 15 9.5 15H10.91C11.04 15 11.17 14.95 11.26 14.85L16.42 9.69L14.3 7.58Z" />
    </svg>
  );
}

function MarkunreadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-300', className)}
    >
      <path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" />
    </svg>
  );
}

function PaymentIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-300', className)}
    >
      <path d="M18 0H2C0.89 0 0.00999999 0.89 0.00999999 2L0 14C0 15.11 0.89 16 2 16H18C19.11 16 20 15.11 20 14V2C20 0.89 19.11 0 18 0ZM17 14H3C2.45 14 2 13.55 2 13V8H18V13C18 13.55 17.55 14 17 14ZM18 4H2V3C2 2.45 2.45 2 3 2H17C17.55 2 18 2.45 18 3V4Z" />
    </svg>
  );
}

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.FC<IconProps>;
  prefixMatch?: boolean;
}[] = [
  { href: '/my-page', label: '프로필', icon: PersonOutlineIcon },
  { href: '/my-class', label: '마이 클래스', icon: ClassIcon },
  {
    href: '/my-posts',
    label: '내가 작성한 글',
    icon: ModeIcon,
    prefixMatch: true,
  },
  {
    href: '/my-inquiry',
    label: '1:1 문의',
    icon: EditNoteIcon,
    prefixMatch: true,
  },
  {
    href: '/builder-letter',
    label: '빌더 레터',
    icon: MarkunreadIcon,
    prefixMatch: true,
  },
  {
    href: '/class-payment-management',
    label: '결제 관리',
    icon: PaymentIcon,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: logout } = useLogoutMutation();

  return (
    <div className="border-border-subtle box-border hidden w-[300px] flex-col gap-150 border-x-1 px-300 pt-500 lg:flex">
      {NAV_ITEMS.map((item) => (
        <SidebarItem
          key={item.href}
          onClick={() => router.push(item.href)}
          isActive={
            item.prefixMatch
              ? pathname.startsWith(item.href)
              : pathname === item.href
          }
          icon={item.icon}
        >
          {item.label}
        </SidebarItem>
      ))}
      <div className="bg-border-subtlest h-[1px]" />
      <SidebarItem
        onClick={() => logout()}
        isActive={false}
        icon={PersonOutlineIcon}
      >
        로그아웃
      </SidebarItem>
    </div>
  );
}

function SidebarItem({
  children,
  isActive,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  icon: React.FC<IconProps>;
}) {
  return (
    <div className="flex py-175 pr-150 pl-150">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex cursor-pointer items-center gap-250',
          isActive
            ? 'font-designer-18b text-text-brand'
            : 'font-designer-18m text-text-subtle',
        )}
      >
        <Icon
          className={cn(isActive ? 'text-primary-500' : 'text-text-subtle')}
        />
        {children}
      </button>
    </div>
  );
}
