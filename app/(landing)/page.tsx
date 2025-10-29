import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/features/auth/ui/login-modal';
import Badge from '@/shared/ui/badge';
import Button from '@/shared/ui/button';
import LandingForm from '@/widgets/landing/form';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
};

const SOLUTION_INFO_LIST = [
  {
    title: '빠른 시간 안에 성장할 수 있게',
    description: [
      '시간이 지날수록 늘어지는 취업 준비 기간을',
      '단축시킬 수 있도록 도와드릴게요.',
    ],
    imageSrc: '/images/clock-in-landing-page.svg',
  },
  {
    title: '원하는 만큼 배울 수 있도록',
    description: [
      '혼자서 독학으로 공부하기엔 버거웠던 시간을',
      '자기계발과 함께 바꿔나갈 수 있도록 만들어드려요.',
    ],
    imageSrc: '/images/book-in-landing-page.svg',
  },
  {
    title: 'A to Z STEP',
    description: [
      '한 걸음씩 단계를 밟아가며 개인 스터디부터',
      '외주 프로젝트 경험을 쌓고, 채용 제안까지 연결해드려요.',
    ],
    imageSrc: '/images/shoes-in-landing-page.svg',
  },
];

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
        <section className="flex flex-col items-center gap-500 py-[120px]">
          <Badge className="rounded-200 w-fit">제로원 솔루션</Badge>

          <p className="flex flex-col items-center gap-100">
            <span className="font-bold-h2 text-text-strong">
              중고 신입만 찾는 상황에서 어떻게 계속 준비할지 막막하신가요?
            </span>
            <span className="text-text-subtle font-designer-16m">
              경력보다 실제 역량을 증명하고 그에 걸맞는 최고의 기회를 제안받을
              수 있도록 제로원에서 해결해드릴게요.
            </span>
          </p>

          <ul className="grid grid-cols-3 gap-300">
            {SOLUTION_INFO_LIST.map((solution, index) => (
              <li
                key={index}
                className="rounded-300 bg-background-default flex flex-col gap-250 px-400 py-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="flex flex-col items-center gap-200">
                  <span className="font-bold-h5 text-text-default">
                    {solution.title}
                  </span>

                  <div className="font-designer-14m text-text-subtlest flex flex-col items-center">
                    {solution.description.map((des) => (
                      <span key={des}>{des}</span>
                    ))}
                  </div>
                </div>

                <Image
                  src={solution.imageSrc}
                  alt={solution.title}
                  width={280}
                  height={280}
                />
              </li>
            ))}
          </ul>
        </section>

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
