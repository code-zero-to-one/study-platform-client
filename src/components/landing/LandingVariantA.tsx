// Updated styles and fixed text truncation
'use client';

import Image from 'next/image';
import Link from 'next/link';
import LandingForm from '@/components/ui/form/landing-form';
import { CountingNumber } from '@/components/ui/counting-number';
import {
  HERO_SECTION,
  STATS_SECTION,
  REVIEWS_SECTION,
  GROWTH_SECTION,
  ONE_ON_ONE_STUDY_SECTION,
  MENTOR_SECTION,
  NOTIFICATION_SECTION,
  FOOTER_DATA,
} from '@/constants/landing';

/**
 * A안: 수치/통계 중심 (Stats First)
 * 레이아웃 순서: Hero -> Stats -> Reviews -> Growth -> Mentoring -> Mentor -> Notification -> Footer
 */
export default function LandingVariantA() {
  return (
    <>
      <div>
        {/* ====================================== */}
        {/* Hero & Stats Section combined with gradient background */}
        {/* ====================================== */}
        <section className="relative flex flex-col items-center pt-[96px] pb-[80px]">
          {/* 상단부터 통계 섹션까지 이어지는 그라데이션 배경 */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#ffffff] via-[#fff1f3] via-[50.481%] to-[#ffffff]" />

          {/* Hero Content */}
          <div className="relative z-10 mb-[64px] flex flex-col items-center justify-center gap-[40px] text-center">
            <div className="flex flex-col gap-[24px]">
              <h1 className="text-text-strong flex flex-col items-center text-[52px] font-bold leading-[72px] tracking-[-1.56px]">
                <span>{HERO_SECTION.title.main}</span>
                <span>{HERO_SECTION.title.sub}</span>
              </h1>

              <p className="max-w-[700px] text-[20px] leading-[1.5] font-medium tracking-[-0.6px] text-[#444]">
                {HERO_SECTION.description.map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>

            <Link href="/login">
              <button className="shadow-primary-default/20 flex items-center gap-[12px] rounded-[15.111px] bg-[#f63d68] py-[11.333px] pr-[15.111px] pl-[22.667px] text-[16px] leading-[1.5] font-bold tracking-[-0.48px] !text-[#ffffff] shadow-lg transition-all hover:scale-105">
                <span className="!text-[#ffffff]">{HERO_SECTION.cta}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>
          </div>

          {/* Stats Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex w-full max-w-[1200px] items-center justify-center gap-[20px] px-[24px]">
              {STATS_SECTION.stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex h-[390px] w-[306px] flex-shrink-0 flex-col items-center justify-center rounded-[24px] !bg-[#ffffff] px-[30px] py-[40px] shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex flex-col items-center gap-[12px]">
                    <span className="text-[20px] font-bold tracking-[-0.6px] text-[#111]">
                      {stat.label}
                    </span>
                    <div className="flex items-center gap-[4px] font-bold tracking-[-1.44px] text-[#111]">
                      <CountingNumber
                        value={Number(stat.value)}
                        className="text-[48px] leading-none"
                      />
                      <span className="inline-block -translate-y-[4px] text-[70px] leading-[48px] align-middle text-center">
                        {stat.suffix}
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-[32px] flex size-[160px] items-center justify-center">
                    <Image
                      src={stat.icon}
                      alt={stat.label}
                      width={160}
                      height={160}
                      className="scale-110 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* Reviews Section */}
        {/* ====================================== */}
        <section className="mx-auto flex w-[1440px] max-w-7xl flex-col items-center gap-[64px] py-[112px]">
          <h2 className="text-center text-[36px] font-bold leading-[1.2] tracking-[-1.08px] text-[#111]">
            {REVIEWS_SECTION.title}
          </h2>
          <div className="flex w-full flex-col gap-[32px] px-[240px]">
            {REVIEWS_SECTION.reviews.map((review) => (
              <div
                key={review.id}
                className={`flex items-center gap-[24px] ${
                  review.position === 'right'
                    ? 'flex-row-reverse self-end'
                    : 'self-start'
                }`}
              >
                <div className="relative size-[80px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>

                <div
                  className={`relative rounded-[16px] bg-[#fff3f5] px-[24px] py-[18px] text-[#000] !shadow-none ${
                    review.position === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <p className="text-[16px] leading-[1.5] font-medium tracking-[-0.48px] text-black">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================== */}
        {/* Growth Section */}
        {/* ====================================== */}
        <section className="flex flex-col items-center gap-[48px] bg-[#fff8f9] py-[112px]">
          <div className="mx-auto flex w-[1440px] max-w-7xl flex-col items-start gap-[24px] px-[24px]">
            <div className="inline-flex items-center justify-center rounded-full border border-[#dbdbdb] !bg-[#ffffff] px-[10px] py-[4px]">
              <span className="text-[14px] font-medium tracking-[-0.42px] text-[#111]">
                {GROWTH_SECTION.badge}
              </span>
            </div>

            <div className="flex flex-col items-start gap-[16px]">
              <span className="text-left text-[36px] font-bold leading-[1.2] tracking-[-1.08px] text-[#111]">
                {GROWTH_SECTION.title}
              </span>
              <div className="flex flex-col items-start gap-[24px]">
                <span className="max-w-[800px] text-left text-[20px] leading-[1.5] font-medium tracking-[-0.6px] text-[#444]">
                  {GROWTH_SECTION.description.map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </span>
                <Link href="/groups">
                  <button className="shadow-primary-default/20 flex items-center gap-[12px] rounded-[15.111px] bg-[#f63d68] py-[11.333px] pr-[15.111px] pl-[22.667px] text-[16px] leading-[1.5] font-bold tracking-[-0.48px] !text-[#ffffff] shadow-lg transition-all hover:scale-105">
                    <span className="!text-[#ffffff]">
                      {GROWTH_SECTION.cta}
                    </span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <ul className="scrollbar-hide flex w-full snap-x overflow-x-auto gap-[24px] px-[120px] pb-[40px]">
            {GROWTH_SECTION.cards.map((card, index) => (
              <li
                key={index}
                className="flex h-fit min-h-[380px] w-[280px] flex-shrink-0 snap-center flex-col rounded-[20px] bg-[#ffffff] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]"
              >
                {/* Image Area */}
                <div className="p-[12px] pb-0">
                  <div className="relative h-[180px] w-full overflow-hidden rounded-[16px]">
                    <Image
                      src={card.imageSrc}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col justify-between bg-[#ffffff] p-[20px] pt-[16px]">
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[17px] font-bold tracking-[-0.51px] text-[#111]">
                      {card.title}
                    </span>
                    <div className="text-[14px] font-medium text-[#767676]">
                      {card.description.map((des, idx) => (
                        <span key={idx} className="block">
                          {des}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Area */}
                  <div className="flex items-center gap-[8px] text-[13px] font-medium text-[#999]">
                    <span>{(card as any).location}</span>
                    <span className="text-[#dbdbdb]">|</span>
                    <div className="rounded-full border border-[#dbdbdb] px-[8px] py-[2px] bg-[#ffffff]">
                      <span className="text-[12px] font-bold text-[#111]">
                        {card.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ====================================== */}
        {/* Mentoring Section */}
        {/* ====================================== */}
        <section className="mx-auto flex w-[1440px] max-w-7xl items-center justify-between gap-[40px] px-[24px] py-[112px]">
          <div className="flex flex-1 flex-col gap-[24px]">
            <div className="w-fit rounded-full border border-[#dbdbdb] !bg-[#ffffff] px-[10px] py-[4px]">
              <span className="text-[14px] font-medium tracking-[-0.42px] text-[#111]">
                {ONE_ON_ONE_STUDY_SECTION.badge}
              </span>
            </div>

            <div className="flex flex-col gap-[32px]">
              <h2 className="flex flex-col text-[36px] font-bold leading-[1.2] tracking-[-1.08px] text-[#111]">
                {ONE_ON_ONE_STUDY_SECTION.title.map((t, idx) => (
                  <span key={idx}>{t}</span>
                ))}
              </h2>

              <p className="flex flex-col text-[20px] leading-[1.5] font-medium tracking-[-0.6px] text-[#444]">
                {ONE_ON_ONE_STUDY_SECTION.description.map((des, idx) => (
                  <span key={idx}>{des}</span>
                ))}
              </p>

              <Link href="/one-on-one">
                <button className="shadow-primary-default/20 flex items-center gap-[12px] rounded-[15.111px] bg-[#f63d68] py-[11.333px] pr-[15.111px] pl-[22.667px] text-[16px] leading-[1.5] font-bold tracking-[-0.48px] !text-[#ffffff] shadow-lg transition-all hover:scale-105">
                  <span className="!text-[#ffffff]">
                    {ONE_ON_ONE_STUDY_SECTION.cta}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="relative h-[477px] w-[720px] overflow-hidden rounded-[24px] border border-[#dbdbdb] shadow-xl">
            <Image
              src={ONE_ON_ONE_STUDY_SECTION.imageSrc}
              alt="1:1 스터디"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* ====================================== */}
        {/* Mentor Section */}
        {/* ====================================== */}
        <section className="flex flex-col items-center gap-[48px] bg-[#fff3f5] py-[112px]">
          <div className="mx-auto flex w-[1440px] max-w-7xl flex-col items-start gap-[24px] px-[24px]">
            <div className="inline-flex items-center justify-center rounded-full border border-[#dbdbdb] !bg-[#ffffff] px-[10px] py-[4px]">
              <span className="text-[14px] font-medium tracking-[-0.42px] text-[#111]">
                {MENTOR_SECTION.badge}
              </span>
            </div>

            <div className="flex flex-col items-start gap-[16px]">
              <span className="max-w-[900px] text-left text-[36px] font-bold leading-[1.2] tracking-[-1.08px] text-[#111]">
                {MENTOR_SECTION.title}
              </span>
              <span className="max-w-[900px] text-left text-[20px] leading-[1.5] font-medium tracking-[-0.6px] text-[#444]">
                {MENTOR_SECTION.description.map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <ul className="scrollbar-hide flex w-full snap-x overflow-x-auto gap-[24px] px-[120px] pb-[40px]">
            {MENTOR_SECTION.mentors.map((mentor) => (
              <li
                key={mentor.id}
                className={`flex h-fit min-h-[380px] w-[280px] flex-shrink-0 snap-center flex-col rounded-[20px] ${
                  mentor.name ? 'bg-[#ffffff] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]' : 'bg-[#cccccc]'
                }`}
              >
                {mentor.name ? (
                  <>
                    <div className="relative h-[200px] w-full bg-[#f2f2f2]">
                      <Image
                        src={mentor.avatar}
                        alt={mentor.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-[8px] bg-[#ffffff] p-[20px] pt-[16px]">
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[18px] font-bold tracking-[-0.54px] text-[#111]">
                          {mentor.name}
                        </span>
                        <span className="text-[14px] font-medium text-[#444]">
                          {mentor.title}
                        </span>
                      </div>
                      <div className="mt-[4px] text-[13px] font-medium leading-[1.6] tracking-[-0.36px] text-[#767676]">
                        {mentor.description.map((desc, idx) => (
                          <span key={idx} className="block">
                            {desc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative flex h-full w-full flex-col items-center justify-between pb-[40px]">
                    <div className="relative h-[240px] w-full">
                      <Image
                        src={mentor.avatar}
                        alt="멘토 모집 중"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <button className="rounded-full border border-[#111] bg-white px-[24px] py-[12px] shadow-sm transition-all hover:scale-105 active:scale-95">
                      <span className="text-[16px] font-bold tracking-[-0.48px] text-[#111]">
                        멘토 모집 중입니다.
                      </span>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ====================================== */}
        {/* Notification Form Section */}
        {/* ====================================== */}
        <section className="mx-auto flex w-[1440px] max-w-7xl items-center justify-between gap-[60px] px-[24px] py-[128px]">
          <div className="flex-1">
            <div className="flex flex-col gap-[32px]">
              {(NOTIFICATION_SECTION as any).badge && (
                <div className="w-fit rounded-full border border-[#dbdbdb] !bg-[#ffffff] px-[10px] py-[4px]">
                  <span className="text-[14px] font-medium tracking-[-0.42px] text-[#111]">
                    {(NOTIFICATION_SECTION as any).badge}
                  </span>
                </div>
              )}
              <h2 className="text-[36px] font-bold leading-[1.2] tracking-[-1.08px] text-[#111]">
                {NOTIFICATION_SECTION.title}
              </h2>

              <div className="flex flex-col gap-[8px] text-[20px] leading-[1.5] font-medium tracking-[-0.6px] text-[#444]">
                {NOTIFICATION_SECTION.description.map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-1 justify-end">
            <LandingForm />
          </div>
        </section>
      </div>

      {/* ====================================== */}
      {/* Footer */}
      {/* ====================================== */}
      <footer className="bg-background-neutral-strong flex flex-col items-center gap-500 px-[80px] py-[64px]">
        <div className="text-text-inverse font-bold-h3 flex flex-col items-center justify-center gap-200">
          {FOOTER_DATA.message.map((line, idx) => (
            <span key={idx}>{line}</span>
          ))}
        </div>

        <div className="flex gap-200">
          {FOOTER_DATA.socials.map((social) => (
            <Link
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={social.icon}
                alt={social.name}
                width={40}
                height={40}
              />
            </Link>
          ))}
        </div>

        <div className="text-text-inverse font-designer-12m mt-400 flex w-full flex-col items-center gap-100 border-t border-white/20 pt-400">
          <div className="flex flex-wrap items-center justify-center gap-200">
            <span>상호명: {FOOTER_DATA.business.companyName}</span>
            <span className="text-white/60">|</span>
            <span>대표자명: {FOOTER_DATA.business.ceo}</span>
            <span className="text-white/60">|</span>
            <span>전화번호: {FOOTER_DATA.business.phone}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-200">
            <span>사업자번호: {FOOTER_DATA.business.businessNumber}</span>
            <span className="text-white/60">|</span>
            <span>사업장 주소: {FOOTER_DATA.business.address}</span>
          </div>
          <div className="text-text-inverse font-designer-11m mt-100 text-white/80">
            {FOOTER_DATA.copyright}
          </div>
        </div>
      </footer>
    </>
  );
}
