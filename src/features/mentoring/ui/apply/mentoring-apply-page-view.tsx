import dayjs from 'dayjs';
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  Monitor,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import PageContainer from '@/components/ui/page-container';
import SurfacePanel from '@/components/ui/surface-panel';
import { type MentoringApplyControllerResult } from '@/features/mentoring/model/use-mentoring-apply-controller';
import MentoringRequestEditor from '@/features/mentoring/ui/apply/mentoring-request-editor';
import { formatWon, getMethodLabel } from '@/mocks/mentoring-mock-data';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';

interface MentoringApplyPageViewProps {
  mentor: MentorProfile;
  selectedMethod: MentoringMethodType;
  controller: MentoringApplyControllerResult;
}

const methodIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-20 w-20" />,
  simple: <Phone className="h-20 w-20" />,
  deep: <Monitor className="h-20 w-20" />,
  offline: <Users className="h-20 w-20" />,
};

const exampleQuestions = [
  '멘토링 목적이 무엇인가요?',
  '멘토링에 도움이 될 정보를 작성해 주세요. (재직중인 회사, 수료한 교육, 작업 내용 등)',
  '질문하고 싶은 내용을 작성해주세요.',
  '멘토에게 전하고 싶은 말',
];

export default function MentoringApplyPageView({
  mentor,
  selectedMethod,
  controller,
}: MentoringApplyPageViewProps) {
  const { state, actions, viewModel } = controller;

  return (
    <PageContainer spacing="content">
      <div className="mb-250">
        <Link
          href={`/mentoring/${mentor.id}`}
          className="font-designer-14r text-text-subtle hover:text-text-default inline-flex items-center gap-50"
        >
          <ChevronLeft className="h-16 w-16" />
          상세로 돌아가기
        </Link>
      </div>

      <h1 className="font-designer-28b text-text-strong mb-300">멘토링 신청</h1>

      <SurfacePanel radius="lg" className="mb-250 p-200">
        <div className="mb-125 flex items-start gap-125">
          <span className="bg-fill-brand-subtle-default text-text-brand rounded-100 inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center">
            {methodIconMap[selectedMethod]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-designer-18b text-text-default line-clamp-2 leading-snug">
              {mentor.headline}
            </p>
            <p className="font-designer-13r text-text-subtle mt-50 line-clamp-1">
              {mentor.nickname} · {mentor.role}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-75">
          <Badge color="blue" shape="round">
            {getMethodLabel(selectedMethod)}
          </Badge>
          <Badge color="gray" shape="round">
            {viewModel.selectedOption.durationLabel}
          </Badge>
          <Badge color="green" shape="round">
            {formatWon(viewModel.selectedOption.price)}
          </Badge>
        </div>
      </SurfacePanel>

      <div className="grid grid-cols-1 gap-300 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-250">
          {viewModel.needsSchedule && (
            <SurfacePanel radius="lg">
              <div className="border-border-subtle bg-background-alternative flex items-center gap-100 border-b px-200 py-150">
                <span className="font-designer-16b text-text-strong">
                  {viewModel.scheduleStepNumber}. 일정 선택
                </span>
                <span className="font-designer-18b text-text-brand">
                  {state.selectedDate
                    ? `${dayjs(state.selectedDate).format('YY.MM.DD')} ${state.selectedTime}`
                    : ''}
                </span>
              </div>

              <div className="p-200">
                <p className="font-designer-13r text-text-subtle mb-150">
                  1회 상담 시간은 {viewModel.selectedOption.durationLabel}이며,
                  신청일 기준 3일 뒤부터 선택할 수 있어요.
                </p>

                <div className="grid grid-cols-1 gap-200 md:grid-cols-[280px_1fr]">
                  <div>
                    <DatePicker
                      mode="single"
                      selected={state.selectedDate}
                      onSelect={actions.onDatePickerSelect}
                      placeholder="날짜를 선택해주세요"
                      disabled={viewModel.isDateDisabled}
                    />
                  </div>

                  <div className="flex flex-wrap gap-100">
                    {!state.selectedDate && (
                      <p className="font-designer-13r text-text-subtle w-full">
                        먼저 날짜를 선택해 주세요.
                      </p>
                    )}
                    {state.selectedDate &&
                      viewModel.availableTimeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => actions.onTimeSelect(timeSlot)}
                          className={cn(
                            'font-designer-14r rounded-100 border px-150 py-125 transition-colors',
                            state.selectedTime === timeSlot
                              ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                              : 'border-border-subtle bg-background-default text-text-default hover:border-border-brand',
                          )}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    {state.selectedDate &&
                      viewModel.availableTimeSlots.length === 0 && (
                        <p className="font-designer-13r text-text-subtle w-full">
                          선택한 날짜에 가능한 시간이 없습니다.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </SurfacePanel>
          )}

          <SurfacePanel radius="lg">
            <div className="border-border-subtle bg-background-alternative flex items-center gap-100 border-b px-200 py-150">
              <div className="flex items-center gap-75">
                <span className="font-designer-16b text-text-strong">
                  {viewModel.messageStepNumber}. 멘토에게 보낼 질문 작성
                </span>
                <span className="font-designer-16b text-text-brand">*</span>
              </div>
            </div>

            <div className="space-y-150 p-200">
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                블로그 에디터처럼 글자 크기/강조/목록/인용을 적용하고, 이미지와
                첨부파일, 링크를 한 화면에서 함께 작성할 수 있어요.
              </p>

              <div className="rounded-125 bg-background-alternative p-150">
                {exampleQuestions.map((question) => (
                  <p
                    key={question}
                    className="font-designer-13r text-text-subtle"
                  >
                    Q. {question}
                  </p>
                ))}
              </div>

              <MentoringRequestEditor
                value={state.requestContents}
                onChange={actions.onRequestContentsChange}
              />

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-designer-13r',
                    viewModel.isRequestTextTooShort
                      ? 'text-text-error'
                      : 'text-text-subtlest',
                  )}
                >
                  텍스트는 최소 10자 이상 입력해주세요.
                </span>
                <span className="font-designer-13r text-text-subtlest">
                  {viewModel.requestTextLength}자
                </span>
              </div>

              <p className="font-designer-13r text-text-subtle leading-relaxed">
                {viewModel.requiresAttachment
                  ? '쪽지/간편 상담은 이미지, 첨부파일, 링크 중 1개 이상 포함해주세요.'
                  : '필요한 자료가 있다면 이미지/첨부파일/링크를 함께 남겨주세요.'}
              </p>

              {viewModel.shouldShowAttachmentError && (
                <p className="font-designer-12r text-text-error">
                  이미지, 첨부파일, 링크 중 최소 1개를 포함해주세요.
                </p>
              )}
            </div>
          </SurfacePanel>

          <SurfacePanel radius="md" className="p-200">
            <div className="mb-150 flex items-center gap-75">
              <ShieldCheck className="text-text-success h-16 w-16" />
              <p className="font-designer-14b text-text-default">결제 안내</p>
            </div>
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              카드/가상계좌 결제는 결제 내역이 자동 반영되며, 수동결제는 입금
              확인 후 멘토가 신청을 수락할 수 있습니다. 환불은 시작 120시간
              전까지 전액, 120~24시간 전 30%, 24시간 내 환불 불가 기준을
              따릅니다.
            </p>
          </SurfacePanel>
        </div>

        <aside className="h-fit space-y-175 xl:sticky xl:top-[96px]">
          <SurfacePanel radius="lg" className="p-200">
            <div className="mb-125 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">
                신청자 정보
              </h2>
              <button
                type="button"
                className="font-designer-14b rounded-100 border-border-subtle text-text-default border px-100 py-50"
              >
                수정
              </button>
            </div>

            <div className="font-designer-14r text-text-subtle space-y-75">
              <p>
                이름{' '}
                <span className="text-text-default">
                  {viewModel.applicantName}
                </span>
              </p>
              <p>
                이메일 <span className="text-text-default">-</span>
              </p>
              <p>
                휴대폰 번호{' '}
                <span className="text-text-default">
                  {viewModel.applicantPhone}
                </span>
              </p>
            </div>
          </SurfacePanel>

          <section className="rounded-200 border-border-subtle bg-background-default border p-225">
            <div className="mb-150 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">결제/신청</h2>
              <Badge color="blue" shape="round">
                결제 API 미연동
              </Badge>
            </div>

            {viewModel.isRequestBlockedByOperation ? (
              <div className="rounded-100 border-border-subtle bg-background-accent-orange-subtle mb-150 border px-125 py-100">
                <p className="font-designer-13b text-text-default">
                  {viewModel.operationBlockedMessage}
                </p>
                <p className="font-designer-12r text-text-subtle mt-50">
                  사유: {viewModel.operationBlockedReason}
                </p>
              </div>
            ) : null}

            <div className="mb-150">
              <p className="font-designer-13r text-text-subtle mb-75">
                결제 방식
              </p>
              <div className="space-y-100">
                {viewModel.paymentMethodOptions.map((option) => {
                  const isSelected = state.selectedPaymentMethod === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => actions.onPaymentMethodSelect(option.id)}
                      className={cn(
                        'rounded-100 w-full border px-125 py-100 text-left transition-colors',
                        isSelected
                          ? 'border-border-brand bg-fill-brand-subtle-default'
                          : 'border-border-subtle bg-background-default hover:border-border-brand',
                      )}
                    >
                      <p className="font-designer-14b text-text-default">
                        {option.label}
                      </p>
                      <p className="font-designer-12r text-text-subtle mt-50">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-125 border-border-subtle bg-background-alternative mb-150 border p-125">
              <div className="mb-75 flex items-center justify-between gap-75">
                <p className="font-designer-14b text-text-default inline-flex items-center gap-50">
                  <Banknote className="h-14 w-14" />
                  {viewModel.selectedPaymentMethodCopy.title}
                </p>
                <Badge color="gray" shape="round">
                  {viewModel.needsPaymentMemo ? '멘토 확인' : '자동 반영'}
                </Badge>
              </div>
              <p className="font-designer-12r text-text-subtle">
                {viewModel.selectedPaymentMethodCopy.description}
              </p>
              <p className="font-designer-12r text-text-subtle mt-75 inline-flex items-center gap-50">
                <CheckCircle2 className="h-14 w-14" />
                {viewModel.selectedPaymentMethodCopy.helper}
              </p>
            </div>

            {viewModel.needsPaymentMemo && (
              <div className="mb-150">
                <p className="font-designer-13r text-text-subtle mb-75">
                  결제 메모 <span className="text-text-brand">*</span>
                </p>
                <p className="font-designer-12r text-text-subtle mb-75">
                  입금 예정 시각/송금자명/송금 채널을 남겨주세요.
                </p>
                <textarea
                  value={state.paymentMemo}
                  onChange={(event) =>
                    actions.onPaymentMemoChange(event.target.value)
                  }
                  className={cn(
                    'font-designer-13r rounded-100 bg-background-default border',
                    'text-text-default min-h-[112px] w-full resize-y px-125 py-100',
                    'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                    viewModel.shouldShowPaymentMemoError
                      ? 'border-border-error'
                      : 'border-border-subtle',
                  )}
                  placeholder="예: 21:30, 홍길동, 카카오뱅크"
                />
                {viewModel.shouldShowPaymentMemoError && (
                  <p className="font-designer-12r text-text-error mt-50">
                    수동결제 신청은 결제 메모를 2자 이상 입력해주세요.
                  </p>
                )}
              </div>
            )}

            <div className="rounded-100 border-border-subtle mb-150 border px-125 py-100">
              <div className="mb-75 flex items-center justify-between">
                <span className="font-designer-13r text-text-subtle">
                  상담 방식
                </span>
                <span className="font-designer-14b text-text-default">
                  {getMethodLabel(selectedMethod)}
                </span>
              </div>
              <div className="mb-75 flex items-center justify-between">
                <span className="font-designer-13r text-text-subtle">
                  상담 기본 금액
                </span>
                <span className="font-designer-16b text-text-default">
                  {formatWon(viewModel.selectedOption.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-designer-13r text-text-subtle">
                  실제 결제 진행
                </span>
                <span className="font-designer-16b text-text-default">
                  {viewModel.selectedPaymentMethodCopy.flowLabel}
                </span>
              </div>
            </div>

            <Button
              color="primary"
              size="large"
              className="w-full"
              onClick={actions.onSubmit}
              disabled={viewModel.isSubmitDisabled}
            >
              {viewModel.submitButtonLabel}
            </Button>
          </section>

          <section className="rounded-150 bg-background-alternative p-150">
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              선택한 결제 방식과 무관하게 환불 정책은 동일하게 적용됩니다.
              <br />
              일반 기준: 시작 120시간 전 전액, 120~24시간 전 30%, 24시간 내 환불
              불가
            </p>
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
