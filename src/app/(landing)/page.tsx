import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import LandingForm from '@/components/common/ui/form/landing-form';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'ZERO-ONE - 1:1 기상 스터디 플랫폼',
  description:
    '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼. 현직 멘토와 함께 성장 로드맵을 구성하고, 그룹 스터디로 협업 경험을 쌓으세요.',
  path: '/',
  ogImage: 'https://www.zeroone.it.kr/images/og-image.png',
  keywords: [
    '스터디',
    '기상',
    '멘토링',
    '1:1 스터디',
    '개발자',
    '면접 준비',
    '개발자 커뮤니티',
    '성장',
  ],
  canonicalUrl: 'https://www.zeroone.it.kr/',
});

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

// todo imageSrc 수정
const SUGGESTION_INFO_LIST = [
  {
    badge: '현직 전문가 멘토링',
    title: ['어떻게 시작해야할지 모르겠다면?'],
    description: [
      '실무자와 함께 당신의 수준과 목표에 맞는 성장 로드맵을 구성해보세요.',
      '1:1 멘토링 과정을 통해 구체적인 방향을 제시해드릴게요.',
    ],
    imageSrc: '/images/one-by-one-study.png',
  },
  {
    badge: '그룹 스터디',
    title: ['협업 경험을 쌓고 성장해보세요'],
    description: [
      '나와 비슷한 사람들이 함께 모여 스터디를 진행하면서',
      '서로에게 성장 자극을 줄 수 있도록 만들어요.',
    ],
    imageSrc: '/images/one-by-one-study.png',
  },
  {
    badge: '성실 온도 시스템',
    title: ['프로젝트를 더 자주 빠르게', '제안 받을 수 있는'],
    description: [
      '제로원에서 적극적으로 활동해서 성실 온도가 올라갈수록',
      '외주 프로젝트, 채용 제안을 적극적으로 받을 기회가 늘어나요.',
    ],
    imageSrc: '/images/one-by-one-study.png',
  },
];

export default async function Landing() {
  return (
    <>
      <div>
        {/* 메인 소개 */}
        <section className="relative flex flex-col items-center gap-600 py-400 md:py-[80px]">
          {/* 중앙에서 위아래로 퍼지는 그라데이션 배경 오버레이 */}
          <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-gradient-to-b from-background-default via-rose-50 to-background-default" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-400">
            <div>
              <p className="font-bold-h1 text-text-strong flex flex-col items-center">
                <span>IT 업계 선배들이 진행하는</span>
                <span>프리미엄 실전 스터디/외주 플랫폼</span>
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
            <Link href="/login">
              <Button
                color="primary"
                className="w-full max-w-[190px] py-150 font-designer-18m"
              >
                제로원 시작하기
              </Button>
            </Link>
          </div>

          <div className="relative w-full max-w-[1000px]">
            <Image
              src="/images/one-by-one-study.png"
              alt="zeroone 대표 이미지"
              className="h-auto w-full rounded-100"
              width={1000}
              height={590}
              priority
            />
            {/* 배너 사진 하단 그라데이션 */}
            <div className="pointer-events-none absolute bottom-0 left-0 h-[120px] w-full bg-gradient-to-t from-background-default to-transparent" />
          </div>
        </section>
        {/* 제로원 솔루션 소개 */}
        <section className="flex flex-col items-center gap-500 py-600 md:py-[120px]">
          <Badge className="rounded-200 w-fit">제로원 솔루션</Badge>

          <p className="flex flex-col items-center gap-100">
            <span className="font-bold-h4 sm:font-bold-h2 text-text-strong">
              중고 신입만 찾는 상황에서 어떻게 계속 준비할지 막막하신가요?
            </span>
            <span className="text-text-subtle font-designer-16m">
              경력보다 실제 역량을 증명하고 그에 걸맞는 최고의 기회를 제안받을
              수 있도록 제로원에서 해결해드릴게요.
            </span>
          </p>

          <ul className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
            {SOLUTION_INFO_LIST.map((solution, index) => (
              <li
                key={index}
                className="rounded-300 bg-background-default flex flex-col gap-250 px-400 py-500 shadow-1"
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
        {/* 현직 전문가 멘토링, 그룹 스터디, 성실 온도 시스템 */}
        {SUGGESTION_INFO_LIST.map((suggestion) => (
          <section
            key={suggestion.badge}
            className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-400 px-300 py-600 md:px-0 md:py-[120px] lg:flex-row lg:justify-between"
          >
            {/* 왼쪽 컨텐츠 */}
            <div className="flex-1">
              <Badge className="rounded-200 w-fit">{suggestion.badge}</Badge>

              <div className="mt-200 flex flex-col gap-300">
                <p className="font-bold-h4 sm:font-bold-h2 text-text-strong flex flex-col">
                  {suggestion.title.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>

                <p className="text-text-subtle font-designer-16m flex flex-col">
                  {suggestion.description.map((des) => (
                    <span key={des}>{des}</span>
                  ))}
                </p>
              </div>
            </div>

            {/* todo border 삭제 */}
            <Image
              src={suggestion.imageSrc}
              alt={suggestion.badge}
              width={600}
              height={400}
              className="rounded-200 border-border-default h-auto w-full border"
            />
          </section>
        ))}
        {/* 우리는 증명합니다 */}
        {/* 전문가 멘토진 */}
        {/* 다양한 스터디 */}
        {/* 오픈 알림 폼  */}
        <section className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-400 px-300 py-600 md:px-0 md:py-[120px] lg:flex-row lg:justify-between">
          {/* 왼쪽 컨텐츠 */}
          <div className="flex-1">
            <Badge className="rounded-200 w-fit">
              마감까지 얼마 남지 않았어요
            </Badge>

            <div className="mt-200 flex flex-col gap-300">
              <p className="font-bold-h4 sm:font-bold-h2 text-text-strong flex flex-col">
                <span>당신을 위한 스터디가 준비중입니다.</span>
                {/* <span>연락드릴게요!</span> */}
              </p>

              <p className="text-text-subtle font-designer-16m flex flex-col">
                <span>현재 멘토님들이 스터디 개설을 준비하고 있어요.</span>
                <br />
                <span>알림을 신청하시면 나의 관심분야에 대한</span>
                <span>오픈 정보를 가장 먼저 알려드릴게요.</span>
                {/* <span>정보를 가장 먼저 알려드릴게요.</span> */}
                <br />
                <span>
                  (선착순 모집 마감시에는 알림이 발송되지 않을 수 있습니다)
                </span>
              </p>
            </div>
          </div>

          {/* 오른쪽 컨텐츠 */}
          <LandingForm />
        </section>
      </div>

      <footer className="bg-background-neutral-strong flex flex-col items-center gap-500 px-400 py-[64px] lg:px-800">
        <div className="text-text-inverse font-designer-18b sm:font-bold-h3 flex flex-col items-center justify-center gap-200">
          <span>제로원을 방문해주신 모든 분들에게 감사드립니다.</span>
          <span>더욱 더 좋은 서비스와 기회로 보답하도록 하겠습니다!</span>
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

        {/* 사업자 정보 */}
        <div className="text-text-inverse font-designer-12m mt-400 flex w-full flex-col items-center gap-100 border-t border-background-default/20 pt-400">
          <div className="flex flex-wrap items-center justify-center gap-200">
            <span>상호명: 정성컴퍼니</span>
            <span className="text-background-default/60">|</span>
            <span>대표자명: 조성진</span>
            <span className="text-background-default/60">|</span>
            <span>전화번호: 010-6856-6609</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-200">
            <span>사업자번호: 798-31-01774</span>
            <span className="text-background-default/60">|</span>
            <span>사업장 주소: 서울시 강남구 역삼동 620-17 203호</span>
          </div>
          <div className="text-text-inverse font-designer-11m mt-100 text-background-default/80">
            © 2024 ZERO-ONE. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
