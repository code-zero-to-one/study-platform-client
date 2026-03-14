interface Props {
  title: string;
  value: React.ReactNode;
  unit?: string;
  changeIndicator?: {
    type: 'increase' | 'decrease';
    value: number;
  };
}

export default function MyStudyCard({
  title,
  value,
  unit,
  changeIndicator,
}: Props) {
  return (
    <div className="bg-background-alternative rounded-75 text-text-default flex flex-1 flex-col gap-150 p-250">
      <div className="font-designer-15r">{title}</div>
      <div className="flex items-center justify-end gap-75 text-right">
        <span className="font-designer-24b">{value}</span>
        {unit && <span className="font-designer-16m">{unit}</span>}
        {changeIndicator && (
          <div
            className={`font-designer-12m rounded-25 px-75 py-[3px] ${
              changeIndicator.type === 'increase'
                ? 'text-icon-information bg-blue-100'
                : 'text-icon-error bg-red-100'
            } flex items-center gap-25`}
          >
            {changeIndicator.type === 'increase' ? '▲' : '▼'}{' '}
            <span className="font-designer-15b px-[2px]">
              {changeIndicator.value}
            </span>
            %
          </div>
        )}
      </div>
    </div>
  );
}
