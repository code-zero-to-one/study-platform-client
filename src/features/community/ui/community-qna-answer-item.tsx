'use client';

import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CommunityQnaAnswerItem as CommunityQnaAnswerItemType } from '@/types/community/qna-domain';
import CommunityMarkdownContent from './community-markdown-content';
import CommunityQnaAuthorSummary from './community-qna-author-summary';

interface CommunityQnaAnswerItemProps {
  answer: CommunityQnaAnswerItemType;
  actionSlot?: ReactNode;
  isMine?: boolean;
  commentSection?: ReactNode;
}

export default function CommunityQnaAnswerItem({
  answer,
  actionSlot,
  isMine = false,
  commentSection,
}: CommunityQnaAnswerItemProps) {
  return (
    <article className="rounded-200 border border-border-subtle bg-background-default p-250">
      <div className="flex flex-col gap-200">
        <div className="flex flex-wrap items-start justify-between gap-100">
          <div className="flex flex-wrap items-center gap-100">
            {isMine ? (
              <span className="rounded-full bg-fill-static-default px-100 py-50 font-designer-12b text-text-default">
                내 답변
              </span>
            ) : null}
            {answer.isAccepted ? (
              <span className="inline-flex items-center gap-50 rounded-full bg-fill-brand-subtle-default px-100 py-50 font-designer-12b text-text-brand">
                <CheckCircle2 className="h-14 w-14" />
                채택된 답변
              </span>
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

        {commentSection}
      </div>
    </article>
  );
}
