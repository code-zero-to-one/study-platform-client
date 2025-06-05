'use client'

import LoginModal from "@/features/auth/LoginModal";
import SignupModal from "@/features/auth/SignupModal";
import Button from "@/shared/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react";

export default function Landing({ isSignupPage }: { isSignupPage: boolean }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  // 쿠키 파싱 함수
  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  useEffect(() => {
    // 소셜 로그인 성공후 리디렉션되는 페이지
    if(isSignupPage) {
      console.log(document.cookie);

      const accessToken = getCookie("access_token"); // accessToken (공통)
      const isSuccess = getCookie("is_success"); // 소셜 로그인 성공 여부 (공통)
      const userName = getCookie("user_name"); // 소셜 로그인에 적용된 유저이름 (가입되지 않은 회원일 경우)
      const profileImageUrl = getCookie("profile_image_url"); // 소셜 로그인에 적용된 프로필 이미지 URL (가입되지 않은 회원일 경우)
      const memberId = getCookie("member_id"); // 로그인한 회원의 고유 ID (가입된 회원일 경우)
    
      // 우선 모든 쿠키값을 localStorage에 저장
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (isSuccess) localStorage.setItem("isSuccess", isSuccess);
      if (userName) localStorage.setItem("userName", decodeURI(userName));
      if (profileImageUrl) localStorage.setItem("profileImageUrl", profileImageUrl);
      if (memberId) localStorage.setItem("memberId", memberId);

      // 회원가입 모달 열기
      setSignupOpen(isSignupPage);
    }
  }, [isSignupPage]);

  return (
      <main className="flex flex-row items-center justify-center h-full pt-[100px]">
        <section className="flex flex-col w-[378px] items-start gap-[60px]">
          <h1 className="text-[52px] font-bold leading-[78px] text-[#333436] font-pretendard w-full">
            ZERO - ONE
          </h1>
          <p className="text-24 font-medium text-[#535862] w-[378px]">
            ZERO-ONE에 오신 것을 환영합니다! <br />
            개발자 면접 준비, 이제 ZERO-ONE에서 <br />
            매주 실전처럼 연습해보세요.
          </p>
          <Button color="primary" size="large" className="w-[234px]" onClick={() => setLoginOpen(true)}>
            시작하기
          </Button>
          <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
          <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />
        </section>
        <section className="w-[349.44px] h-[524.16px] flex-shrink-0 aspect-[349.44/524.16] bg-[url('/your-image.jpg')] bg-cover bg-no-repeat bg-center">
          <Image src="graphic-area.svg" alt="Graphic Area" width={345} height={348} />
        </section>
      </main>
  )
}