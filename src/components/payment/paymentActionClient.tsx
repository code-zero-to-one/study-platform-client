'use client';

import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../ui/(shadcn)/lib/utils';
import Button from '../ui/button';
import Checkbox from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio';

interface Props {
  orderId: string;
  amount: number;
}

type PaymentMethod = 'CARD' | 'VBANK';
const clientKey = 'test_ck_ORzdMaqN3wEbO04g0xNNr5AkYXQG';
const customerKey = 'TwG7MSXwcuFlMaug2sHpf';

const methods: { id: PaymentMethod; label: string }[] = [
  { id: 'CARD', label: '신용카드 결제' },
  { id: 'VBANK', label: '무통장 입금 (가상계좌)' },
];

export default function PaymentCheckoutPage({
  orderId,
  // amount,
}: Props) {
  const [payment, setPayment] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');

  const canPay = isAgreed && !!paymentMethod;

  const toggleTerm = () => {
    setIsAgreed((prev) => !prev);
  };

  const onPay = async () => {
    setErrorMsg(null);

    if (!isAgreed) {
      setErrorMsg('필수 약관에 동의해 주세요.');

      return;
    }

    if (!paymentMethod) {
      setErrorMsg('결제 수단을 선택해 주세요.');

      return;
    }

    try {
      await payment.requestPayment({
        method: 'CARD', // 카드 및 간편결제
        amount: 50000, // 결제 금액
        orderId: 'a0bPplgMJIXnZfBh4sSI1', // 고유 주문번호
        orderName: '토스 티셔츠 외 2건',
        successUrl: window.location.origin + '/success', // 결제 요청이 성공하면 리다이렉트되는 URL
        failUrl: window.location.origin + '/fail', // 결제 요청이 실패하면 리다이렉트되는 URL
        customerEmail: 'customer123@gmail.com',
        customerName: '김토스',
        customerMobilePhone: '01012341234',
        // 카드 결제에 필요한 정보
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT', // 통합결제창 여는 옵션
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });

      // if (!res.ok) throw new Error('PAYMENT_SESSION_FAILED');

      // const data: { redirectUrl: string } = await res.json();
      // window.location.href = data.redirectUrl;
    } catch {
      setErrorMsg('결제 요청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
    }
  };

  const [amount] = useState({
    currency: 'KRW',
    value: 50000,
  });

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
        const payment = tossPayments.payment({
          customerKey,
        });

        setPayment(payment);
      } catch (error) {
        console.error('Error fetching payment:', error);
      }
    }

    fetchPayment().catch((error) => {
      console.error('Error in fetchPayment:', error);
    });
  }, [clientKey, customerKey]);

  return (
    <div className="space-y-200">
      {/* 이용약관 */}
      <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-250">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-75">
            <Checkbox
              id="term-agree"
              checked={isAgreed}
              onToggle={toggleTerm}
              themeColor="fill-success-default-default"
            />
            <span className="font-designer-14m text-text-subtle">
              이용약관 동의 (필수)
            </span>
          </div>

          <a
            className="text-xs text-gray-500 underline"
            href="/terms/payment"
            target="_blank"
            rel="noopener noreferrer"
          >
            내용보기
          </a>
        </div>
      </div>

      {/* 결제수단 */}
      <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
        <p className="font-designer-18b mb-300">결제 수단</p>

        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
          className="space-y-200"
        >
          {methods.map((m) => {
            const selected = paymentMethod === m.id;

            return (
              <Button
                key={m.id}
                type="button"
                color={selected ? 'primary' : 'secondary'}
                onClick={() => setPaymentMethod(m.id)}
                className="flex w-full items-center justify-start"
              >
                <label htmlFor={m.id} className="flex items-center">
                  <RadioGroupItem value={m.id} size="large" />
                  <span className="font-designer-16b ml-75">{m.label}</span>
                </label>
              </Button>
            );
          })}
        </RadioGroup>

        <Button
          type="button"
          color="primary"
          size="large"
          disabled={!canPay}
          onClick={onPay}
          className="font-designer-16b mt-400 w-full"
        >
          결제하기
        </Button>
      </div>
    </div>
  );
}
