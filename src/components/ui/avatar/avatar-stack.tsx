'use client';

import { Crown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Participant {
  id: number;
  name: string;
  profileImage?: string;
  isLeader?: boolean;
}

interface AvatarStackProps {
  participants: Participant[];
  maxVisible?: number;
  size?: number;
  className?: string;
  onProfileClick?: (participantId: number) => void;
  /** 멘티 목록 등 리더 구분이 없을 때 false (왕관 미표시) */
  showLeaderCrown?: boolean;
}

/**
 * 아바타 스택 컴포넌트
 * - 최대 표시 인원 설정
 * - 나머지는 +n으로 표시
 * - 호버 시 이름 및 나머지 리스트 표시
 * - 리더는 왕관 아이콘 표시
 * - 프로필 클릭 시 모달 열기
 */
export default function AvatarStack({
  participants,
  maxVisible = 5,
  size = 48,
  className = '',
  onProfileClick,
  showLeaderCrown = true,
}: AvatarStackProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showRemaining, setShowRemaining] = useState(false);

  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = Math.max(0, participants.length - maxVisible);

  const handleProfileClick = (participantId: number) => {
    if (onProfileClick) {
      onProfileClick(participantId);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* 보이는 아바타들 */}
      <div className="flex items-center">
        {visibleParticipants.map((participant, index) => (
          <div
            key={participant.id}
            className="relative"
            style={{
              marginLeft: index > 0 ? `-${size * 0.3}px` : 0,
              zIndex: hoveredId === participant.id ? 50 : maxVisible - index,
            }}
            onMouseEnter={() => setHoveredId(participant.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* 리더 왕관 아이콘 (아바타 바로 위, showLeaderCrown일 때만) */}
            {showLeaderCrown && participant.isLeader && (
              <div
                className="pointer-events-none absolute left-1/2 z-10 flex h-[24px] w-[24px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-yellow-400"
                style={{ top: `-12px` }}
              >
                <Crown
                  className="h-[14px] w-[14px] text-yellow-900"
                  fill="currentColor"
                />
              </div>
            )}

            {/* 아바타 */}
            <div
              className="hover:border-border-brand bg-background-neutral-subtle relative cursor-pointer overflow-hidden rounded-full border-2 border-white transition-all"
              style={{ width: size, height: size }}
              onClick={() => handleProfileClick(participant.id)}
            >
              <Image
                src={participant.profileImage || '/images/profile-default.svg'}
                alt={participant.name}
                fill
                className="object-cover"
              />
            </div>

            {/* 호버 툴팁 */}
            {hoveredId === participant.id && (
              <div className="rounded-100 border-border-default text-text-default font-designer-12m pointer-events-none absolute top-full left-1/2 z-50 mt-100 -translate-x-1/2 border bg-white px-200 py-100 whitespace-nowrap shadow-lg">
                {participant.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* +n 영역 (이후 참가한 사람) */}
      {remainingCount > 0 && (
        <div className="relative ml-50">
          <button
            className="font-designer-14m text-text-subtle flex cursor-pointer items-center justify-center rounded-full border-2 border-transparent bg-transparent px-200 whitespace-nowrap transition-colors"
            style={{
              height: size,
              zIndex: 0,
            }}
            onMouseEnter={() => setShowRemaining(true)}
            onClick={() => setShowRemaining(true)}
          >
            +{remainingCount}명이 열공 중!
          </button>

          {/* 이후 참가한 사람 팝오버 */}
          {showRemaining && (
            <div className="rounded-200 border-border-subtle absolute bottom-full left-0 z-50 mb-200 w-[280px] border !bg-white p-300 shadow-lg">
              <div className="flex flex-col gap-200">
                <div className="mb-100 flex items-center justify-between">
                  <p className="font-designer-14b text-text-default">
                    이후 참가한 사람 ({remainingCount}명)
                  </p>
                  <button
                    onClick={() => setShowRemaining(false)}
                    className="flex h-[24px] w-[24px] items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[300px] space-y-150 overflow-y-auto">
                  {participants.slice(maxVisible).map((participant) => (
                    <div
                      key={participant.id}
                      className="rounded-100 hover:border-border-brand flex cursor-pointer items-center gap-150 px-100 py-100 transition-all hover:border"
                      onClick={() => handleProfileClick(participant.id)}
                    >
                      <div
                        className="bg-background-neutral-subtle relative flex-shrink-0 overflow-hidden rounded-full"
                        style={{ width: 32, height: 32 }}
                      >
                        <Image
                          src={
                            participant.profileImage ||
                            '/images/profile-default.svg'
                          }
                          alt={participant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-designer-13m text-text-default truncate">
                        {participant.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
