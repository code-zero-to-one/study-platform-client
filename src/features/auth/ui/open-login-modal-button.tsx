'use client';

import { useState } from 'react';
import Button from '@/shared/ui/button';
import LoginModal from './login-modal';

export default function OpenLoginModalButton() {
  const [isOpenLoginModal, setIsOpenLoginModal] = useState<boolean>(false);

  return (
    <>
      <Button
        color="primary"
        size="small"
        onClick={() => setIsOpenLoginModal(true)}
      >
        로그인 / 회원가입
      </Button>
      <LoginModal
        open={isOpenLoginModal}
        onClose={() => setIsOpenLoginModal(false)}
      />
    </>
  );
}
