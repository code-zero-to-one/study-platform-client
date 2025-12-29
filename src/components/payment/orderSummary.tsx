interface Props {
  groupStudyTitle: string;
  amount: number;
}

export default function OrderSummary({ groupStudyTitle, amount }: Props) {
  return (
    <div className="flex flex-col gap-300">
      <div className="flex items-center gap-250">
        <div className="rounded-25 h-[60px] w-[90px] bg-[#F97283]" />
        <div className="flex flex-1 flex-row items-end justify-between">
          <div className="space-y-1">
            <p className="font-designer-16m">{groupStudyTitle}</p>
          </div>
          <p className="font-designer-14r text-text-subtle">
            {amount.toLocaleString()}원
          </p>
        </div>
      </div>
    </div>
  );
}
