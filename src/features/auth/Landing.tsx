'use client'

import LoginModal from "@/features/auth/LoginModal";
import Button from "@/shared/ui/button"
import Image from "next/image"
import { useState } from "react";

export default function Landing() {
  const [open, setOpen] = useState(false);
  
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
          <div className="p-4 text-center"></div>
          <Button color="primary" size="large" onClick={() => setOpen(true)}>
            시작하기
          </Button>
          <LoginModal open={open} onClose={() => setOpen(false)} />
        </section>
        <section className="w-[349.44px] h-[524.16px] flex-shrink-0 aspect-[349.44/524.16] bg-[url('/your-image.jpg')] bg-cover bg-no-repeat bg-center">
          <Image src="graphic-area.svg" alt="Graphic Area" width={345} height={348} />
        </section>
      </main>
  )
}