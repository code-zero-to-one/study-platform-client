import { MENTORING_LIST_LABELS } from '@/features/mentoring/const/mentoring-list-labels';

export default function MentorDirectoryEmpty() {
  return (
    <div className="rounded-200 border-border-subtle bg-background-default border px-200 py-700 text-center">
      <p className="font-designer-18b text-text-strong mb-50">
        {MENTORING_LIST_LABELS.noSearchResultTitle}
      </p>
      <p className="font-designer-14r text-text-subtle">
        {MENTORING_LIST_LABELS.noSearchResultDescription}
      </p>
    </div>
  );
}
