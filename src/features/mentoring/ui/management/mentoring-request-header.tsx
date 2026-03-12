interface MentoringRequestHeaderProps {
  title: string;
}
export default function MentoringRequestHeader({
  title,
}: MentoringRequestHeaderProps) {
  return (
    <div className="mb-100">
      {' '}
      <p className="mb-50 font-designer-14m text-text-subtle"> {title} </p>{' '}
    </div>
  );
}
