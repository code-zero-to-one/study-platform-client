import AdminCourseField from '@/components/admin/courses/admin-course-field';
import AdminCourseMarkdownEditor from '@/components/admin/courses/admin-course-markdown-editor';

interface AdminCourseMarkdownFieldProps {
  lessonId?: number;
  value: string;
  onChange: (content: string) => void;
  placeholder: string;
  helper?: string;
  editorStateKey?: string;
  isHydrating?: boolean;
  hydratingText?: string;
  outputFormat?: 'html' | 'markdown';
}

export default function AdminCourseMarkdownField({
  lessonId,
  value,
  onChange,
  placeholder,
  helper,
  editorStateKey,
  isHydrating = false,
  hydratingText = '본문을 불러오는 중입니다.',
  outputFormat = 'html',
}: AdminCourseMarkdownFieldProps) {
  return (
    <AdminCourseField label="본문" helper={helper}>
      <div className="border-border-default rounded-100 overflow-hidden border">
        {isHydrating ? (
          <div className="font-designer-14r text-text-subtle bg-background-subtlest flex min-h-260 items-center justify-center px-150 py-125">
            {hydratingText}
          </div>
        ) : (
          <AdminCourseMarkdownEditor
            editorStateKey={editorStateKey}
            lessonId={lessonId}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            outputFormat={outputFormat}
          />
        )}
      </div>
    </AdminCourseField>
  );
}
