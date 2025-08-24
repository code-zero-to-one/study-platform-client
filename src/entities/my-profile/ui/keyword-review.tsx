export default function KeywordReview({
  content,
  count,
}: {
  content: string;
  count: number;
}) {
  return (
    <li className="bg-background-accent-gray-default text-text-default rounded-50 flex justify-between px-200 py-100">
      <span className="font-designer-14r">{content}</span>
      <span className="font-designer-14b">{count}</span>
    </li>
  );
}
