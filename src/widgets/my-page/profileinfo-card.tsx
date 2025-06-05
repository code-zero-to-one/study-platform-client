interface Props {
  title: string;
  content: string;
}

export default function ProfileInfoCard({ title, content }: Props) {
  return (
    <div className="rounded-75 bg-background-alternative flex gap-500 p-250">
      <div className="font-designer-16b text-text-default w-1/6 shrink-0">
        {title}
      </div>
      <p className="font-designer-15r text-text-default w-3/6 flex-1">
        {content}
      </p>
    </div>
  );
}
