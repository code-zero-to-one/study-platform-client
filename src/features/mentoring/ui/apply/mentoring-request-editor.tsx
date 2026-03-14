'use client';

import { ImagePlus, Paperclip, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import Button from '@/components/common/ui/button';
import { getMentoringApplyPlaceholder } from '@/features/mentoring/model/mentoring-flow-policy';
import {
  requestMentoringMessageAttachmentUploadTicket,
  uploadMentoringMessageAttachmentFile,
} from '@/features/mentoring/model/mentoring-message-attachment-upload';
import {
  buildMentoringRequestMessage,
  convertMentoringRequestLegacyTextToHtml,
  createMentoringRequestFileBlock,
  createMentoringRequestHtmlBlock,
  createMentoringRequestImageBlock,
  isMentoringRequestHtmlDocument,
  type MentoringRequestContentBlock,
  type MentoringRequestFileBlock,
  type MentoringRequestImageBlock,
  type MentoringRequestRichTextBlock,
} from '@/features/mentoring/model/request-content';
import MentoringMarkdownEditor from '@/features/mentoring/ui/common/mentoring-markdown-editor';
import type { MentoringMethodType } from '@/types/mentoring/domain';
import { extractImageUrls } from '@/types/mentoring/markdown';

interface MentoringRequestEditorProps {
  method: MentoringMethodType;
  value: MentoringRequestContentBlock[];
  onChange: (next: MentoringRequestContentBlock[]) => void;
}

const MAX_MEDIA_BLOCK_COUNT = 20;

const isRichTextBlock = (
  block: MentoringRequestContentBlock,
): block is MentoringRequestRichTextBlock => {
  return block.type === 'richText';
};

const isAttachmentBlock = (
  block: MentoringRequestContentBlock,
): block is MentoringRequestFileBlock | MentoringRequestImageBlock => {
  return block.type === 'file' || block.type === 'image';
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const toParagraphHtml = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return '';
  }

  return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br />')}</p>`;
};

const toLegacyRequestHtml = (contents: MentoringRequestContentBlock[]) => {
  const richTextBlock = contents.find(isRichTextBlock);
  if (richTextBlock) {
    if (isMentoringRequestHtmlDocument(richTextBlock.document)) {
      return richTextBlock.document;
    }

    return convertMentoringRequestLegacyTextToHtml(
      buildMentoringRequestMessage([richTextBlock]),
    );
  }

  return contents
    .flatMap((block) => {
      if (block.type === 'paragraph') {
        const html = toParagraphHtml(block.text);

        return html.length > 0 ? [html] : [];
      }

      if (block.type === 'link') {
        const url = block.url.trim();
        if (url.length === 0) {
          return [];
        }

        const escapedUrl = escapeHtml(url);

        return [`<p><a href="${escapedUrl}">${escapedUrl}</a></p>`];
      }

      return [];
    })
    .join('');
};

const getAttachmentKindLabel = (
  block: MentoringRequestFileBlock | MentoringRequestImageBlock,
) => {
  return block.type === 'image' ? '이미지' : '파일';
};

export default function MentoringRequestEditor({
  method,
  value,
  onChange,
}: MentoringRequestEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorError, setEditorError] = useState('');
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  const richTextBlock = useMemo(() => value.find(isRichTextBlock), [value]);
  const attachmentBlocks = useMemo(
    () => value.filter(isAttachmentBlock),
    [value],
  );
  const editorHtml = useMemo(() => toLegacyRequestHtml(value), [value]);
  const embeddedImageCount = useMemo(() => {
    return extractImageUrls(editorHtml).length;
  }, [editorHtml]);
  const mediaCount = embeddedImageCount + attachmentBlocks.length;

  const syncContents = ({
    nextHtml = editorHtml,
    nextAttachments = attachmentBlocks,
  }: {
    nextHtml?: string;
    nextAttachments?: Array<
      MentoringRequestFileBlock | MentoringRequestImageBlock
    >;
  }) => {
    onChange([
      createMentoringRequestHtmlBlock(nextHtml, richTextBlock?.id),
      ...nextAttachments,
    ]);
  };

  const handleFileSelection = async (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const remainCount = MAX_MEDIA_BLOCK_COUNT - mediaCount;
    if (remainCount <= 0) {
      setEditorError(
        `이미지/파일은 최대 ${MAX_MEDIA_BLOCK_COUNT}개까지 첨부할 수 있습니다.`,
      );

      return;
    }

    const filesToInsert = selectedFiles.slice(0, remainCount);
    const uploadedBlocks: Array<
      MentoringRequestFileBlock | MentoringRequestImageBlock
    > = [];
    const uploadErrors: string[] = [];

    setIsUploadingAttachments(true);

    try {
      for (const file of filesToInsert) {
        try {
          const ticket = await requestMentoringMessageAttachmentUploadTicket({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            attachmentType: 'FILE',
          });

          await uploadMentoringMessageAttachmentFile({
            uploadUrl: ticket.uploadUrl,
            file,
          });

          uploadedBlocks.push(
            file.type.startsWith('image/')
              ? createMentoringRequestImageBlock({
                  fileName: file.name,
                  fileSize: file.size,
                  mimeType: file.type || undefined,
                  fileKey: ticket.fileKey,
                  publicUrl: ticket.publicUrl,
                  downloadUrl: ticket.downloadUrl,
                })
              : createMentoringRequestFileBlock({
                  fileName: file.name,
                  fileSize: file.size,
                  mimeType: file.type || undefined,
                  fileKey: ticket.fileKey,
                  publicUrl: ticket.publicUrl,
                  downloadUrl: ticket.downloadUrl,
                }),
          );
        } catch {
          uploadErrors.push(`${file.name}: 업로드 실패`);
        }
      }
    } finally {
      setIsUploadingAttachments(false);
    }

    if (uploadedBlocks.length > 0) {
      syncContents({
        nextAttachments: [...attachmentBlocks, ...uploadedBlocks],
      });
    }

    if (selectedFiles.length > filesToInsert.length) {
      uploadErrors.push(
        `일부 파일은 제외되었습니다. 이미지/파일은 최대 ${MAX_MEDIA_BLOCK_COUNT}개까지 첨부할 수 있습니다.`,
      );
    }

    setEditorError(uploadErrors.join(' '));
  };

  return (
    <div className="space-y-125">
      <MentoringMarkdownEditor
        value={editorHtml}
        onChange={(nextHtml) => {
          setEditorError('');
          syncContents({ nextHtml });
        }}
        placeholder={getMentoringApplyPlaceholder(method)}
        maxImageCount={MAX_MEDIA_BLOCK_COUNT}
        requestImageUploadTicket={({ fileName, fileType, fileSize }) =>
          requestMentoringMessageAttachmentUploadTicket({
            fileName,
            fileType,
            fileSize,
            attachmentType: 'INLINE_IMAGE',
          })
        }
        uploadImageFile={uploadMentoringMessageAttachmentFile}
      />

      <div className="rounded-125 border-border-subtle bg-background-alternative space-y-100 border px-150 py-125">
        <div className="flex flex-wrap items-center gap-75">
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAttachments}
          >
            <Paperclip className="h-14 w-14" />
            {isUploadingAttachments ? '업로드 중...' : '첨부파일'}
          </Button>
          <span className="font-designer-12r text-text-subtle inline-flex items-center gap-50">
            <ImagePlus className="h-14 w-14" />
            이미지/파일 {mediaCount}/{MAX_MEDIA_BLOCK_COUNT}
          </span>
        </div>

        <p className="font-designer-12r text-text-subtle">
          {method === 'offline'
            ? '지도 링크, 장소 참고 자료, 현장에서 볼 문서는 첨부파일로 남겨주세요.'
            : method === 'note'
              ? '링크·이미지는 에디터에서, 문서 자료는 첨부파일로 남겨주세요.'
              : '링크·이미지는 에디터에서, 문서나 포트폴리오는 첨부파일로 남겨주세요.'}
        </p>

        {attachmentBlocks.length > 0 ? (
          <div className="space-y-75">
            {attachmentBlocks.map((block) => (
              <div
                key={block.id}
                className="rounded-100 border-border-subtle bg-background-default flex items-center justify-between gap-100 border px-125 py-100"
              >
                <div className="min-w-0">
                  <p className="font-designer-13r text-text-default truncate">
                    {block.fileName}
                  </p>
                  <p className="font-designer-12r text-text-subtle mt-25">
                    {getAttachmentKindLabel(block)}
                  </p>
                </div>
                <Button
                  type="button"
                  color="secondary"
                  size="small"
                  onClick={() => {
                    setEditorError('');
                    syncContents({
                      nextAttachments: attachmentBlocks.filter(
                        (attachmentBlock) => attachmentBlock.id !== block.id,
                      ),
                    });
                  }}
                >
                  <X className="h-14 w-14" />
                  제거
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {editorError ? (
        <p className="font-designer-12r text-text-error">{editorError}</p>
      ) : isUploadingAttachments ? (
        <p className="font-designer-12r text-text-subtle">
          첨부파일을 업로드하는 중입니다.
        </p>
      ) : null}

      <input
        data-testid="mentoring-request-attachment-input"
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFileSelection(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
