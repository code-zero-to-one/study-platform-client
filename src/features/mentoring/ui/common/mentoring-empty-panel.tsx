interface MentoringEmptyPanelProps {
  title: string;
  description: string;
}

export default function MentoringEmptyPanel({
  title,
  description,
}: MentoringEmptyPanelProps) {
  return (
    <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
      <p className="font-designer-15b text-text-default">{title}</p>
      <p className="mt-50 font-designer-13r text-text-subtle">
        {description}
      </p>
    </div>
  );
}
