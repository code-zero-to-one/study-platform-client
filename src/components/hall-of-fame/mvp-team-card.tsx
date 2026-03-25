'use client';

import { Trophy, Flame } from 'lucide-react';
import React from 'react';
import UserProfileModal from '@/components/common/modals/user-profile-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import Tooltip from '@/components/common/ui/tooltip';
import type { MVPTeam } from '@/types/one-to-one-study/hall-of-fame';
import { formatExternalLink } from '@/utils/format';

interface MVPTeamCardProps {
  team: MVPTeam;
  className?: string;
}

export default function MVPTeamCard({ team, className }: MVPTeamCardProps) {
  const weekLabel = team.weekDate?.trim();

  return (
    <div
      className={cn(
        'rounded-200 shadow-2 relative overflow-hidden border border-yellow-200 bg-gradient-to-br from-yellow-50 to-gray-0 p-500',
        className,
      )}
    >
      <div className="absolute top-0 left-0 p-300 opacity-10">
        <Trophy className="text-text-warning h-1500 w-1500" />
      </div>
      <div className="absolute top-400 right-400 z-20">
        <Tooltip
          value="명예의 전당 MVP 팀에 선정되면 소정의 카카오 선물 쿠폰을 받으실 수 있습니다."
          side="top"
          align="center"
          sideOffset={10}
          delayDuration={0}
          contentClassName="rounded-150 font-designer-14r"
          trigger={
            <button
              type="button"
              aria-label={
                weekLabel ? `${weekLabel} MVP 팀 안내` : '최근 MVP 팀 안내'
              }
              className="border-border-subtle text-text-strong bg-background-default shadow-1 font-designer-24b flex h-600 w-600 items-center justify-center rounded-full border leading-none"
            >
              ?
            </button>
          }
        />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-400 text-center">
        <div className="flex flex-col items-center gap-100">
          <span className="bg-fill-warning-subtle-default text-text-warning font-designer-12b border-border-warning-subtle rounded-[9999px] border px-150 py-50">
            {weekLabel || '최근 MVP 팀'}
          </span>
          <h3 className="font-display-headings5 text-text-strong break-keep">
            최고의 스터디 메이트
          </h3>
        </div>

        <div className="flex items-center justify-center gap-300">
          {team.members.map((member, index) => (
            <React.Fragment key={member.userId}>
              <div className="group flex flex-col items-center gap-100">
                <UserProfileModal
                  memberId={member.userId}
                  trigger={
                    <div className="relative cursor-pointer transition-transform hover:-translate-y-50">
                      <UserAvatar
                        image={
                          member.profileImage?.resizedImages?.[0]
                            ?.resizedImageUrl ?? undefined
                        }
                        alt={member.nickname}
                        size={80}
                        className="shadow-2 border-4 border-white"
                      />
                      <div className="border-border-subtle shadow-1 absolute -bottom-100 left-1/2 z-10 -translate-x-1/2 rounded-[9999px] border bg-white px-100 py-25 whitespace-nowrap">
                        <span className="font-designer-12b text-text-strong">
                          {member.nickname}
                        </span>
                      </div>
                    </div>
                  }
                />
              </div>
              {index === 0 && (
                <div className="text-text-warning font-display-headings4 opacity-50">
                  &
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-100 border-border-warning-subtle/30 mt-auto w-full border bg-white/60 p-300">
          <div className="mb-200 flex items-center gap-100">
            <Flame className="text-text-brand h-4 w-4" />
            <span className="font-designer-16b text-text-strong">
              이번 주 공유한 자료
            </span>
          </div>
          <div className="flex flex-col gap-100 text-left">
            {team.sharedLinks.map((link, i) => (
              <a
                key={link.id}
                href={formatExternalLink(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-designer-13r text-text-subtle hover:text-text-information flex items-center gap-100 truncate transition-all hover:underline"
              >
                <span className="bg-fill-neutral-subtle-default text-text-subtle font-designer-10r flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                  {i + 1}
                </span>
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
