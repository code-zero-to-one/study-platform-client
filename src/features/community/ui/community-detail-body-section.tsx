'use client';

import Image from 'next/image';
import { memo } from 'react';
import CommunityMarkdownContent from './community-markdown-content';
import CommunitySectionShell from './community-section-shell';

interface CommunityDetailBodySectionProps {
  postId: number;
  title: string;
  contentHtml?: string;
  content: readonly string[];
  previewImage?: string;
  previewImageAlt?: string;
}

const hasSameParagraphs = (
  previousParagraphs: readonly string[],
  nextParagraphs: readonly string[],
) => {
  if (previousParagraphs === nextParagraphs) {
    return true;
  }

  if (previousParagraphs.length !== nextParagraphs.length) {
    return false;
  }

  return previousParagraphs.every(
    (paragraph, index) => paragraph === nextParagraphs[index],
  );
};

function CommunityDetailBodySection({
  postId,
  title,
  contentHtml,
  content,
  previewImage,
  previewImageAlt,
}: CommunityDetailBodySectionProps) {
  const hasRichContent = Boolean(contentHtml?.trim());

  return (
    <CommunitySectionShell className="gap-300">
      {!hasRichContent && previewImage ? (
        <div className="overflow-hidden rounded-200 border border-border-default bg-background-alternative">
          <Image
            src={previewImage}
            alt={previewImageAlt ?? title}
            width={1200}
            height={800}
            className="h-auto w-full"
            unoptimized
          />
        </div>
      ) : null}

      {hasRichContent ? (
        <CommunityMarkdownContent content={contentHtml ?? ''} />
      ) : (
        <div className="flex flex-col gap-250">
          {content.map((paragraph, index) => (
            <p
              key={`${postId}-${index}`}
              className="font-designer-16r leading-300 text-text-default"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </CommunitySectionShell>
  );
}

export default memo(
  CommunityDetailBodySection,
  (previousProps, nextProps) =>
    previousProps.postId === nextProps.postId &&
    previousProps.title === nextProps.title &&
    previousProps.contentHtml === nextProps.contentHtml &&
    previousProps.previewImage === nextProps.previewImage &&
    previousProps.previewImageAlt === nextProps.previewImageAlt &&
    hasSameParagraphs(previousProps.content, nextProps.content),
);
