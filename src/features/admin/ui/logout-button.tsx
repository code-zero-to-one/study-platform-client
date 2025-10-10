'use client';

import { useLogoutMutation } from '@/features/auth/model/use-auth-mutation';
import LogoutIcon from 'public/icons/logout.svg';

export default function LogoutButton() {
  const { mutate: logout } = useLogoutMutation();

  return (
    <button
      className="flex cursor-pointer items-center justify-center"
      onClick={() => logout()}
    >
      <LogoutIcon />
    </button>
  );
}
