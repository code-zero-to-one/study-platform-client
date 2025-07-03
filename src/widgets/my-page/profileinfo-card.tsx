interface Props {
  title: string;
  content?: string;
}

export default function ProfileInfoCard({ title, content }: Props) {
  return (
    <div className="rounded-75 bg-background-alternative flex gap-400 p-250">
      <div className="font-designer-16b text-text-default w-1/5 shrink-0">
        {title}
      </div>
      <div className="font-designer-15r text-text-default flex-1">
        {content ?? '정보 없음'}
      </div>
    </div>
  );
}
