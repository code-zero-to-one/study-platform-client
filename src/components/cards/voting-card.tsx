import React from 'react';
import Link from 'next/link';
import { Voting } from '@/types/voting';
import { MessageCircle, Users } from 'lucide-react';
import UserAvatar from '@/components/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import VoteTimer from '../voting/vote-timer';

interface VotingCardProps {
  voting: Voting;
  onClick?: () => void;
}

export default function VotingCard({ voting, onClick }: VotingCardProps) {
  const topOption = voting.options.reduce((prev, current) =>
    prev.percentage > current.percentage ? prev : current,
  );

  const hasVoted = voting.myVote !== undefined;

  const cardContent = (
    <div
      className={cn(
        'group block cursor-pointer rounded-200 bg-background-default p-500 transition-shadow duration-200 ring-2 ring-inset',
        hasVoted ? 'ring-border-brand shadow-2' : 'ring-border-subtle hover:ring-border-brand hover:shadow-2',
      )}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
    >
      {/* 헤더: 작성자 & 상태 */}
      <div className="mb-300 flex items-center justify-between">
        {/* 작성자 정보 */}
        <div onClick={(e) => e.stopPropagation()}>
          <UserProfileModal
            memberId={voting.author.id}
            trigger={
              <div className="flex items-center gap-200 cursor-pointer rounded-full px-200 py-100 transition-shadow duration-100 ring-1 ring-inset ring-transparent hover:ring-fill-brand-default-default">
                <div>
                  <UserAvatar 
                    size={32} 
                    image={voting.author.avatar}
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
        <VoteTimer endsAt={voting.endsAt} isActive={voting.isActive} />
      </div>

      {/* 제목 */}
      <h3 className="mb-200 line-clamp-2 font-bold-h5 text-text-strong transition-colors group-hover:text-text-brand">
        {voting.title}
      </h3>

      {/* 설명 (있으면) */}
      {voting.description && (
        <p className="mb-300 line-clamp-2 font-designer-14r text-text-subtle">
          {voting.description}
        </p>
      )}

      {/* 간단한 투표 결과 미리보기 (투표했을 때만) */}
      {hasVoted && (
        <div className="mb-300 rounded-100 border border-border-subtle bg-background-alternative p-300">
          <div className="mb-100 font-designer-12b text-text-subtle">현재 1위</div>
          <div className="flex items-center justify-between">
            <span className="font-designer-15b text-text-strong">{topOption.label}</span>
            <span className="font-designer-18b text-text-brand">{topOption.percentage.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* 태그 */}
      {voting.tags.length > 0 && (
        <div className="mb-300 flex flex-wrap gap-100">
          {voting.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-100 bg-fill-neutral-subtle-default px-150 py-50 font-designer-12r text-text-subtle"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 하단 메타 정보 */}
      <div className="flex items-center justify-between border-t border-border-subtlest pt-300">
        <div className="flex items-center gap-300">
          {/* 총 투표 수 */}
          <div className="flex items-center gap-50 font-designer-13m text-text-brand">
            <Users className="h-4 w-4" />
            <span>{voting.totalVotes.toLocaleString()}</span>
          </div>

          {/* 댓글 수 */}
          <div className="flex items-center gap-50 font-designer-13m text-text-subtle">
            <MessageCircle className="h-4 w-4" />
            <span>{voting.commentCount}</span>
          </div>
        </div>

        {/* CTA */}
        {!hasVoted && voting.isActive && (
          <button className="rounded-100 bg-fill-brand-default-default px-300 py-150 font-designer-13b text-text-inverse transition-colors hover:bg-fill-brand-default-hover">
            투표하기
          </button>
        )}
      </div>
    </div>
  );

  // onClick이 있으면 Link 없이 렌더링, 없으면 Link로 감싸기
  if (onClick) {
    return cardContent;
  }

  return (
    <Link href={`/insights/weekly/${voting.id}`}>
      {cardContent}
    </Link>
  );
}
