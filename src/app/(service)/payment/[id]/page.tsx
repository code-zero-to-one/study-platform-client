// app/checkout/page.tsx

import OrderSummary from '@/components/payment/orderSummary';
import PaymentCheckoutPage from '@/components/payment/paymentActionClient';
import PriceSummary from '@/components/payment/priceSummary';
import { getGroupStudyDetailInServer } from '@/features/study/group/api/get-group-study-detail.server';

interface Study {
  id: string;
  title: string;
  desc: string;
  price: number;
  thumbnailUrl?: string;
}

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

async function getStudyData(groupStudyId: number): Promise<Study> {
  const studyDetail = await getGroupStudyDetailInServer({ groupStudyId });

  return {
    id: String(studyDetail.basicInfo.groupStudyId),
    title: studyDetail.detailInfo.title,
    desc: studyDetail.detailInfo.summary,
    price: studyDetail.basicInfo.price,
    thumbnailUrl:
      studyDetail.detailInfo.image?.resizedImages?.[0]?.resizedImageUrl || '',
  };
}

export default async function CheckoutPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const study = await getStudyData(Number(id));

  return (
    <div className="bg-background-alternative min-h-dvh">
      <div className="mx-auto max-w-[840px] pt-600">
        <div className="space-y-200">
          {/* 서버 렌더: 선택한 스터디 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">선택한 스터디</p>

            <OrderSummary study={study} />
          </section>

          {/* 서버 렌더: 결제 금액 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">결제 금액</p>

            <div className="px-5 pb-5">
              <PriceSummary price={study.price} />
            </div>
          </section>

          {/* 클라 렌더: 약관/결제수단/결제하기 */}
          <section>
            <PaymentCheckoutPage study={study} />
          </section>
        </div>
      </div>
    </div>
  );
}
