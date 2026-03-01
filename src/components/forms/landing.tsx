'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import LoginModal from '@/components/modals/login-modal';
import SignupModal from '@/components/modals/sign-up-modal';
import Button from '@/components/ui/button';

export default function Landing({ isSignupPage }: { isSignupPage: boolean }) {
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (isSignupPage) {
      setSignupOpen(true);
    }
  }, [isSignupPage]);

  return (
    <main className="flex h-full flex-row items-center justify-center pt-[100px]">
      <section className="flex w-[378px] flex-col items-start gap-[60px]">
        <h1 className="font-pretendard w-full text-[52px] leading-[78px] font-bold text-[#333436]">
          ZERO - ONE
        </h1>
        <p className="text-24 w-[378px] font-medium text-[#535862]">
          ZERO-ONE에 오신 것을 환영합니다! <br />
          개발자 면접 준비, 이제 ZERO-ONE에서 <br />
          매주 실전처럼 연습해보세요.
        </p>

        <LoginModal
          openTrigger={
            <Button color="primary" size="large" className="w-[234px]">
              시작하기
            </Button>
          }
        />
        <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />
      </section>
      <section className="aspect-[349.44/524.16] h-[524.16px] w-[349.44px] flex-shrink-0 bg-cover bg-center bg-no-repeat">
        <Image
          src="graphic-area.svg"
          alt="Graphic Area"
          width={345}
          height={348}
        />
      </section>
    </main>
  );
}
