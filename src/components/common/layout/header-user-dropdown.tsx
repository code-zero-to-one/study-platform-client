'use client';

import { ChevronDown, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import LogoutConfirmModal from '@/components/common/modals/logout-confirm-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import UserAvatar from '@/components/common/ui/avatar';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useMyClassProfileQuery } from '@/hooks/queries/user/use-my-class-profile-query';
import { useUserStore } from '@/stores/use-user-store';
import { getDefaultAvatarSrc } from '@/utils/avatar-utils';

const PersonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="size-300 text-gray-300"
    aria-hidden="true"
  >
    <path
      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V18C20 15.34 14.67 14 12 14Z"
      fill="currentColor"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="size-300 text-gray-300"
    aria-hidden="true"
  >
    <path
      d="M5.10437 5H11.1044C11.6544 5 12.1044 4.55 12.1044 4C12.1044 3.45 11.6544 3 11.1044 3H5.10437C4.00437 3 3.10437 3.9 3.10437 5V19C3.10437 20.1 4.00437 21 5.10437 21H11.1044C11.6544 21 12.1044 20.55 12.1044 20C12.1044 19.45 11.6544 19 11.1044 19H5.10437V5Z"
      fill="currentColor"
    />
    <path
      d="M20.7544 11.65L17.9644 8.86C17.6444 8.54 17.1044 8.76 17.1044 9.21V11H10.1044C9.55437 11 9.10437 11.45 9.10437 12C9.10437 12.55 9.55437 13 10.1044 13H17.1044V14.79C17.1044 15.24 17.6444 15.46 17.9544 15.14L20.7444 12.35C20.9444 12.16 20.9444 11.84 20.7544 11.65Z"
      fill="currentColor"
    />
  </svg>
);

interface DropdownOption {
  label: string;
  value: string;
  icon: ReactNode;
  onMenuClick: () => void | Promise<void>;
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
  const memberId = useUserStore((state) => state.memberId);
  const [open, setOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const mql = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [open]);

  const { data: authData, isAuthReady } = useAuthReady();
  const { data: myClassProfile } = useMyClassProfileQuery();

  const hasAdminRole = isAuthReady && authData?.roleIds.includes('ROLE_ADMIN');
  const email = myClassProfile?.email;

  const router = useRouter();

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const baseOptions: DropdownOption[] = [
    {
      label: '마이 페이지',
      value: '/my-page',
      icon: <PersonIcon />,
      onMenuClick: () => router.push('/my-page'),
    },
    {
      label: '로그아웃',
      value: 'logout',
      icon: <LogoutIcon />,
      onMenuClick: handleLogout,
    },
  ];
  const options = hasAdminRole
    ? [
        ...baseOptions,
        {
          label: '서비스 관리',
          value: '/admin',
          icon: <Settings className="size-300 text-gray-300" />,
          onMenuClick: () => router.push('/admin'),
        },
      ]
    : baseOptions;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="flex items-center gap-100">
            <UserAvatar
              image={userImg}
              fallbackSrc={getDefaultAvatarSrc(memberId)}
            />
            {nickname && (
              <>
                <span className="font-designer-14m text-text-default">
                  {nickname}
                </span>
                {levelName && (
                  <span className="flex size-188 items-center justify-center rounded-full bg-purple-600 font-designer-10b text-gray-0">
                    {levelName.charAt(0)}
                  </span>
                )}
                <ChevronDown className="h-300 w-300 text-text-subtle" />
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          alignOffset={-7}
          sideOffset={32}
          className="w-3725 rounded-200 border-none bg-background-default px-250 pt-300 pb-225 shadow-2 max-lg:hidden"
        >
          <div className="flex items-center gap-225">
            <UserAvatar
              image={userImg}
              size={48}
              fallbackSrc={getDefaultAvatarSrc(memberId)}
            />
            <div className="flex flex-col gap-25">
              <div className="flex items-center gap-50">
                <span className="font-designer-18b text-text-default">
                  {nickname}
                </span>
                {levelName && (
                  <span className="flex size-188 items-center justify-center rounded-full bg-purple-600 font-designer-10b text-gray-0">
                    {levelName.charAt(0)}
                  </span>
                )}
              </div>
              {email && (
                <span className="font-designer-13r text-gray-500">{email}</span>
              )}
            </div>
          </div>

          <div className="mt-225 flex flex-col gap-125">
            {options.map((option) => (
              <Fragment key={option.value}>
                <DropdownMenuSeparator className="mx-0 my-0 bg-gray-200" />
                <DropdownMenuItem
                  onClick={option.onMenuClick}
                  className="active:bg-fill-neutral-subtle-pressed cursor-pointer gap-125 rounded-100 p-125"
                >
                  {option.icon}
                  <span className="font-designer-13m text-gray-500">
                    {option.label}
                  </span>
                </DropdownMenuItem>
              </Fragment>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
      />
    </>
  );
}
