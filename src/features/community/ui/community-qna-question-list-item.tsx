'use client';

import { CheckCircle2, MessageSquare, MessagesSquare } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/common/ui/avatar';
import { buildCommunityQuestionHref } from '@/features/community/model/community-route';
import type { CommunityQnaQuestionSummary } from '@/types/community/qna-domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import { CommunityMemberRoleBadge } from './community-meta-badge';

interface CommunityQnaQuestionListItemProps {
  currentPage?: number;
  question: CommunityQnaQuestionSummary;
}

const COMMUNITY_QNA_ACCEPTED_LABEL = '채택 완료';
const COMMUNITY_QNA_MY_ANSWER_LABEL = '내 답변 있음';

export default function CommunityQnaQuestionListItem({
  currentPage,
  question,
}: CommunityQnaQuestionListItemProps) {
  const detailHref = buildCommunityQuestionHref(question.id, currentPage);

  return (
    <article className="border-b border-border-subtle py-250 transition-colors last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex flex-col gap-150">
        <div className="flex flex-wrap items-center gap-100">
          {question.accepted ? (
            <span className="inline-flex items-center gap-50 rounded-full bg-fill-brand-subtle-default px-100 py-50 font-designer-12b text-text-brand">
              <CheckCircle2 className="h-14 w-14" />
              {COMMUNITY_QNA_ACCEPTED_LABEL}
            </span>
          ) : null}
          {question.myAnswerExists ? (
            <span className="inline-flex rounded-full border border-border-brand px-100 py-50 font-designer-12b text-text-brand">
              {COMMUNITY_QNA_MY_ANSWER_LABEL}
            </span>
          ) : null}
          <span className="rounded-full bg-fill-static-default px-100 py-50 font-designer-12b text-text-subtle">
            질문
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-100">
          <span className="flex items-center gap-75">
            <Avatar
              image={question.author.profileImageUrl}
              alt={question.author.name}
              size={20}
            />
            <CommunityAuthorNameTrigger
              memberId={question.author.memberId}
              name={question.author.name}
              className="font-designer-13r text-text-default"
            />
          </span>
          <CommunityMemberRoleBadge role={question.author.role} />
          <span className="font-designer-13r text-text-subtlest">
            {question.createdAt}
          </span>
        </div>

        <Link
          href={detailHref}
          aria-label={`${question.title} 상세 보기`}
          className="block rounded-150 transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          <p className="truncate font-designer-18b text-text-strong">
            {question.title}
          </p>
          {question.excerpt ? (
            <p className="mt-75 line-clamp-2 font-designer-14r leading-250 text-text-subtle">
              {question.excerpt}
            </p>
          ) : null}
        </Link>

        <div className="flex flex-wrap items-center gap-150">
          <span className="inline-flex items-center gap-50 font-designer-13r text-text-subtle">
            <MessagesSquare className="h-14 w-14" />
            답변 {question.stats.answerCount}
          </span>
          <span className="inline-flex items-center gap-50 font-designer-13r text-text-subtle">
            <MessageSquare className="h-14 w-14" />
            댓글 {question.stats.questionCommentCount}
          </span>
          <span className="font-designer-13r text-text-subtle">
            조회 {question.stats.viewCount}
          </span>
        </div>
      </div>
    </article>
  );
}
