'use client';

import { FileText, Link2, Paperclip, PictureInPicture2 } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  isMentoringRequestHtmlDocument,
  parseMentoringRequestRichTextDocument,
  type MentoringRequestContentBlock,
  type MentoringRequestRichTextNode,
} from '@/features/mentoring/model/request-content';
import MentoringMarkdownContent from '@/features/mentoring/ui/common/mentoring-markdown-content';

interface RequestContentViewerProps {
  requestMessage: string;
  requestContents?: MentoringRequestContentBlock[];
  hideGuidance?: boolean;
}

const resolveAttachmentUrl = (source: Record<string, unknown>) => {
  return (
    getStringField(source, 'downloadUrl') ??
    getStringField(source, 'publicUrl') ??
    getStringField(source, 'url')
  );
};

const AttachmentCard = ({
  icon,
  fileName,
  label,
  href,
}: {
  icon: ReactNode;
  fileName: string;
  label: string;
  href?: string;
}) => {
  const content = (
    <>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="font-designer-12r text-text-default truncate">
          {fileName}
        </p>
        <p className="font-designer-11r text-text-subtle">{label}</p>
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="rounded-100 border-border-subtle bg-background-default flex items-center gap-75 border px-125 py-100">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      download
      className="rounded-100 border-border-subtle bg-background-default hover:border-border-strong hover:bg-background-alternative flex items-center gap-75 border px-125 py-100"
    >
      {content}
    </a>
  );
};

const FONT_SIZE_STYLE_MAP = {
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getStringField = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];

  return typeof value === 'string' ? value : undefined;
};

const getBooleanField = (
  source: Record<string, unknown>,
  key: string,
): boolean => {
  return source[key] === true;
};

const getChildren = (
  node: MentoringRequestRichTextNode,
): MentoringRequestRichTextNode[] => {
  const children = node.children;
  if (!Array.isArray(children)) {
    return [];
  }

  return children.filter(isRecord);
};

const hasRenderableChildren = (children: ReactNode[]) => {
  return children.some((child) => child !== null && child !== false);
};

const renderRichTextNode = (
  node: MentoringRequestRichTextNode,
  key: string,
): ReactNode => {
  const text = getStringField(node, 'text');
  if (text !== undefined) {
    const fontSize = getStringField(node, 'fontSize');
    const resolvedFontSize =
      fontSize === 'sm' || fontSize === 'lg' || fontSize === 'xl'
        ? fontSize
        : 'md';

    return (
      <span
        key={key}
        className={cn(
          'text-text-default whitespace-pre-wrap',
          getBooleanField(node, 'bold') && 'font-bold',
          getBooleanField(node, 'italic') && 'italic',
          getBooleanField(node, 'underline') && 'underline',
          getBooleanField(node, 'strikethrough') && 'line-through',
        )}
        style={{ fontSize: FONT_SIZE_STYLE_MAP[resolvedFontSize] }}
      >
        {text}
      </span>
    );
  }

  const nodeType = getStringField(node, 'type');
  const children = getChildren(node).map((child, index) => {
    return renderRichTextNode(child, `${key}-${index}`);
  });

  if (nodeType === 'heading-two') {
    return (
      <h2 key={key} className="font-designer-20b text-text-strong mb-75">
        {hasRenderableChildren(children) ? children : null}
      </h2>
    );
  }

  if (nodeType === 'heading-three') {
    return (
      <h3 key={key} className="font-designer-18b text-text-default mb-75">
        {hasRenderableChildren(children) ? children : null}
      </h3>
    );
  }

  if (nodeType === 'block-quote') {
    return (
      <blockquote
        key={key}
        className="rounded-100 border-border-subtle bg-background-default border-l-[3px] px-125 py-100"
      >
        <p className="font-designer-14r text-text-subtle leading-relaxed">
          {children}
        </p>
      </blockquote>
    );
  }

  if (nodeType === 'bulleted-list') {
    return (
      <ul key={key} className="list-disc space-y-50 pl-250">
        {children}
      </ul>
    );
  }

  if (nodeType === 'numbered-list') {
    return (
      <ol key={key} className="list-decimal space-y-50 pl-250">
        {children}
      </ol>
    );
  }

  if (nodeType === 'list-item') {
    return (
      <li key={key} className="font-designer-14r text-text-default">
        {children}
      </li>
    );
  }

  if (nodeType === 'link') {
    const url = getStringField(node, 'url');

    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-text-brand inline-flex items-center gap-50 underline"
      >
        <Link2 className="h-14 w-14" />
        {hasRenderableChildren(children) ? children : url}
      </a>
    );
  }

  if (nodeType === 'image') {
    const fileName = getStringField(node, 'fileName') ?? '이미지';
    const attachmentUrl = resolveAttachmentUrl(node);

    return (
      <AttachmentCard
        key={key}
        fileName={fileName}
        label={attachmentUrl ? '이미지 다운로드' : '이미지'}
        href={attachmentUrl}
        icon={<PictureInPicture2 className="text-text-subtle h-14 w-14" />}
      />
    );
  }

  if (nodeType === 'file') {
    const fileName = getStringField(node, 'fileName') ?? '첨부파일';
    const attachmentUrl = resolveAttachmentUrl(node);

    return (
      <AttachmentCard
        key={key}
        fileName={fileName}
        label={attachmentUrl ? '첨부파일 다운로드' : '첨부파일'}
        href={attachmentUrl}
        icon={<Paperclip className="text-text-subtle h-14 w-14" />}
      />
    );
  }

  return (
    <p
      key={key}
      className="font-designer-14r text-text-default leading-relaxed whitespace-pre-wrap"
    >
      {children}
    </p>
  );
};

const RichTextDocumentViewer = ({
  document,
}: {
  document: MentoringRequestRichTextNode[];
}) => {
  return (
    <div className="space-y-100">
      {document.map((node, index) => {
        return renderRichTextNode(node, `rich-text-node-${index}`);
      })}
    </div>
  );
};

const LegacyBlockViewer = ({
  block,
}: {
  block: Exclude<MentoringRequestContentBlock, { type: 'richText' }>;
}) => {
  if (block.type === 'paragraph') {
    return (
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {block.text}
      </p>
    );
  }

  if (block.type === 'image') {
    const attachmentUrl = block.downloadUrl ?? block.publicUrl;

    return (
      <AttachmentCard
        fileName={block.fileName}
        label={attachmentUrl ? '이미지 다운로드' : '이미지'}
        href={attachmentUrl}
        icon={<PictureInPicture2 className="text-text-subtle h-14 w-14" />}
      />
    );
  }

  if (block.type === 'file') {
    const attachmentUrl = block.downloadUrl;

    return (
      <AttachmentCard
        fileName={block.fileName}
        label={attachmentUrl ? '첨부파일 다운로드' : '첨부파일'}
        href={attachmentUrl}
        icon={<Paperclip className="text-text-subtle h-14 w-14" />}
      />
    );
  }

  return (
    <a
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
};

export default function RequestContentViewer({
  requestMessage,
  requestContents,
  hideGuidance = false,
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
        if (block.type === 'richText') {
          if (isMentoringRequestHtmlDocument(block.document)) {
            return (
              <MentoringMarkdownContent
                key={block.id}
                content={block.document}
                className="rounded-100 bg-background-default px-150 py-125"
              />
            );
          }

          const parsed = parseMentoringRequestRichTextDocument(block.document);
          if (parsed.length === 0) {
            return null;
          }

          return <RichTextDocumentViewer key={block.id} document={parsed} />;
        }

        return <LegacyBlockViewer key={block.id} block={block} />;
      })}

      {hideGuidance ? null : (
        <div className="rounded-100 border-border-subtle bg-background-default flex items-center gap-75 border px-125 py-100">
          <FileText className="text-text-subtle h-14 w-14 shrink-0" />
          <p className="font-designer-11r text-text-subtle leading-relaxed">
            작성 내용 순서대로 멘토에게 전달됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
