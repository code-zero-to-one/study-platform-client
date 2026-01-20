import React from 'react';
import Link from 'next/link';
import { Voting } from '@/types/voting';
import { MessageCircle, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import VoteTimer from '../voting/vote-timer';

interface VotingCardProps {
  voting: Voting;
}

export default function VotingCard({ voting }: VotingCardProps) {
  const topOption = voting.options.reduce((prev, current) =>
    prev.percentage > current.percentage ? prev : current,
  );

  const hasVoted = voting.myVote !== undefined;

  return (
    <Link
      href={`/insights/weekly/${voting.id}`}
      className={cn(
        'group block cursor-pointer rounded-200 border-2 bg-background-default p-500 transition-all duration-200',
        hasVoted ? 'border-border-brand shadow-2' : 'border-border-subtle hover:border-border-brand hover:shadow-2',
      )}
    >
      {/* 헤더: 라운드 번호 & 상태 */}
      <div className="mb-300 flex items-center justify-between">
        <div className="flex items-center gap-200">
          <div className="flex items-center gap-100 rounded-100 bg-fill-brand-default-default px-250 py-100">
            <TrendingUp className="h-4 w-4 text-text-inverse" />
            <span className="font-designer-13b text-text-inverse">{voting.round} 라운드</span>
          </div>

          {hasVoted && (
            <div className="flex items-center gap-50 rounded-100 bg-green-50 px-200 py-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="font-designer-12b text-green-600">투표 완료</span>
            </div>
          )}
        </div>

        {/* 투표 안 한 항목에만 타이머 표시 */}
        {!hasVoted && <VoteTimer endsAt={voting.endsAt} isActive={voting.isActive} />}
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
    </Link>
  );
}
