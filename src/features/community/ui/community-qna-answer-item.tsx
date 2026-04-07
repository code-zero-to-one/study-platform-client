'use client';

import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import type { CommunityQnaAnswerItem as CommunityQnaAnswerItemType } from '@/types/community/qna-domain';
import CommunityMarkdownContent from './community-markdown-content';
import CommunityQnaAuthorSummary from './community-qna-author-summary';

interface CommunityQnaAnswerItemProps {
  answer: CommunityQnaAnswerItemType;
  actionSlot?: ReactNode;
  reactionSlot?: ReactNode;
  isMine?: boolean;
  commentSection?: ReactNode;
}

export default function CommunityQnaAnswerItem({
  answer,
  actionSlot,
  reactionSlot,
  isMine = false,
  commentSection,
}: CommunityQnaAnswerItemProps) {
  return (
    <article className="rounded-200 border border-border-default bg-background-default p-250">
      <div className="flex flex-col gap-200">
        <div className="flex flex-wrap items-start justify-between gap-100">
          <div className="flex flex-wrap items-center gap-100">
            {isMine ? (
              <Badge color="gray" shape="round">
                <span className="font-designer-12b">내 답변</span>
              </Badge>
            ) : null}
            {answer.isAccepted ? (
              <Badge
                color="green"
                shape="round"
                leftIcon={<CheckCircle2 className="h-150 w-150" />}
              >
                <span className="font-designer-12b">채택된 답변</span>
              </Badge>
            ) : null}
            <span className="font-designer-13r text-text-subtlest">
              {answer.createdAt}
            </span>
          </div>
          {actionSlot}
        </div>

        <CommunityQnaAuthorSummary
          author={answer.author}
          nameClassName="font-designer-18b text-text-strong"
        />

        <CommunityMarkdownContent content={answer.contentHtml} />

        {reactionSlot}

        {commentSection}
      </div>
    </article>
  );
}
