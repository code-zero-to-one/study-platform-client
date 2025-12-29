'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';

interface PaymentResult {
  orderName: string;
  productAmount: number;
  paymentMethod: string;
  totalAmount: number;
}

// ✅ 가데이터
const MOCK_PAYMENT_RESULT: PaymentResult = {
  orderName: '1일코테문풀 인증 챌린지',
  productAmount: 35000,
  paymentMethod: '카드결제',
  totalAmount: 35000,
};

export default function PaymentCompletePage() {
  const router = useRouter();
  const data = MOCK_PAYMENT_RESULT;

  const formatKRW = (n: number) => `${n.toLocaleString('ko-KR')}원`;

  return (
    <div className="mx-auto">
      <div className="bg-fill-neutral-subtle-default border-border-default rounded-150 w-[840px] border p-500">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="relative h-[90px] w-[140px]">
            <Image
              src="/images/success-confetti.png"
              alt="success"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="mt-7 text-center">
          <h1 className="font-designer-32b">
            스터디 수강 신청이 완료되었습니다.
          </h1>
          <p className="font-designer-18m mt-100">
            수강/학습 내역과 결제 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>
        </div>

        {/* 정보 카드 */}
        <div className="mt-400">
          <div className="space-y-200">
            <Row label="주문 정보" value={data.orderName} bold />

            <div className="pt-2 font-bold">결제 정보</div>

            <Row label="상품 금액" value={formatKRW(data.productAmount)} />

            <div className="h-px bg-gray-200" />

            <Row label="결제 수단" value={data.paymentMethod} bold />

            <Row
              label="총 결제 금액"
              value={formatKRW(data.totalAmount)}
              bold
              strong
            />
          </div>

          {/* 버튼 */}
          <div className="mt-500 flex gap-[30px]">
            <Button
              color="primary"
              size="large"
              onClick={() => router.push('/my')}
              className="w-full"
            >
              마이스터디로 이동
            </Button>

            <Button
              color="secondary"
              size="large"
              onClick={() => router.push('/')}
              className="w-full"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  strong,
}: {
  label: string;
  value: string;
  bold?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center">
      <div className={` ${bold ? 'font-designer-18b' : 'font-designer-16m'}`}>
        {label}
      </div>
      <div
        className={`text-right ${
          strong ? 'font-designer-18b' : 'font-designer-16m'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
