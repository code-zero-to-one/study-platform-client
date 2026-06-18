import Image from 'next/image';
import type { ReactNode } from 'react';

export interface BenefitCardData {
  bg: string;
  title: string;
  body: ReactNode;
}

export const BENEFIT_CARDS: BenefitCardData[] = [
  {
    bg: 'bg-rose-100',
    title: 'Claude Code Pro 1개월 구독권을 드려요',
    body: (
      <>
        <p className="mt-200 font-designer-18r text-gray-800">
          바이브 코딩의 핵심 도구, 별도 절차 없이 바로 쓰실 수 있게 해드려요.
          <br />
          고민 없이 바로 시작하실 수 있도록 Claude 1개월 구독권을 드립니다.
        </p>
        <p className="mt-150 font-designer-16r text-gray-800">
          ※ 이미 구독 중인 경우 별도 플랜 결제 가능
        </p>
        <div className="mt-300">
          <Image
            src="/class/detail/claude-pro-gift.png"
            alt="Claude Code Pro 1개월 구독권"
            width={96}
            height={96}
            className="rounded-150"
          />
        </div>
      </>
    ),
  },
  {
    bg: 'bg-purple-150',
    title: '디스코드에서 함께 공부해요',
    body: (
      <>
        <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
          {
            '라이브 학습 채널에서 화면 공유하고 함께 레슨 들어요.\n혼자가 아닌 함께 완주할 수 있어요.\n운영진 24시간 상주, 막힌 곳 질문답변 가능.'
          }
        </p>
        <div className="mt-300">
          <Image
            src="/class/detail/benefit-3.png"
            alt="디스코드"
            width={96}
            height={96}
            className="rounded-150"
          />
        </div>
      </>
    ),
  },
  {
    bg: 'bg-yellow-100',
    title: '막히면 바로 질문하세요',
    body: (
      <>
        <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
          {
            '레슨마다 질문답변을 남길 수 있어요.\n운영진이 직접 답변해드립니다.\n다른 빌더들은 어떤 곳에서 막혔는지, 어떻게 해결했는지도 참고해보세요.'
          }
        </p>
        <div className="relative mt-300 h-1875">
          <div
            className="absolute left-0 top-100 flex size-1062 items-center justify-center"
            style={{ transform: 'rotate(-20.32deg)' }}
          >
            <div className="size-825 rounded-100 border border-purple-600 bg-purple-200/20" />
            <span className="absolute text-58px font-designer-36b leading-none text-grape-600">
              Q
            </span>
          </div>
          <div
            className="absolute left-750 top-500 flex size-1112 items-center justify-center"
            style={{ transform: 'rotate(27.01deg)' }}
          >
            <div className="size-825 rounded-100 border border-yellow-500 bg-yellow-200/20" />
            <span className="absolute text-58px font-designer-36b leading-none text-yellow-300">
              A
            </span>
          </div>
        </div>
      </>
    ),
  },
  {
    bg: 'bg-rose-150',
    title: '수료 빌더들과 네트워킹하는 커뮤니티',
    body: (
      <>
        <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
          {
            '완주 후 ZERO-ONE 오픈톡방에 초대됩니다.\n의지만땅 빌더분들과 소통하실 수 있어요.\n함께 협업하거나, 고민을 주고받고 같은 목표를 향해 달려나가보세요.'
          }
        </p>
        <div className="relative mt-300 h-3500">
          <div className="absolute left-375 top-0">
            <svg
              width="108.575"
              height="64.48"
              viewBox="0 0 108.575 64.4803"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 14.75C0 6.6 6.6 0 14.75 0H93.83C102 0 108.58 6.6 108.58 14.75V33.75C108.58 41.9 102 48.5 93.83 48.5H14.75C6.6 48.5 0 41.9 0 33.75V14.75Z"
                fill="#FF698C"
              />
              <path
                d="M15.43 55.67V41.89H46.85L22.6 61.73C15.98 68.78 15.06 60.63 15.43 55.67Z"
                fill="#FF698C"
              />
            </svg>
            <div className="absolute top-175 left-150 flex flex-col gap-62">
              <div className="h-30 w-800 rounded-full bg-gray-0" />
              <div className="h-30 w-525 rounded-full bg-gray-0" />
              <div className="h-30 w-525 rounded-full bg-gray-0" />
            </div>
          </div>
          <div className="absolute top-675 left-800">
            <svg
              width="86.948"
              height="54.02"
              viewBox="0 0 86.9482 54.0207"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'scaleX(-1)' }}
            >
              <path
                d="M0 12.36C0 5.54 5.53 0.01 12.35 0.01L74.59 0C81.42 0 86.95 5.53 86.95 12.35V28.27C86.95 35.1 81.42 40.63 74.59 40.63L12.35 40.64C5.53 40.64 0 35.1 0 28.28V12.36Z"
                fill="#FFB5C6"
              />
              <path
                d="M12.93 46.64V35.1H39.24L18.93 51.72C13.39 57.62 12.62 50.79 12.93 46.64Z"
                fill="#FFB5C6"
              />
            </svg>
            <div className="absolute top-125 left-150 flex w-800 flex-col items-end gap-62">
              <div className="h-30 w-full rounded-full bg-gray-0" />
              <div className="h-30 w-525 rounded-full bg-gray-0" />
              <div className="h-30 w-525 rounded-full bg-gray-0" />
            </div>
          </div>
        </div>
      </>
    ),
  },
];
