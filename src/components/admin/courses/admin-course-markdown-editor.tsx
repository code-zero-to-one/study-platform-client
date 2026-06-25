'use client';

import { memo, useEffect, useRef, useState } from 'react';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadAdminLessonContentImage } from '@/features/admin/course-management/model/admin-course-image-upload';
import {
  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  ADMIN_COURSE_MARKDOWN_APPROX_KOREAN_TEXT_LENGTH,
  ADMIN_COURSE_MARKDOWN_MAX_CONTENT_BYTES,
  ADMIN_COURSE_MARKDOWN_MAX_IMAGE_COUNT,
  ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE,
  normalizeAdminCourseMarkdownContent,
} from '@/features/admin/course-management/model/admin-course-markdown';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';

const formatByteSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.floor(bytes / 1024)}KB`;
  }

  return `${Math.floor(bytes / 1024 / 1024)}MB`;
};

interface AdminCourseMarkdownEditorProps {
  editorStateKey?: string;
  lessonId?: number;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  outputFormat?: 'html' | 'markdown';
}

function AdminCourseMarkdownEditor({
  editorStateKey,
  lessonId,
  value,
  onChange,
  placeholder,
  outputFormat = 'html',
}: AdminCourseMarkdownEditorProps) {
  // 마크다운 모드에서는 HTML 속성 strip 없이 마크다운을 그대로 보존한다.
  // (admin normalize는 HTML 본문 전용 — 마크다운에 적용하면 본문이 손상됨)
  const normalizeContent =
    outputFormat === 'markdown'
      ? normalizeMarkdownContent
      : normalizeAdminCourseMarkdownContent;
  const normalizedValue = normalizeContent(value);
  const lastSourceValueRef = useRef(normalizedValue);

  const [draftValue, setDraftValue] = useState(() => normalizedValue);

  useEffect(() => {
    setDraftValue(normalizedValue);
    lastSourceValueRef.current = normalizedValue;
  }, [editorStateKey, normalizedValue]);

  useEffect(() => {
    if (lastSourceValueRef.current === normalizedValue) {
      return;
    }

    setDraftValue((prevDraftValue) => {
      if (prevDraftValue !== lastSourceValueRef.current) {
        return prevDraftValue;
      }

      return normalizedValue;
    });
    lastSourceValueRef.current = normalizedValue;
  }, [normalizedValue]);

  return (
    <div className="admin-course-markdown-editor">
      <MarkdownEditor
        value={draftValue}
        onChange={(next) => {
          setDraftValue(next);
          onChange(next);
        }}
        placeholder={placeholder}
        normalizeContent={normalizeContent}
        outputFormat={outputFormat}
        imageConfig={
          lessonId
            ? {
                allowedImageExtensions:
                  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
                maxImageCount: ADMIN_COURSE_MARKDOWN_MAX_IMAGE_COUNT,
                maxImageFileSize: ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE,
                uploadImageFile: (file) =>
                  uploadAdminLessonContentImage({ lessonId, file }),
              }
            : undefined
        }
      />
      <p className="font-designer-12r text-text-subtle mt-50">
        본문 저장 한도는 최대{' '}
        {formatByteSize(ADMIN_COURSE_MARKDOWN_MAX_CONTENT_BYTES)}
        (TEXT, 한글/HTML 포함 약{' '}
        {ADMIN_COURSE_MARKDOWN_APPROX_KOREAN_TEXT_LENGTH.toLocaleString()}자
        내외)이며, 이미지는 최대 {ADMIN_COURSE_MARKDOWN_MAX_IMAGE_COUNT}개까지
        넣을 수 있습니다. 이미지 파일은 개당 최대{' '}
        {formatByteSize(ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE)}입니다.
      </p>
      {!lessonId && (
        <p className="font-designer-12r text-text-subtle mt-25">
          레슨 본문 이미지는 레슨 생성 후 편집 모드에서 업로드할 수 있습니다.
        </p>
      )}
      <style jsx global>{`
        .admin-course-markdown-editor .tiptap-editor {
          min-height: var(--spacing-650);
        }

        .admin-course-markdown-editor .tiptap-editor .tiptap > * {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}

export default memo(AdminCourseMarkdownEditor);
