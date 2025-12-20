// app/checkout/page.tsx

import OrderSummary from '@/components/payment/orderSummary';
import PaymentCheckoutPage from '@/components/payment/paymentActionClient';
import CheckoutActionClient from '@/components/payment/paymentActionClient';
import PriceSummary from '@/components/payment/priceSummary';

interface Study {
  id: string;
  title: string;
  desc: string;
  price: number;
  thumbnailUrl?: string;
}

interface Terms {
  id: string;
  label: string;
  required: boolean;
  url?: string;
}

interface PaymentMethod {
  id: 'CARD' | 'VBANK';
  label: string;
  subLabel?: string;
}

async function getCheckoutData(): Promise<{
  study: Study;
  terms: Terms[];
  methods: PaymentMethod[];
}> {
  // 실제론 db / internal api에서 가져오기
  return {
    study: {
      id: 'study_1',
      title: '1일1코테류프를 인증 챌린지',
      desc: '1인 개발자, 이제는 대세가 되었다죠.',
      price: 35000,
      thumbnailUrl: '',
    },
    terms: [
      {
        id: 'terms_usage',
        label: '이용약관 동의 (필수)',
        required: true,
        url: '/terms/usage',
      },
    ],
    methods: [
      { id: 'CARD', label: '신용카드 결제' },
      { id: 'VBANK', label: '무통장 입금 (가상계좌)' },
    ],
  };
}

export default async function CheckoutPage() {
  const { study, terms, methods } = await getCheckoutData();

  // const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
  // const tossPayments = await loadTossPayments(clientKey);

  //  const customerKey = "pfROxUh11lHWaPrBxzIBN";
  //       const widgets = tossPayments.widgets({
  //         customerKey,
  //       });

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
            <PaymentCheckoutPage
              orderId={study.id}
              amount={study.price}
              terms={terms}
              methods={methods}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
