'use client';

import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useEffect, useState } from 'react';
import { StudyPaymentPrepareResponse } from '@/api/openapi';
import { useUserStore } from '@/stores/useUserStore';
import PaymentTermsModal from '../modals/payment-terms-modal';
import Button from '../ui/button';
import Checkbox from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio';

interface Props {
  study: StudyPaymentPrepareResponse;
}

type PaymentMethod = 'CARD' | 'VIRTUAL_ACCOUNT';
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';

const methods: { id: PaymentMethod; label: string }[] = [
  { id: 'CARD', label: '신용카드 결제' },
  { id: 'VIRTUAL_ACCOUNT', label: '무통장 입금 (가상계좌)' },
];

export default function PaymentCheckoutPage({ study }: Props) {
  const [payment, setPayment] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { memberName, tel } = useUserStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');

  const canPay = isAgreed && !!paymentMethod && !isLoading;

  const toggleTerm = () => {
    setIsAgreed((prev) => !prev);
  };

  const onPay = async () => {
    if (!payment) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');

      return;
    }

    setIsLoading(true);

    try {
      const basePaymentParams = {
        method: paymentMethod,
        amount: {
          currency: 'KRW',
          value: study.amount,
        },
        orderId: study.tossOrderId,
        orderName: study.groupStudyTitle,
        successUrl:
          window.location.origin +
          `/payment/success?paymentId=${study.paymentId}&method=${paymentMethod}`,
        failUrl:
          window.location.origin +
          `/payment/fail?paymentId=${study.paymentId}&groupStudyId=${study.groupStudyId}`,
        customerName: memberName ?? undefined,
        customerMobilePhone: tel ?? undefined,
      };

      if (paymentMethod === 'CARD') {
        await payment.requestPayment({
          ...basePaymentParams,
          card: {
            useEscrow: false,
            flowMode: 'DEFAULT',
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      } else {
        await payment.requestPayment({
          ...basePaymentParams,
          virtualAccount: {
            cashReceipt: {
              type: '소득공제',
            },
            useEscrow: false,
          },
        });
      }
    } catch (error: unknown) {
      // 사용자가 결제창을 닫은 경우는 에러 메시지를 표시하지 않음
      if (
        error instanceof Error &&
        (error.message.includes('USER_CANCEL') ||
          error.message.includes('PAY_PROCESS_CANCELED'))
      ) {
        return;
      }

      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchPayment() {
      if (!clientKey) {
        console.error(
          'NEXT_PUBLIC_TOSS_CLIENT_KEY 환경변수가 설정되지 않았습니다.',
        );

        return;
      }

      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
        // customerKey 형식: 영문 대소문자, 숫자, 특수문자 -, _, =, ., @로 2자 이상 50자 이하
        // memberId를 안전한 형식으로 변환 (예: 기존 123 -> 변경 후 member-123)
        const customerKey = `member-${study.memberId}`.replace(
          /[^a-zA-Z0-9\-_=\.@]/g,
          '',
        );

        // Toss 에서 2자이상 50자이하 문자열을 요구함
        if (customerKey.length < 2 || customerKey.length > 50) {
          throw new Error(
            `customerKey가 유효하지 않습니다: ${customerKey} (길이: ${customerKey.length})`,
          );
        }
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
  }, [study.memberId]);

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

          <PaymentTermsModal />
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
              <label
                key={m.id}
                htmlFor={m.id}
                className={`rounded-100 font-designer-16b flex h-500 w-full cursor-pointer items-center justify-start border px-150 ${
                  selected
                    ? 'bg-fill-brand-default-default text-text-inverse'
                    : 'border-border-default hover:bg-fill-neutral-subtle-hover bg-fill-neutral-default-default'
                }`}
              >
                <RadioGroupItem value={m.id} id={m.id} size="large" />
                <span className="font-designer-16b ml-75">{m.label}</span>
              </label>
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
          {isLoading ? '결제 처리 중...' : '결제하기'}
        </Button>
      </div>
    </div>
  );
}
