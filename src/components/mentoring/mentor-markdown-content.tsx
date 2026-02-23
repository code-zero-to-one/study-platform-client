'use client';

/* eslint-disable @next/next/no-img-element */

import { type Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface MentorMarkdownContentProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="font-designer-14r text-text-default mb-150 leading-relaxed">
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h1 className="font-designer-24b text-text-strong mt-250 mb-150">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-designer-20b text-text-strong mt-250 mb-125">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-designer-18b text-text-default mt-200 mb-100">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-150 list-disc space-y-50 pl-250">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-150 list-decimal space-y-50 pl-250">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="font-designer-14r text-text-default leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="rounded-100 bg-background-alternative border-border-subtle mb-150 border-l-4 px-150 py-125">
      <p className="font-designer-14r text-text-subtle leading-relaxed">
        {children}
      </p>
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-text-brand underline"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => {
    if (!src) {
      return null;
    }

    return (
      <figure className="rounded-100 border-border-subtle bg-background-default mb-150 overflow-hidden border">
        <img
          src={src}
          alt={alt ?? '멘토 소개 이미지'}
          className="h-auto w-full"
        />
        {alt ? (
          <figcaption className="font-designer-12r text-text-subtle px-125 py-100">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    );
  },
  code: ({ children }) => (
    <code className="rounded-50 bg-background-alternative font-designer-13r px-75 py-[2px]">
      {children}
    </code>
  ),
  hr: () => <hr className="border-border-subtle my-200" />,
};

export default function MentorMarkdownContent({
  content,
  className,
  emptyMessage = '아직 작성된 소개가 없습니다.',
}: MentorMarkdownContentProps) {
  if (content.trim().length === 0) {
    return (
      <p className="font-designer-14r text-text-subtle leading-relaxed">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn('break-words', className)}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
