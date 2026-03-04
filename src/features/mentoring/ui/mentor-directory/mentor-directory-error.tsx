import Button from '@/components/ui/button';

interface MentorDirectoryErrorProps {
  message: string;
  onRetry: () => void;
}

export default function MentorDirectoryError({
  message,
  onRetry,
}: MentorDirectoryErrorProps) {
  return (
    <div className="rounded-200 border-border-subtle bg-background-default border px-200 py-700 text-center">
      <p className="font-designer-18b text-text-strong mb-50">
        멘토 목록을 불러오지 못했습니다.
      </p>
      <p className="font-designer-14r text-text-subtle mb-200">{message}</p>
      <Button type="button" color="outlined" size="small" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}
