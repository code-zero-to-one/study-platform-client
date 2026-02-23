'use client';

import { FileText, Link2, Paperclip, PictureInPicture2 } from 'lucide-react';
import { type MentoringRequestContentBlock } from '@/features/mentoring/model/request-content';

interface RequestContentViewerProps {
  requestMessage: string;
  requestContents?: MentoringRequestContentBlock[];
}

export default function RequestContentViewer({
  requestMessage,
  requestContents,
}: RequestContentViewerProps) {
  const hasStructuredContents =
    requestContents !== undefined && requestContents.length > 0;

  if (!hasStructuredContents) {
    return (
      <p className="font-designer-14r text-text-default rounded-100 bg-background-alternative px-150 py-125 leading-relaxed whitespace-pre-line">
        {requestMessage}
      </p>
    );
  }

  return (
    <div className="rounded-100 bg-background-alternative space-y-100 p-125">
      {requestContents.map((block) => {
        if (block.type === 'paragraph') {
          return (
            <p
              key={block.id}
              className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === 'image') {
          return (
            <div
              key={block.id}
              className="rounded-100 border-border-subtle bg-background-default flex items-center gap-75 border px-125 py-100"
            >
              <PictureInPicture2 className="text-text-subtle h-14 w-14 shrink-0" />
              <div className="min-w-0">
                <p className="font-designer-12r text-text-default truncate">
                  {block.fileName}
                </p>
                <p className="font-designer-11r text-text-subtle">이미지</p>
              </div>
            </div>
          );
        }

        if (block.type === 'file') {
          return (
            <div
              key={block.id}
              className="rounded-100 border-border-subtle bg-background-default flex items-center gap-75 border px-125 py-100"
            >
              <Paperclip className="text-text-subtle h-14 w-14 shrink-0" />
              <div className="min-w-0">
                <p className="font-designer-12r text-text-default truncate">
                  {block.fileName}
                </p>
                <p className="font-designer-11r text-text-subtle">첨부파일</p>
              </div>
            </div>
          );
        }

        return (
          <a
            key={block.id}
            href={block.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-100 border-border-subtle bg-background-default flex items-center gap-75 border px-125 py-100"
          >
            <Link2 className="text-text-brand h-14 w-14 shrink-0" />
            <span className="font-designer-12r text-text-brand truncate underline">
              {block.url}
            </span>
          </a>
        );
      })}

      <div className="rounded-100 border-border-subtle bg-background-default flex items-center gap-75 border px-125 py-100">
        <FileText className="text-text-subtle h-14 w-14 shrink-0" />
        <p className="font-designer-11r text-text-subtle leading-relaxed">
          위 순서대로 멘토에게 전달됩니다.
        </p>
      </div>
    </div>
  );
}
