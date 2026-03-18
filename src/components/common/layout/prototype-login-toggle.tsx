'use client';

import { useEffect, useState } from 'react';
import HeaderUserDropdown from '@/components/common/layout/header-user-dropdown';
import Button from '@/components/common/ui/button';
import { ToggleSwitch } from '@/components/common/ui/toggle';

const STORAGE_KEY = 'prototype-login';

export default function PrototypeLoginToggle() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsLoggedIn(stored === 'true');
    setMounted(true);
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsLoggedIn(checked);
    localStorage.setItem(STORAGE_KEY, String(checked));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-75">
      {isLoggedIn ? (
        <HeaderUserDropdown userImg={undefined} />
      ) : (
        <Button size="small" className="font-designer-14m" disabled>
          로그인 / 회원가입
        </Button>
      )}
      <div className="flex items-center gap-100">
        <span className="font-designer-14r text-text-subtle">로그인</span>
        <ToggleSwitch.Root
          size="md"
          checked={isLoggedIn}
          onCheckedChange={handleToggle}
        />
      </div>
    </div>
  );
}
