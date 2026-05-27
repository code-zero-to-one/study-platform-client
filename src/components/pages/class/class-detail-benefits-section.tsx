'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { BenefitScrollCharacter } from './benefit-scroll-character';

const CARDS_COUNT = 4;
const SCROLL_THROTTLE = 700;

export function ClassDetailBenefitsSection() {
  const [activeCard, setActiveCard] = useState(0);
  const activeCardRef = useRef(0);
  const isHovering = useRef(false);
  const lastScrollTime = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    const now = Date.now();
    const cur = activeCardRef.current;

    if (e.deltaY > 0) {
      if (cur < CARDS_COUNT - 1) {
        e.preventDefault();
        if (now - lastScrollTime.current >= SCROLL_THROTTLE) {
          lastScrollTime.current = now;
          activeCardRef.current = cur + 1;
          setActiveCard(cur + 1);
        }
      }
    } else if (e.deltaY < 0) {
      if (cur > 0) {
        e.preventDefault();
        if (now - lastScrollTime.current >= SCROLL_THROTTLE) {
          lastScrollTime.current = now;
          activeCardRef.current = cur - 1;
          setActiveCard(cur - 1);
        }
      }
    }
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onEnter = () => {
      isHovering.current = true;
    };
    const onLeave = () => {
      isHovering.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (isHovering.current) handleWheel(e);
    };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('wheel', onWheel);
    };
  }, [handleWheel]);

  return (
    <section id="benefits" ref={sectionRef}>
      <h2 className="font-designer-24b text-gray-800">
        ZERO-ONE에서 드리는 입문자 코스 혜택!
      </h2>
      <div className="relative mt-400 flex flex-col gap-250">
        <div className="relative overflow-hidden rounded-200 bg-rose-100 p-350">
          <p className="font-designer-20b text-gray-800">
            Claude Code Pro 1개월 구독권을 드려요
          </p>
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
        </div>

        <div className="overflow-hidden rounded-200 bg-purple-150 p-350">
          <p className="font-designer-20b text-gray-800">
            디스코드에서 함께 공부해요
          </p>
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
        </div>

        <div className="relative overflow-hidden rounded-200 bg-yellow-100 p-350">
          <p className="font-designer-20b text-gray-800">
            막히면 바로 질문하세요
          </p>
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
              <span className="absolute text-58 font-designer-36b leading-none text-grape-600">
                Q
              </span>
            </div>
            <div
              className="absolute left-750 top-500 flex size-1112 items-center justify-center"
              style={{ transform: 'rotate(27.01deg)' }}
            >
              <div className="size-825 rounded-100 border border-yellow-500 bg-yellow-200/20" />
              <span className="absolute text-58 font-designer-36b leading-none text-yellow-300">
                A
              </span>
            </div>
          </div>
        </div>

        <div className="relative min-h-3888 overflow-hidden rounded-200 bg-rose-150 p-350">
          <p className="font-designer-20b text-gray-800">
            수료 빌더들과 네트워킹하는 커뮤니티
          </p>
          <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
            {
              '완주 후 ZERO-ONE 오픈톡방에 초대됩니다.\n의지만땅 빌더분들과 소통하실 수 있어요.\n함께 협업하거나, 고민을 주고받고 같은 목표를 향해 달려나가보세요.'
            }
          </p>
          <div className="absolute left-375 top-2225">
            <svg
              width="108.575"
              height="64.48"
              viewBox="0 0 108.575 64.4803"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 14.7481C0 6.60297 6.60296 0 14.7481 0H93.827C101.972 0 108.575 6.60296 108.575 14.7481V33.7525C108.575 41.8976 101.972 48.5006 93.827 48.5006H14.7481C6.60296 48.5006 0 41.8976 0 33.7525V14.7481Z"
                fill="#FF698C"
              />
              <path
                d="M15.432 55.6655V41.8869H46.8472L22.5968 61.7281C15.9831 68.7827 15.0646 60.6258 15.432 55.6655Z"
                fill="#FF698C"
              />
            </svg>
            <div className="absolute top-175 left-150 flex flex-col gap-62">
              <div className="h-30 w-800 rounded-full bg-gray-0" />
              <div className="h-30 w-525 rounded-full bg-gray-0" />
              <div className="h-30 w-525 rounded-full bg-gray-0" />
            </div>
          </div>
          <div className="absolute top-2900 left-800">
            <svg
              width="86.948"
              height="54.02"
              viewBox="0 0 86.9482 54.0207"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'scaleX(-1)' }}
            >
              <path
                d="M0 12.3625C0 5.53967 5.53098 0.0086764 12.3538 0.0086764L74.5944 0C81.4172 0 86.9482 5.53098 86.9482 12.3538V28.2728C86.9482 35.0956 81.4172 40.6266 74.5944 40.6266L12.3538 40.6353C5.53098 40.6353 0 35.1043 0 28.2815V12.3625Z"
                fill="#FFB5C6"
              />
              <path
                d="M12.9267 46.637V35.0953H39.2416L18.9283 51.7153C13.3883 57.6246 12.6189 50.792 12.9267 46.637Z"
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

        <BenefitScrollCharacter activeIndex={activeCard} />
      </div>
    </section>
  );
}
