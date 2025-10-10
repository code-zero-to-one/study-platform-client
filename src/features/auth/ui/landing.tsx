'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import LoginModal from '@/features/auth/ui/login-modal';
import SignupModal from '@/features/auth/ui/sign-up-modal';
import ApplyGroupStudyModal from '@/features/study/group/ui/apply-group-study-modal';
import Button from '@/shared/ui/button';

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
      {/* 테스트용 */}
      {/* <ApplyGroupStudyModal
        groupStudyId={1}
        title="백엔드 스터디"
        questions={[
          '스터디에 참여하려는 이유는 무엇인가요?',
          '본인이 생각하는 강점과 약점은 무엇인가요?',
        ]}
      /> */}

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
