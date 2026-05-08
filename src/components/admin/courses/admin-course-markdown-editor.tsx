'use client';

import { memo, useEffect, useRef, useState } from 'react';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadAdminCourseImage } from '@/features/admin/course-management/model/admin-course-image-upload';
import {
  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  ADMIN_COURSE_MARKDOWN_MAX_IMAGE_COUNT,
  ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE,
  normalizeAdminCourseMarkdownContent,
} from '@/features/admin/course-management/model/admin-course-markdown';

interface AdminCourseMarkdownEditorProps {
  editorStateKey?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

function AdminCourseMarkdownEditor({
  editorStateKey,
  value,
  onChange,
  placeholder,
}: AdminCourseMarkdownEditorProps) {
  const normalizedValue = normalizeAdminCourseMarkdownContent(value);
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
        normalizeContent={normalizeAdminCourseMarkdownContent}
        imageConfig={{
          allowedImageExtensions:
            ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
          maxImageCount: ADMIN_COURSE_MARKDOWN_MAX_IMAGE_COUNT,
          maxImageFileSize: ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE,
          uploadImageFile: uploadAdminCourseImage,
        }}
      />
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
