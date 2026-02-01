import { MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { BalanceGame } from '@/types/balance-game';
import VoteTimer from '../voting/vote-timer';

interface VotingCardProps {
  voting: BalanceGame;
  onClick?: () => void;
}

export default function VotingCard({ voting, onClick }: VotingCardProps) {
  const topOption = voting.options.reduce((prev, current) =>
    prev.percentage > current.percentage ? prev : current,
  );

  // myVote can be null or number (optionId)
  const hasVoted = voting.myVote !== undefined && voting.myVote !== null;

  const cardContent = (
    <div
      className={cn(
        'group rounded-200 bg-background-default block cursor-pointer p-500 ring-2 transition-shadow duration-200 ring-inset',
        hasVoted
          ? 'ring-border-brand shadow-2'
          : 'ring-border-subtle hover:ring-border-brand hover:shadow-2',
      )}
      onClick={
        onClick
          ? (e) => {
              e.preventDefault();
              onClick();
            }
          : undefined
      }
    >
      {/* 헤더: 작성자 & 상태 */}
      <div className="mb-300 flex items-center justify-between">
        {/* 작성자 정보 */}
        <div onClick={(e) => e.stopPropagation()}>
          <UserProfileModal
            memberId={voting.author.id}
            trigger={
              <div className="hover:ring-fill-brand-default-default flex cursor-pointer items-center gap-200 rounded-full px-200 py-100 ring-1 ring-transparent transition-shadow duration-100 ring-inset">
                <div>
                  <UserAvatar
                    size={32}
                    image={voting.author.profileImage || undefined}
                    className="relative z-10"
                  />
                </div>
                <span className="font-designer-13b text-text-default">
                  {voting.author.nickname}
                </span>
              </div>
            }
          />
        </div>

        {/* 타이머 표시 */}
        <VoteTimer endsAt={voting.endsAt} isActive={voting.isActive ?? true} />
      </div>

      {/* 제목 */}
      <h3 className="font-bold-h5 text-text-strong group-hover:text-text-brand mb-200 line-clamp-2 transition-colors">
        {voting.title}
      </h3>

      {/* 태그 - 제목 바로 아래에 표시 */}
      {voting.tags && Array.isArray(voting.tags) && voting.tags.length > 0 && (
        <div className="mb-200 flex flex-wrap gap-100">
          {voting.tags.map((tag, index) => (
            <span
              key={tag || index}
              className="rounded-100 bg-fill-neutral-subtle-default font-designer-12r text-text-subtle px-150 py-50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 설명 (있으면) */}
      {voting.description && (
        <p className="font-designer-14r text-text-subtle mb-300 line-clamp-2">
          {voting.description}
        </p>
      )}

      {/* 간단한 투표 결과 미리보기 */}
      {hasVoted && (
        <div className="rounded-100 border-border-subtle bg-background-alternative mb-300 border p-300">
          <div className="font-designer-12b text-text-subtle mb-100">
            현재 1위
          </div>
          <div className="flex items-center justify-between">
            <span className="font-designer-15b text-text-strong">
              {topOption.label}
            </span>
            <span className="font-designer-18b text-text-brand">
              {topOption.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* 하단 메타 정보 */}
      <div className="border-border-subtlest flex items-center gap-300 border-t pt-300">
        {/* 총 투표 수 */}
        <div className="font-designer-13m text-text-brand flex items-center gap-50">
          <Users className="h-4 w-4" />
          <span>{voting.totalVotes.toLocaleString()}</span>
        </div>

        {/* 댓글 수 */}
        <div className="font-designer-13m text-text-subtle flex items-center gap-50">
          <MessageCircle className="h-4 w-4" />
          <span>{voting.commentCount || 0}</span>
        </div>
      </div>
    </div>
  );

  // onClick이 있으면 Link 없이 렌더링, 없으면 Link로 감싸기
  if (onClick) {
    return cardContent;
  }

  return <Link href={`/insights/weekly/${voting.id}`}>{cardContent}</Link>;
}
