'use client';

import Image from 'next/image';
import Link from 'next/link';
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
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import LandingForm from '@/components/ui/form/landing-form';

/**
 * B안: 사용자 후기 중심 (Reviews First)
 * 레이아웃 순서: Hero -> Reviews -> Stats -> Growth -> Mentoring -> Mentor -> Notification -> Footer
 */
export default function LandingVariantB() {
  return (
    <>
      <div>
        {/* ====================================== */}
        {/* Hero Section */}
        {/* ====================================== */}
        <section className="relative flex flex-col items-center gap-600 py-[80px]">
          <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-gradient-to-b from-white via-[#fff1f3] to-white" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-400">
            <div>
              <p className="font-bold-h1 text-text-strong flex flex-col items-center">
                <span>{HERO_SECTION.title.main}</span>
                <span>{HERO_SECTION.title.sub}</span>
              </p>

              <p className="text-text-subtle font-designer-16m mt-200 flex flex-col items-center">
                {HERO_SECTION.description.map((line, idx) => (
                  <span key={idx}>{line}</span>
                ))}
              </p>
            </div>

            <Link href="/login">
              <Button
                color="primary"
                className="w-[190px] py-[12px] text-[20px]"
              >
                {HERO_SECTION.cta}
              </Button>
            </Link>
          </div>

          <div className="relative h-[591px] w-[1000px]">
            <Image
              src="/images/one-by-one-study.png"
              alt="제로원 대표 이미지"
              className="rounded-100"
              width={1000}
              height={590}
            />
            {/* TODO: [B안] 실제 히어로 이미지 경로 교체 필요 */}
            <div className="pointer-events-none absolute bottom-0 left-0 h-[120px] w-full bg-gradient-to-t from-[#ffffff] to-transparent" />
          </div>
        </section>

        {/* ====================================== */}
        {/* Reviews Section (B안의 핵심: 먼저 보여줌) */}
        {/* ====================================== */}
        <section className="mx-auto flex w-[1160px] max-w-7xl flex-col items-center gap-600 bg-gradient-to-b from-white via-[#fff8f9] to-white py-[120px]">
          <h2 className="font-bold-h2 text-text-strong text-center">
            {REVIEWS_SECTION.title}
          </h2>

          <div className="grid grid-cols-2 gap-x-[120px] gap-y-400 w-full">
            {REVIEWS_SECTION.reviews.map((review) => (
              <div
                key={review.id}
                className={`flex items-start gap-300 ${
                  review.position === 'right' ? 'justify-end' : ''
                }`}
              >
                {review.position === 'left' && (
                  <div className="relative h-[64px] w-[64px] flex-shrink-0">
                    {/* TODO: [B안] 실제 아바타 이미지 경로 교체 필요 */}
                    <div className="rounded-full bg-gradient-to-br from-blue-200 to-purple-200 h-full w-full" />
                  </div>
                )}

                <div
                  className={`rounded-300 bg-background-subtle max-w-[400px] px-400 py-300 shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${
                    review.position === 'right' ? 'text-right' : ''
                  }`}
                >
                  <p className="font-designer-16m text-text-default">
                    {review.text}
                  </p>
                </div>

                {review.position === 'right' && (
                  <div className="relative h-[64px] w-[64px] flex-shrink-0">
                    {/* TODO: [B안] 실제 아바타 이미지 경로 교체 필요 */}
                    <div className="rounded-full bg-gradient-to-br from-pink-200 to-orange-200 h-full w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ====================================== */}
        {/* Stats Section (B안에서는 나중에) */}
        {/* ====================================== */}
        <section className="flex flex-col items-center gap-500 py-[120px]">
          <h2 className="font-bold-h2 text-text-strong text-center">
            {STATS_SECTION.title}
          </h2>

          <ul className="grid grid-cols-3 gap-300">
            {STATS_SECTION.stats.map((stat, index) => (
              <li
                key={index}
                className="rounded-300 bg-background-default flex min-w-[280px] flex-col items-center gap-300 px-500 py-600 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="flex flex-col items-center gap-200">
                  <span className="font-designer-14m text-text-subtle">
                    {stat.label}
                  </span>
                  <span className="font-bold-h1 text-primary-strong">
                    {stat.value}
                    <span className="text-primary-default">{stat.suffix}</span>
                  </span>
                </div>

                {/* 아이콘 이미지 */}
                <div className="relative h-[120px] w-[120px]">
                  <div className="rounded-full bg-gradient-to-br from-pink-100 to-purple-100 h-full w-full flex items-center justify-center">
                    {/* TODO: [B안] 실제 아이콘 이미지 경로 교체 필요 */}
                    <span className="text-[64px]">
                      {index === 0 ? '⏰' : index === 1 ? '📚' : '👏'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ====================================== */}
        {/* Growth Section */}
        {/* ====================================== */}
        <section className="bg-background-subtle flex flex-col items-center gap-500 py-[120px]">
          <Badge className="rounded-200 w-fit">{GROWTH_SECTION.badge}</Badge>

          <p className="flex flex-col items-center gap-100">
            <span className="font-bold-h2 text-text-strong">
              {GROWTH_SECTION.title}
            </span>
            <span className="text-text-subtle font-designer-16m text-center">
              {GROWTH_SECTION.description.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </span>
          </p>

          <ul className="grid grid-cols-3 gap-300 mt-400">
            {GROWTH_SECTION.cards.map((card, index) => (
              <li
                key={index}
                className="rounded-300 bg-background-default flex flex-col gap-250 px-400 py-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <Badge className="rounded-200 w-fit">{card.badge}</Badge>

                <div className="flex flex-col gap-200">
                  <span className="font-bold-h5 text-text-default">
                    {card.title}
                  </span>
                  <div className="font-designer-14m text-text-subtlest">
                    {card.description.map((des, idx) => (
                      <span key={idx} className="block">
                        {des}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative h-[200px] w-full">
                  {/* TODO: [B안] 실제 카드 이미지 경로 교체 필요 */}
                  <div className="rounded-200 bg-gradient-to-br from-slate-100 to-slate-200 h-full w-full" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ====================================== */}
        {/* Mentoring Section */}
        {/* ====================================== */}
        <section className="mx-auto flex w-[1160px] max-w-7xl items-center justify-between gap-400 py-[120px]">
          <div className="flex-1">
            <Badge className="rounded-200 w-fit">
              {ONE_ON_ONE_STUDY_SECTION.badge}
            </Badge>

            <div className="mt-200 flex flex-col gap-300">
              <p className="font-bold-h2 text-text-strong flex flex-col">
                {ONE_ON_ONE_STUDY_SECTION.title.map((t, idx) => (
                  <span key={idx}>{t}</span>
                ))}
              </p>

              <p className="text-text-subtle font-designer-16m flex flex-col">
                {ONE_ON_ONE_STUDY_SECTION.description.map((des, idx) => (
                  <span key={idx}>{des}</span>
                ))}
              </p>
            </div>
          </div>

          <div className="relative h-[400px] w-[600px]">
            {/* TODO: [B안] 실제 멘토링 이미지 경로 교체 필요 */}
            <div className="rounded-200 bg-gradient-to-br from-gray-100 to-gray-200 h-full w-full" />
          </div>
        </section>

        {/* ====================================== */}
        {/* Mentor Section */}
        {/* ====================================== */}
        <section className="bg-background-subtle flex flex-col items-center gap-500 py-[120px]">
          <Badge className="rounded-200 w-fit">{MENTOR_SECTION.badge}</Badge>

          <p className="flex flex-col items-center gap-100">
            <span className="font-bold-h2 text-text-strong text-center">
              {MENTOR_SECTION.title}
            </span>
            <span className="text-text-subtle font-designer-16m text-center max-w-[800px]">
              {MENTOR_SECTION.description.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </span>
          </p>

          <ul className="grid grid-cols-4 gap-300 mt-400">
            {MENTOR_SECTION.mentors.map((mentor) => (
              <li
                key={mentor.id}
                className="rounded-300 bg-background-default flex flex-col items-center gap-300 px-400 py-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="relative h-[120px] w-[120px]">
                  {/* TODO: [B안] 실제 멘토 아바타 이미지 경로 교체 필요 */}
                  <div className="rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 h-full w-full" />
                </div>

                <div className="flex flex-col items-center gap-100">
                  <span className="font-bold-h5 text-text-strong">
                    {mentor.name}
                  </span>
                  <span className="font-designer-14m text-text-subtle">
                    {mentor.title}
                  </span>
                  <div className="font-designer-12m text-text-subtlest text-center">
                    {mentor.description.map((desc, idx) => (
                      <span key={idx} className="block">
                        {desc}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ====================================== */}
        {/* Notification Form Section */}
        {/* ====================================== */}
        <section className="mx-auto flex w-[1160px] max-w-7xl items-center justify-between gap-400 py-[120px]">
          <div className="flex-1">
            <Badge className="rounded-200 w-fit">
              {NOTIFICATION_SECTION.badge}
            </Badge>

            <div className="mt-200 flex flex-col gap-300">
              <p className="font-bold-h2 text-text-strong">
                {NOTIFICATION_SECTION.title}
              </p>

              <p className="text-text-subtle font-designer-16m">
                {NOTIFICATION_SECTION.description.map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <LandingForm />
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

