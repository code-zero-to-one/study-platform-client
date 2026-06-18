'use client';

import { Crown, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import UserAvatar from '@/components/common/ui/avatar';
import Tooltip from '@/components/common/ui/tooltip';
import { cn } from './(shadcn)/lib/utils';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

export interface AvatarStackMember {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  isLeader: boolean;
}

interface AvatarStackProps {
  members: AvatarStackMember[];
  maxVisible?: number;
  guideText?: string;
}

export default function AvatarStack({
  members,
  maxVisible = 5,
  guideText = '프로필을 클릭하여 스터디원들의 정보를 확인해보세요.',
}: AvatarStackProps) {
  const [showOverflow, setShowOverflow] = useState(false);

  // 리더를 맨 앞으로, 나머지는 가입순(원본 순서) 유지
  const sorted = [...members].sort((a, b) => {
    if (a.isLeader && !b.isLeader) return -1;
    if (!a.isLeader && b.isLeader) return 1;

    return 0;
  });

  const visible = sorted.slice(0, maxVisible);
  const overflow = sorted.slice(maxVisible);
  const hasOverflow = overflow.length > 0;

  return (
    <div className="flex flex-col gap-150">
      <div className="flex items-center gap-200">
        {/* 아바타 겹침 영역 */}
        <div className="flex items-center">
          {visible.map((member, index) => (
            <AvatarItem key={member.memberId} member={member} index={index} />
          ))}
        </div>

        {/* +n명이 열공 중 */}
        {hasOverflow && (
          <div className="relative" onMouseEnter={() => setShowOverflow(true)}>
            <button
              type="button"
              className="font-designer-14m text-text-subtle hover:text-text-default transition-colors"
            >
              +{overflow.length}명이 열공 중!
            </button>

            {showOverflow && (
              <div className="bg-background-default absolute top-full left-0 z-50 mt-100 w-[240px] rounded-100 border border-border-subtle p-200 shadow-2">
                <div className="mb-100 flex items-center justify-between">
                  <span className="font-designer-14b text-text-default">
                    참가자 목록
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOverflow(false)}
                    className="text-text-subtle hover:text-text-default"
                  >
                    <X className="size-4 cursor-pointer" />
                  </button>
                </div>
                <ul className="flex flex-col gap-100">
                  {overflow.map((member) => (
                    <li key={member.memberId}>
                      <UserProfileModal
                        memberId={member.memberId}
                        trigger={
                          <button
                            type="button"
                            className="flex w-full items-center gap-100 rounded-100 px-100 py-75 hover:bg-gray-100"
                          >
                            <UserAvatar
                              size={32}
                              image={member.profileImageUrl}
                            />
                            <span className="font-designer-14m text-text-default">
                              {member.nickname || '익명'}
                            </span>
                          </button>
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <p className="font-designer-13r text-text-subtlest">
        {members.length ? guideText : '아직 스터디원이 없습니다.'}
      </p>
    </div>
  );
}

function AvatarItem({
  member,
  index,
}: {
  member: AvatarStackMember;
  index: number;
}) {
  return (
    <UserProfileModal
      memberId={member.memberId}
      trigger={
        <div
          className="relative cursor-pointer"
          style={{ marginLeft: index === 0 ? 0 : -12, zIndex: 10 - index }}
        >
          {/* 왕관 아이콘 (리더) */}
          {member.isLeader && (
            <span className="absolute -top-[14px] left-1/2 z-20 -translate-x-1/2">
              <Crown
                className="h-4 w-4 cursor-pointer text-pink-400"
                fill="currentColor"
              />
            </span>
          )}

          <Tooltip
            trigger={
              <div
                className={cn(
                  'flex h-600 w-600 items-center rounded-full border-2 transition-colors',
                  member.isLeader
                    ? 'border-pink-400'
                    : 'border-white hover:border-pink-300',
                )}
              >
                <UserAvatar size={48} image={member.profileImageUrl} />
              </div>
            }
            value={member.nickname || '익명'}
            side="bottom"
            delayDuration={200}
            avoidCollisions={false}
          />
        </div>
      }
    />
  );
}
