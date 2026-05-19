'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { TossPaymentsPayment } from '@tosspayments/tosspayments-sdk';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/useUserStore';
import type {
  CoursePaymentPrepareResponse,
  CoursePlanCode,
  CoursePlanResponse,
} from '@/types/api/course.types';
import { AmountSection } from './amount-section';
import { BuyerInfoSection } from './buyer-info-section';
import { CourseSummarySection } from './course-summary-section';
import { PaymentExitConfirmModal } from './payment-exit-confirm-modal';
import { TosSection } from './tos-section';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';
const CUSTOMER_KEY_SANITIZE_RE = /[^a-zA-Z0-9\-_=.@]/g;

const checkoutFormSchema = z.object({
  buyerName: z.string().min(1, '이름을 입력해주세요.'),
  buyerEmail: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  buyerPhone: z.string().min(10, '올바른 휴대폰 번호를 입력해주세요.'),
  tosAgreed: z.literal(true, { message: '이용약관에 동의해주세요.' }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type PaymentMethod = 'CARD' | 'VIRTUAL_ACCOUNT';

interface NavigationGuardHandlers {
  popState: () => void;
  beforeUnload: (_e: BeforeUnloadEvent) => void;
}

interface VibeIntroCheckoutFormProps {
  plan: CoursePlanResponse;
  paymentData: CoursePaymentPrepareResponse;
  planCode: CoursePlanCode;
  onChangePlan: () => void;
  thumbnailUrl: string | null;
}

export function VibeIntroCheckoutForm({
  plan,
  paymentData,
  planCode,
  onChangePlan,
  thumbnailUrl,
}: VibeIntroCheckoutFormProps) {
  const { memberId, memberName, tel } = useUserStore();
  const showToast = useToastStore((s) => s.showToast);

  const [paymentMethod, setPaymentMethod] = useState('CARD' as PaymentMethod);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const paymentRef = useRef(null as TossPaymentsPayment | null);
  const navigationGuardRef = useRef(null as NavigationGuardHandlers | null);

  const methods: UseFormReturn<CheckoutFormValues> = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      buyerName: memberName ?? '',
      buyerEmail: '',
      buyerPhone: tel ?? '',
    },
  });

  useEffect(() => {
    if (!clientKey || !memberId) return;

    const customerKey = `member-${memberId}`.replace(
      CUSTOMER_KEY_SANITIZE_RE,
      '',
    );
    if (customerKey.length < 2 || customerKey.length > 50) return;

    loadTossPayments(clientKey)
      .then((toss) => {
        paymentRef.current = toss.payment({ customerKey });
      })
      .catch(() => {
        showToast('결제 모듈 초기화에 실패했습니다.', 'error');
      });
  }, [memberId, showToast]);

  // Navigation guard — intercepts browser back button
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      setShowExitModal(true);
      window.history.pushState(null, '', window.location.href);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    navigationGuardRef.current = {
      popState: handlePopState,
      beforeUnload: handleBeforeUnload,
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handlePay = methods.handleSubmit(
    async (values) => {
      if (!paymentMethod) {
        showToast('결제 수단을 선택해주세요.', 'error');
        return;
      }
      if (!isPhoneVerified) {
        showToast('휴대폰 인증을 완료해주세요.', 'error');
        return;
      }
      if (!paymentRef.current) {
        showToast(
          '결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
          'error',
        );
        return;
      }

      setIsLoading(true);
      setPaymentFailed(false);
      setPaymentErrorMsg(null);

      try {
        const baseParams = {
          amount: { currency: 'KRW' as const, value: paymentData.amount },
          orderId: paymentData.tossOrderId,
          orderName: paymentData.orderName,
          successUrl:
            `${window.location.origin}/class/vibe-intro/payment/success` +
            `?paymentId=${paymentData.paymentId}&method=${paymentMethod}`,
          failUrl: `${window.location.origin}/class/vibe-intro/payment?planCode=${planCode}`,
          customerName: values.buyerName,
          customerMobilePhone: values.buyerPhone,
        };

        if (paymentMethod === 'CARD') {
          await paymentRef.current.requestPayment({
            method: 'CARD',
            ...baseParams,
            card: {
              useEscrow: false,
              flowMode: 'DEFAULT',
              useCardPoint: false,
              useAppCardOnly: false,
            },
          });
        } else {
          await paymentRef.current.requestPayment({
            method: 'VIRTUAL_ACCOUNT',
            ...baseParams,
            virtualAccount: {
              cashReceipt: { type: '소득공제' },
              useEscrow: false,
            },
          });
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : '';

        if (
          msg.includes('USER_CANCEL') ||
          msg.includes('PAY_PROCESS_CANCELED')
        ) {
          showToast('결제가 취소되었습니다.', 'error');
          return;
        }

        if (
          error instanceof TypeError ||
          msg.toLowerCase().includes('network')
        ) {
          showToast('네트워크가 불안정해요. 다시 시도해주세요.', 'error');
        } else {
          setPaymentFailed(true);
          setPaymentErrorMsg(
            '카드에서 결제를 거절했어요. 다른 카드로 시도하시거나 카드사에 문의해주세요.',
          );
          showToast('결제에 실패했어요. 다시 시도해주세요.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    (errors) => {
      if (errors.tosAgreed) {
        showToast('이용약관에 동의해주세요.', 'error');
      }
    },
  );

  const handleContinuePayment = () => setShowExitModal(false);

  const handleExitPayment = () => {
    if (navigationGuardRef.current) {
      window.removeEventListener(
        'popstate',
        navigationGuardRef.current.popState,
      );
      window.removeEventListener(
        'beforeunload',
        navigationGuardRef.current.beforeUnload,
      );
    }
    window.location.href = '/class/vibe-intro/home';
  };

  const canPay = !isLoading;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handlePay}
        className="mx-auto flex w-full max-w-9175 flex-col gap-300 px-600 pb-1000 pt-500"
      >
        <CourseSummarySection
          plan={plan}
          onChangePlan={onChangePlan}
          thumbnailUrl={thumbnailUrl}
        />

        <BuyerInfoSection onVerified={setIsPhoneVerified} />

        {/* 결제 수단 */}
        <div className="rounded-200 border border-gray-300 bg-background-default px-500 py-400">
          <h2 className="mb-300 font-designer-18b text-gray-800">결제 수단</h2>
          <div className="flex flex-col gap-150">
            {/* CARD — enabled */}
            <label className="flex cursor-pointer items-center gap-200">
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={paymentMethod === 'CARD'}
                onChange={() => setPaymentMethod('CARD')}
                className="accent-background-brand-default"
              />
              <span className="font-designer-16m text-gray-800">
                신용카드 결제
              </span>
            </label>

            {paymentFailed && paymentErrorMsg && paymentMethod === 'CARD' && (
              <p className="font-designer-12r text-text-error">
                {paymentErrorMsg}
              </p>
            )}

            <label className="flex cursor-pointer items-center gap-200">
              <input
                type="radio"
                name="paymentMethod"
                value="VIRTUAL_ACCOUNT"
                checked={paymentMethod === 'VIRTUAL_ACCOUNT'}
                onChange={() => setPaymentMethod('VIRTUAL_ACCOUNT')}
                className="accent-background-brand-default"
              />
              <span className="font-designer-16m text-gray-800">
                무통장 입금 (가상계좌)
              </span>
            </label>
          </div>
        </div>

        <AmountSection plan={plan} />

        <TosSection />

        <button
          type="submit"
          disabled={!canPay}
          className="flex h-700 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-18b text-gray-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading
            ? '결제 처리 중...'
            : paymentFailed
              ? '다시 결제하기'
              : `${plan.discountPrice.toLocaleString()}원 결제하기`}
        </button>
      </form>

      <PaymentExitConfirmModal
        open={showExitModal}
        onContinue={handleContinuePayment}
        onExit={handleExitPayment}
      />
    </FormProvider>
  );
}
