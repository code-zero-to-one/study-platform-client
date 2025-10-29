import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/features/auth/ui/login-modal';
import Button from '@/shared/ui/button';
import LandingForm from '@/widgets/landing/form';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
};

export default async function Landing() {
  return (
    <>
      <div>
        {/* 메인 소개 */}
        <section className="relative flex flex-col items-center gap-600 py-[80px]">
          {/* 중앙에서 위아래로 퍼지는 그라데이션 배경 오버레이 */}
          <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-gradient-to-b from-white via-[#fff1f3] to-white" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-400">
            <div>
              <p className="font-bold-h1 text-text-strong flex flex-col items-center">
                <span>기획자, 개발자 디자이너를 위한</span>
                <span>프리미엄 멤버십 플랫폼</span>
              </p>

              <p className="text-text-subtle font-designer-16m mt-200 flex flex-col items-center">
                <span>
                  제로원은 수준 높은 IT 인재들의 신뢰와 네트워킹을 바탕으로
                </span>
                <span>
                  학습, 외주, 채용 등 전 생애 커리어를 구축하는 공간입니다.
                </span>
              </p>
            </div>
            <LoginModal
              openTrigger={
                <Button
                  color="primary"
                  className="w-[190px] py-[12px] text-[20px]"
                >
                  제로원 시작하기
                </Button>
              }
            />
          </div>

          <div className="relative h-[591px] w-[1000px]">
            <Image
              src="/images/one-by-one-study.png"
              alt="zeroone 대표 이미지"
              className="rounded-100"
              width={1000}
              height={590}
            />
            {/* 배너 사진 하단 그라데이션 */}
            <div className="pointer-events-none absolute bottom-0 left-0 h-[120px] w-full bg-gradient-to-t from-[#ffffff] to-transparent" />
          </div>
        </section>

        {/* 제로원 솔루션 소개 */}

        <section />
        {/* 현직 전문가 멘토링 */}
        {/* 그룹 스터디 */}
        {/* 성실 온도 시스템 */}
        {/* 우리는 증명합니다 */}
        {/* 전문가 멘토진 */}
        {/* 다양한 스터디 */}
        {/* 오픈 알림 폼  */}
        <LandingForm />
      </div>

      <footer className="bg-background-neutral-strong flex flex-col items-center gap-500 px-[80px] py-[64px]">
        <div className="text-text-inverse font-bold-h3 flex flex-col items-center justify-center gap-200">
          <span>제로원을 방문해주신 모든 분들에게 감사드립니다.</span>
          <span>더욱 더 좋은 서비스와 기회로 보답하도록 하겠습니다.</span>
        </div>

        <div className="flex gap-200">
          <Link
            href="https://www.threads.net/@code_zero_to_one"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/icons/thread.svg"
              alt="thread"
              width={40}
              height={40}
            />
          </Link>
          <Link
            href="https://www.instagram.com/code_zero_to_one/"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/icons/instagram.svg"
              alt="instagram"
              width={40}
              height={40}
            />
          </Link>
          <Link
            href="https://www.youtube.com/@코드제로투원"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/icons/youtube.svg"
              alt="youtube"
              width={40}
              height={40}
            />
          </Link>
        </div>
      </footer>
    </>
  );
}
