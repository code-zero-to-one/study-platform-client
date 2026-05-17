'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useLogoutMutation } from '@/hooks/queries/auth/use-auth-mutation';

interface DropdownOption {
  label: string;
  value: string;
  onMenuClick: () => void | Promise<void>;
  badgeCount?: number;
}

export default function HeaderUserDropdown({
  userImg,
  nickname,
  levelName,
}: {
  userImg?: string;
  nickname?: string;
  levelName?: string;
}) {
  const { mutateAsync: logout } = useLogoutMutation();

  const { data: authData, isAuthReady } = useAuthReady();

  const hasAdminRole = isAuthReady && authData?.roleIds.includes('ROLE_ADMIN');

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const baseOptions: DropdownOption[] = [
    {
      label: '마이페이지',
      value: '/my-page',
      onMenuClick: () => router.push('/my-page'),
    },
    {
      label: '로그아웃',
      value: 'logout',
      onMenuClick: handleLogout,
    },
  ];
  const options = hasAdminRole
    ? [
        ...baseOptions,
        {
          label: '서비스 관리',
          value: '/admin',
          onMenuClick: () => router.push('/admin'),
        },
      ]
    : baseOptions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-100">
          <UserAvatar image={userImg} />
          {nickname && (
            <>
              <span className="font-designer-14m text-text-default">
                {nickname}
              </span>
              {levelName && (
                <span
                  className="flex items-center justify-center bg-purple-600 font-designer-10b text-gray-0"
                  style={{ width: 15, height: 15, borderRadius: '7.5px' }}
                >
                  {levelName.charAt(0)}
                </span>
              )}
              <ChevronDown className="h-300 w-300 text-text-subtle" />
            </>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={option.onMenuClick}
            className="active:bg-fill-neutral-subtle-pressed rounded-100 h-[48px] w-full cursor-pointer p-150"
          >
            <div className="flex w-full items-center justify-between">
              <span className="font-designer-14m text-text-subtle">
                {option.label}
              </span>
              {option.badgeCount !== undefined && option.badgeCount > 0 ? (
                <Badge color="orange" shape="round">
                  대기 {option.badgeCount}건
                </Badge>
              ) : null}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
