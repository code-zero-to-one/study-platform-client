// app/checkout/_components/PriceSummary.tsx
interface Props {
  price: number;
}

export default function PriceSummary({ price }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-designer-16m text-text-default">상품 금액</p>
        <p className="font-designer-16m text-text-default">
          {price.toLocaleString()}원
        </p>
      </div>

      <div className="my-200 h-px bg-gray-200" />

      <div className="flex items-center justify-between">
        <p className="font-designer-18b">총 결제 금액</p>
        <p className="font-designer-18b">{price.toLocaleString()}원</p>
      </div>
    </div>
  );
}
