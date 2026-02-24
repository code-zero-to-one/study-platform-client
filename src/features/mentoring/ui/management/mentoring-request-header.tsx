interface MentoringRequestHeaderProps {
  title: string;
}

export default function MentoringRequestHeader({
  title,
}: MentoringRequestHeaderProps) {
  return (
    <div className="mb-100">
      <p className="font-designer-14m text-text-subtle mb-50">
        {title}
      </p>
    </div>
  );
}
