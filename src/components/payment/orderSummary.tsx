interface Props {
  study: {
    title: string;
    desc: string;
    price: number;
    thumbnailUrl?: string;
  };
}

export default function OrderSummary({ study }: Props) {
  return (
    <div className="flex flex-col gap-300">
      <div className="flex items-center gap-250">
        <div className="rounded-25 h-[60px] w-[90px] bg-[#F97283]" />
        <div className="flex flex-1 flex-row items-end justify-between">
          <div className="space-y-1">
            <p className="font-designer-16m">{study.title}</p>
            <p className="font-designer-15r text-text-subtle">{study.desc}</p>
          </div>
          <p className="font-designer-14r text-text-subtle">
            {study.price.toLocaleString()}원
          </p>
        </div>
      </div>
    </div>
  );
}
