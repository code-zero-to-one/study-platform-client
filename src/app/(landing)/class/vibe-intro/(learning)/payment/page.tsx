'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { VibeIntroCheckoutForm } from '@/components/pages/class/vibe-intro/payment/checkout-form';
import { PlanSelectionModal } from '@/components/pages/class/vibe-intro/plan-selection-modal';
import {
  useGetCourseDetail,
  usePrepareCoursePaymentQuery,
} from '@/hooks/queries/course/course-api';
import type { CoursePlanCode } from '@/types/api/course.types';

export default function VibeIntroPaymentPage() {
  const searchParams = useSearchParams();
  const VALID_PLAN_CODES: CoursePlanCode[] = ['ALL_IN_ONE', 'LEARN_ONLY'];
  const rawPlanCode = searchParams.get('planCode') ?? 'ALL_IN_ONE';
  const planCode: CoursePlanCode = VALID_PLAN_CODES.includes(
    rawPlanCode as CoursePlanCode,
  )
    ? (rawPlanCode as CoursePlanCode)
    : 'ALL_IN_ONE';

  const [showPlanModal, setShowPlanModal] = useState(false);

  const { data: course, isLoading: courseLoading } =
    useGetCourseDetail('vibe-intro');
  const courseId = course?.courseId ?? 0;

  const { data: paymentData, isLoading: paymentLoading } =
    usePrepareCoursePaymentQuery({
      courseId,
      planCode,
      enabled: !!courseId,
    });

  const plan = course?.plans?.find((p) => p.planCode === planCode);

  if (courseLoading || paymentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-designer-16r text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!plan || !paymentData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-designer-16r text-gray-500">
          결제 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-gray-300 py-400 text-center">
        <h1 className="font-designer-20b text-gray-800">결제하기</h1>
      </div>

      <VibeIntroCheckoutForm
        plan={plan}
        paymentData={paymentData}
        planCode={planCode}
        onChangePlan={() => setShowPlanModal(true)}
      />

      {showPlanModal && (
        <PlanSelectionModal
          plan={plan}
          earlyBirdEndsAt={course?.earlyBirdEndsAt ?? null}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </>
  );
}
