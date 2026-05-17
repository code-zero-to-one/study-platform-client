import type { CoursePlanResponse } from '@/types/api/course.types';

interface AmountSectionProps {
  plan: CoursePlanResponse;
}

export function AmountSection({ plan }: AmountSectionProps) {
  const discountAmount = plan.regularPrice - plan.discountPrice;

  return (
    <div className="rounded-200 border border-gray-300 bg-background-default px-500 py-400">
      <h2 className="mb-300 font-designer-18b text-gray-800">결제 금액</h2>

      <div className="flex flex-col gap-200">
        <div className="flex items-center justify-between">
          <span className="font-designer-16m text-gray-500">정가</span>
          <span className="font-designer-16m text-gray-400 line-through">
            {plan.regularPrice.toLocaleString()}원
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-designer-16m text-gray-500">
              얼리버드 할인
            </span>
            <span className="font-designer-16m text-rose-500">
              -{discountAmount.toLocaleString()}원
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-200">
          <div className="flex items-center justify-between">
            <span className="font-designer-18b text-gray-800">
              총 결제 금액
            </span>
            <span className="font-designer-20b text-gray-800">
              {plan.discountPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
