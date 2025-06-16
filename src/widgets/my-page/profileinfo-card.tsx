interface Props {
  title: string;
  content?: string;
}

export default function ProfileInfoCard({ title, content }: Props) {
  return (
    <div className="flex gap-500 rounded-75 bg-background-alternative p-250">
      <div className="w-1/6 font-designer-16b shrink-0 text-text-default">
        {title}
      </div>
      <div className="flex-1 font-designer-15r text-text-default">
        {content ?? '정보 없음'}
      </div>
    </div>

  );
}
