import { Check, Gift, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { CoursePlanResponse } from '@/types/api/course.types';

export function PlanSelectionModal({
  plan,
  courseId,
  earlyBirdEndsAt,
  onClose,
}: {
  plan: CoursePlanResponse;
  courseId: number;
  earlyBirdEndsAt: string | null;
  onClose: () => void;
}) {
  const isEarlyBird =
    !!earlyBirdEndsAt && new Date(earlyBirdEndsAt) > new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-gray-1000/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-7850 overflow-y-auto rounded-200 bg-gray-0 pb-875 pt-875">
        <button
          type="button"
          onClick={onClose}
          aria-label="플랜 선택 모달 닫기"
          className="absolute right-350 top-350 flex items-center justify-center"
        >
          <X className="size-400 text-gray-800" />
        </button>

        <div className="flex flex-col items-center gap-75 px-875">
          <p className="font-designer-24b text-gray-1000">
            지금 바로 시작하세요
          </p>
          <p className="font-designer-16m text-gray-800">
            바이브 코딩 입문자 코스의 다양한 혜택을 즐겨보세요!
          </p>
        </div>

        <div className="mx-auto mt-500 w-4875 overflow-hidden rounded-200 border-4 border-rose-500 bg-gray-0 shadow-[0_0_20px_var(--color-rose-300)]">
          <div className="px-350 pb-350 pt-350">
            {isEarlyBird && (
              <div className="mb-75 inline-flex items-center rounded-50 bg-rose-500 px-125 py-50">
                <span className="font-designer-14b text-gray-0">
                  얼리버드 혜택가
                </span>
              </div>
            )}

            <p className="mb-50 font-designer-20b text-gray-1000">
              {plan.name}
            </p>

            {plan.subtitle && (
              <div className="mb-200 flex items-center gap-75">
                <Gift className="size-300 text-rose-500" />
                <p className="font-designer-16b text-rose-500">
                  {plan.subtitle}
                </p>
              </div>
            )}

            <div className="mb-500 flex flex-col gap-125">
              {plan.items.map((item) => (
                <div key={item.code} className="flex items-center gap-100">
                  <div className="flex size-250 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <Check className="size-150 text-gray-600" />
                  </div>
                  <p
                    className={cn(
                      item.valueAmount > 0
                        ? 'font-designer-14b text-rose-500'
                        : 'font-designer-14m text-gray-800',
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-500 flex flex-col">
              {plan.regularPrice > plan.discountPrice && (
                <span className="font-designer-14m text-gray-400 line-through">
                  {plan.regularPrice.toLocaleString()}원
                </span>
              )}
              <p className="font-designer-24b text-gray-1000">
                {plan.discountPrice.toLocaleString()}원
              </p>
            </div>

            <Link
              href={`/payment/${courseId}?type=course&planCode=${plan.planCode}`}
              className="flex h-575 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-gray-0"
            >
              플랜 시작하기
            </Link>
          </div>
        </div>

        <p className="mt-500 px-875 font-designer-16m text-gray-500">
          모든 플랜은 환불 정책이 동일하게 적용됩니다. (결제 후 즉시 이용 가능)
        </p>
      </div>
    </div>
  );
}
