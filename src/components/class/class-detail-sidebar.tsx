'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import dynamic from 'next/dynamic';
import { Fragment } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type {
  CourseDetailResponse,
  GiftEmailResponse,
} from '@/types/api/course.types';
import { getAttributionParams } from '@/utils/attribution-tracker';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

interface ClassDetailSidebarProps {
  courseDetail: CourseDetailResponse | undefined;
  isAuthenticated: boolean;
  ctaLabel: string | undefined;
  viewerStatusLabel: string | undefined;
  isEnrolling: boolean;
  onShare: () => void;
  onStartCourse: () => void;
  myGiftEmail: GiftEmailResponse | undefined;
  giftEmail: string;
  onGiftEmailChange: (email: string) => void;
  onRegisterGiftEmail: () => void;
  isRegisteringGiftEmail: boolean;
}

export function ClassDetailSidebar({
  courseDetail,
  isAuthenticated,
  ctaLabel,
  viewerStatusLabel,
  isEnrolling,
  onShare,
  onStartCourse,
  myGiftEmail,
  giftEmail,
  onGiftEmailChange,
  onRegisterGiftEmail,
  isRegisteringGiftEmail,
}: ClassDetailSidebarProps) {
  return (
    <div className="sticky top-550">
      <div className="overflow-hidden rounded-150 border border-border-subtle">
        <div className="p-300">
          {courseDetail?.earlyBirdEndsAt && (
            <span className="inline-block rounded-50 bg-background-brand-default px-75 py-25 font-designer-12r text-text-inverse">
              얼리버드 특가
            </span>
          )}
          <h3
            className={cn(
              'font-designer-28b text-gray-800',
              courseDetail?.earlyBirdEndsAt && 'mt-75',
            )}
          >
            {courseDetail?.title ?? '바이브 코딩 입문자 코스'}
          </h3>
          <p className="mt-150 whitespace-pre-line font-designer-16r text-gray-800">
            {courseDetail?.description ??
              '바이브 코딩 막막함 이젠\nZERO-ONE의 빌더들과 함께 뿌셔보세요!'}
          </p>

          {viewerStatusLabel ? (
            <span className="mt-150 inline-block rounded-50 bg-gray-100 px-75 py-25 font-designer-12r text-gray-800">
              {viewerStatusLabel}
            </span>
          ) : null}

          <span className="mt-150 inline-block rounded-50 bg-gray-400 px-75 py-25 font-designer-12r text-text-inverse">
            혜택
          </span>
          <p className="mt-75 font-designer-14r text-gray-500">
            Claude Pro 1개월 Gift 증정 + 무제한 빌더피드 +
            <br />
            {courseDetail?.freeLessonCount !== null &&
            courseDetail?.freeLessonCount !== undefined
              ? `${courseDetail.freeLessonCount}개 레슨`
              : 'N개 레슨'}{' '}
            + 실습 가이드
          </p>

          {courseDetail?.plans && courseDetail.plans.length > 0 ? (
            <div className="mt-300">
              <p className="font-designer-14b text-gray-800">
                무료 온보딩 이후 코스 금액가
              </p>
              {courseDetail.plans.map((plan, idx) => (
                <Fragment key={plan.planCode}>
                  {idx > 0 && <hr className="my-300 border-border-subtle" />}
                  <p className="mt-75 font-designer-14sb text-gray-800">
                    {plan.name}
                  </p>
                  <div className="flex items-center gap-50">
                    <p className="font-designer-16r text-gray-500">정가</p>
                    <p className="font-designer-16r text-gray-500 line-through">
                      {plan.regularPrice.toLocaleString()}원
                    </p>
                  </div>
                  <p className="mt-75 font-designer-30b text-gray-800">
                    {plan.discountPrice.toLocaleString()}원
                  </p>
                </Fragment>
              ))}
            </div>
          ) : null}

          <div className="mt-300 flex items-center gap-50">
            <svg
              viewBox="0 0 20.3025 20.3025"
              className="size-300 shrink-0 text-gray-800"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.01 2.35L18.6 1.7L17.95 0.29C17.77 -0.1 17.22 -0.1 17.04 0.29L16.4 1.7L14.99 2.35C14.6 2.53 14.6 3.08 14.99 3.26L16.4 3.9L17.05 5.31C17.23 5.7 17.78 5.7 17.96 5.31L18.6 3.9L20.01 3.25C20.4 3.08 20.4 2.52 20.01 2.35Z" />
              <path d="M7 12.55C7.69 12.55 8.25 11.99 8.25 11.3C8.25 10.61 7.69 10.05 7 10.05C6.31 10.05 5.75 10.61 5.75 11.3C5.75 11.99 6.31 12.55 7 12.55Z" />
              <path d="M13 12.55C13.69 12.55 14.25 11.99 14.25 11.3C14.25 10.61 13.69 10.05 13 10.05C12.31 10.05 11.75 10.61 11.75 11.3C11.75 11.99 13.69 12.55 13 12.55Z" />
              <path d="M17.5 7.1C16.72 7.1 16.01 6.64 15.68 5.93L15.27 5.03L14.37 4.62C13.66 4.29 13.2 3.58 13.2 2.8C13.2 2.14 13.54 1.54 14.07 1.17C12.83 0.62 11.45 0.3 10 0.3C4.48 0.3 0 4.78 0 10.3C0 15.82 4.48 20.3 10 20.3C15.52 20.3 20 15.82 20 10.3C20 8.85 19.68 7.47 19.13 6.23C18.76 6.76 18.16 7.1 17.5 7.1ZM10 18.3C5.59 18.3 2 14.71 2 10.3C2 10.25 2.01 10.2 2 10.16C4.6 9.18 6.69 7.17 7.74 4.61C9.58 6.86 12.37 8.3 15.5 8.3C16.25 8.3 16.97 8.21 17.67 8.06C17.88 8.77 18 9.52 18 10.3C18 14.71 14.41 18.3 10 18.3Z" />
            </svg>
            <p className="font-designer-14m text-gray-800">
              지금{' '}
              <span className="text-text-brand">
                {courseDetail?.exploringCount ?? 0}
              </span>
              명이 이 코스를 탐색하고 있어요!
            </p>
          </div>

          <div className="mt-300 flex flex-col gap-150">
            <button
              type="button"
              onClick={() => {
                sendGTMEvent({
                  event: 'share_channel',
                  channel_type: 'clipboard',
                  ...getAttributionParams(),
                });
                onShare();
              }}
              className="h-550 w-full rounded-100 border border-border-brand bg-rose-50 font-designer-14m text-text-brand"
            >
              공유하기
            </button>
            {isAuthenticated
              ? ctaLabel && (
                  <button
                    type="button"
                    onClick={onStartCourse}
                    disabled={isEnrolling}
                    className="flex h-550 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse"
                  >
                    {ctaLabel}
                  </button>
                )
              : courseDetail?.canFreeEnroll === true && (
                  <LoginModal
                    openTrigger={
                      <button
                        type="button"
                        onClick={() => {
                          sendGTMEvent({
                            event: 'free_trial_start',
                            ...getAttributionParams(),
                          });
                        }}
                        className="flex h-550 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse"
                      >
                        무료 코스 시작하기
                      </button>
                    }
                  />
                )}
          </div>

          {isAuthenticated && courseDetail?.isPaidEnrolled && (
            <div className="mt-300 rounded-100 border border-border-default p-300">
              <p className="font-designer-14b text-gray-800">
                Claude Pro Gift 이메일
              </p>
              {myGiftEmail?.isRegistered ? (
                <p className="mt-125 break-all font-designer-14r text-gray-600">
                  {myGiftEmail.email}
                </p>
              ) : (
                <div className="mt-150 flex flex-col gap-150">
                  <input
                    type="email"
                    aria-label="Claude Pro Gift 이메일"
                    value={giftEmail}
                    onChange={(e) => onGiftEmailChange(e.target.value)}
                    placeholder="이메일 주소를 입력하세요"
                    className="h-500 w-full rounded-100 border border-border-default px-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
                  />
                  <button
                    type="button"
                    onClick={onRegisterGiftEmail}
                    disabled={isRegisteringGiftEmail || !giftEmail.trim()}
                    className="flex h-500 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse disabled:opacity-50"
                  >
                    {isRegisteringGiftEmail ? '등록 중...' : '등록하기'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
