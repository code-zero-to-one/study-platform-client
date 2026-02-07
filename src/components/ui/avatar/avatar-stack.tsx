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
                className="absolute left-1/2 -translate-x-1/2 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-yellow-400 border-2 border-white z-10 pointer-events-none"
                style={{ top: `-12px` }}
              >
                <Crown className="h-[14px] w-[14px] text-yellow-900" fill="currentColor" />
              </div>
            )}

            {/* 아바타 */}
            <div
              className="relative overflow-hidden rounded-full border-2 border-white hover:border-border-brand bg-background-neutral-subtle cursor-pointer transition-all"
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
              <div className="absolute top-full left-1/2 z-50 mt-100 -translate-x-1/2 whitespace-nowrap rounded-100 bg-white border border-border-default px-200 py-100 text-text-default font-designer-12m shadow-lg pointer-events-none">
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
            className="flex items-center justify-center rounded-full border-2 border-transparent bg-transparent transition-colors font-designer-14m text-text-subtle cursor-pointer whitespace-nowrap px-200"
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
            <div className="absolute top-full left-0 z-50 mt-200 w-[280px] rounded-200 border border-border-subtle p-300 shadow-lg !bg-white">
              <div className="flex flex-col gap-200">
                <div className="flex items-center justify-between mb-100">
                  <p className="font-designer-14b text-text-default">
                    이후 참가한 사람 ({remainingCount}명)
                  </p>
                  <button
                    onClick={() => setShowRemaining(false)}
                    className="flex items-center justify-center w-[24px] h-[24px] rounded-full hover:bg-gray-100 transition-colors"
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
                <div className="max-h-[300px] overflow-y-auto space-y-150">
                  {participants.slice(maxVisible).map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-150 px-100 py-100 rounded-100 hover:border hover:border-border-brand cursor-pointer transition-all"
                      onClick={() => handleProfileClick(participant.id)}
                    >
                      <div
                        className="relative overflow-hidden rounded-full bg-background-neutral-subtle flex-shrink-0"
                        style={{ width: 32, height: 32 }}
                      >
                        <Image
                          src={participant.profileImage || '/images/profile-default.svg'}
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
