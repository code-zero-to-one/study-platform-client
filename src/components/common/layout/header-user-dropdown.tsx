'use client';

import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import { useAuthReady } from '@/hooks/common/use-auth';
import {
  useLogoutMutation,
  useSwitchAuthMutation,
} from '@/hooks/queries/use-auth-mutation';
import type { AuthProvider } from '@/utils/oauth-url';

interface DropdownOption {
  label: string;
  value: string;
  onMenuClick: () => void | Promise<void>;
  badgeCount?: number;
}

export default function HeaderUserDropdown({ userImg }: { userImg: string }) {
  const { mutate: switchAuth } = useSwitchAuthMutation();
  const { mutate: logout } = useLogoutMutation();

  const { data: authData, isAuthReady } = useAuthReady();

  const hasAdminRole = isAuthReady && authData?.roleIds.includes('ROLE_ADMIN');
  const authVendor = authData?.authVendor;
  const currentProvider: AuthProvider =
    authVendor === 'KAKAO' ? 'kakao' : 'google';
  const switchTarget: AuthProvider =
    authVendor === 'KAKAO' ? 'google' : 'kakao';
  const switchLabel =
    authVendor === 'KAKAO' ? '구글 계정으로 전환' : '카카오 계정으로 전환';

  const router = useRouter();

  const baseOptions: DropdownOption[] = [
    {
      label: '마이페이지',
      value: '/my-page',
      onMenuClick: () => router.push('/my-page'),
    },
    authVendor && {
      label: switchLabel,
      value: 'switch-auth',
      onMenuClick: () => switchAuth(switchTarget),
    },
    {
      label: '로그아웃',
      value: 'logout',
      onMenuClick: () => logout(),
    },
  ].filter(Boolean) as DropdownOption[];
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
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div>
          <UserAvatar image={userImg} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={option.onMenuClick}
            className="active:bg-fill-neutral-subtle-pressed rounded-100 h-600 w-full cursor-pointer p-150"
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
