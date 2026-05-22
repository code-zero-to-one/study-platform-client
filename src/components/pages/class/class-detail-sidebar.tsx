import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Fragment } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type {
  CourseDetailResponse,
  GiftEmailResponse,
} from '@/types/api/course.types';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

interface ClassDetailSidebarProps {
  courseDetail: CourseDetailResponse | undefined;
  isAuthenticated: boolean;
  ctaLabel: string;
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
              '바이브 코딩 막막함 이젠 여기서 끝내세요!\nZERO-ONE의 빌더들과 함께 뿌셔보세요!'}
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
            Claude Pro 1개월 Gift 증정 + 커뮤니티 +
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
              <path d="M20.01 2.3525L18.6 1.7025L17.95 0.2925C17.77 -0.0975 17.22 -0.0975 17.04 0.2925L16.4 1.7025L14.99 2.3525C14.6 2.5325 14.6 3.0825 14.99 3.2625L16.4 3.9025L17.05 5.3125C17.23 5.7025 17.78 5.7025 17.96 5.3125L18.6 3.9025L20.01 3.2525C20.4 3.0825 20.4 2.5225 20.01 2.3525Z" />
              <path d="M7 12.5525C7.69036 12.5525 8.25 11.9929 8.25 11.3025C8.25 10.6121 7.69036 10.0525 7 10.0525C6.30964 10.0525 5.75 10.6121 5.75 11.3025C5.75 11.9929 6.30964 12.5525 7 12.5525Z" />
              <path d="M13 12.5525C13.6904 12.5525 14.25 11.9929 14.25 11.3025C14.25 10.6121 13.6904 10.0525 13 10.0525C12.3096 10.0525 11.75 10.6121 11.75 11.3025C11.75 11.9929 13.6904 12.5525 13 12.5525Z" />
              <path d="M17.5 7.1025C16.72 7.1025 16.01 6.6425 15.68 5.9325L15.27 5.0325L14.37 4.6225C13.66 4.2925 13.2 3.5825 13.2 2.8025C13.2 2.1425 13.54 1.5425 14.07 1.1725C12.83 0.6225 11.45 0.3025 10 0.3025C4.48 0.3025 0 4.7825 0 10.3025C0 15.8225 4.48 20.3025 10 20.3025C15.52 20.3025 20 15.8225 20 10.3025C20 8.8525 19.68 7.4725 19.13 6.2325C18.76 6.7625 18.16 7.1025 17.5 7.1025ZM10 18.3025C5.59 18.3025 2 14.7125 2 10.3025C2 10.2525 2.01 10.2025 2 10.1625C4.6 9.1825 6.69 7.1725 7.74 4.6125C9.58 6.8625 12.37 8.3025 15.5 8.3025C16.25 8.3025 16.97 8.2125 17.67 8.0625C17.88 8.7725 18 9.5225 18 10.3025C18 14.7125 14.41 18.3025 10 18.3025Z" />
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
              onClick={onShare}
              className="h-550 w-full rounded-100 border border-border-brand bg-rose-50 font-designer-14m text-text-brand"
            >
              공유하기
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onStartCourse}
                disabled={isEnrolling}
                className="flex h-550 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse"
              >
                {ctaLabel}
              </button>
            ) : (
              <LoginModal
                openTrigger={
                  <button
                    type="button"
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

          <div className="mt-300 rounded-100 bg-gray-800 p-300">
            <p className="font-designer-14m text-gray-0">
              매주 월·화·수 오전 6시
            </p>
            <p className="mt-75 font-designer-18b text-gray-0">
              Study with Me 진행!
            </p>
            <p className="mt-150 whitespace-pre-line font-designer-14r text-gray-400">
              {
                '함께 모여 공부하는 시간이에요.\n디스코드 라이브 채널에서 만나요.'
              }
            </p>
            <p className="mt-200 font-designer-12r text-gray-400">
              ※ 디스코드 방은 알림톡으로 안내드립니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
