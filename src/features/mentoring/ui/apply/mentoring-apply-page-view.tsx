import dayjs from 'dayjs';
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  Monitor,
  Phone,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import DatePicker from '@/components/common/ui/date-picker';
import { BaseInput } from '@/components/common/ui/input';
import PageContainer from '@/components/common/ui/page-container';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  formatWon,
  getMentorDisplayTitle,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  MENTORING_CHANGE_AND_NO_SHOW_GUIDE,
  MENTORING_REFUND_POLICY_DETAIL,
  getMentoringApplyWritingGuide,
  getMentoringChannelGuide,
  getMentoringProgressCheckGuide,
  getMentoringResponseGuide,
} from '@/features/mentoring/model/mentoring-flow-policy';
import { type MentoringApplyControllerResult } from '@/features/mentoring/model/use-mentoring-apply-controller';
import MentoringRequestEditor from '@/features/mentoring/ui/apply/mentoring-request-editor';
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
export default function MentoringApplyPageView({
  mentor,
  selectedMethod,
  controller,
}: MentoringApplyPageViewProps) {
  const { state, actions, viewModel } = controller;
  const mentorDisplayTitle = getMentorDisplayTitle(mentor);
  const responseGuide = getMentoringResponseGuide(selectedMethod);
  const channelGuide = getMentoringChannelGuide(selectedMethod);
  const progressGuide = getMentoringProgressCheckGuide(selectedMethod);
  const writingGuideItems = getMentoringApplyWritingGuide(selectedMethod);
  const responseSummary =
    selectedMethod === 'note'
      ? '멘토 첫 답장 시 시작'
      : '보통 24시간 안에 확인';
  const applySummaryItems = [
    {
      label: selectedMethod === 'note' ? '시작 기준' : '확인 기준',
      value: responseGuide,
    },
    { label: '진행 채널', value: channelGuide },
    { label: '진행 확인', value: progressGuide },
  ];
  const acceptancePolicy =
    selectedMethod === 'note'
      ? {
          title: '쪽지상담 수락 정책',
          description:
            '결제 완료 후 멘토의 첫 답장이 수락으로 처리됩니다. 쪽지상담 1회에는 최초 질문과 멘토 답변 1회만 포함되며, 추가 질문은 새 쪽지상담 결제가 필요합니다.',
        }
      : {
          title: '예약형 상담 수락 정책',
          description:
            '결제 후 멘토가 48시간 내 수락/거절을 결정합니다. 48시간 내 응답이 없으면 자동 거절되며, 멘토는 거절 사유를 남길 수 있습니다.',
        };
  const selectedScheduleSummary = viewModel.needsSchedule
    ? state.selectedDate
      ? state.selectedTime
        ? `${dayjs(state.selectedDate).format('YYYY.MM.DD')} ${state.selectedTime}`
        : `${dayjs(state.selectedDate).format('YYYY.MM.DD')} · 시간 선택 전`
      : '날짜/시간 선택 전'
    : '질문 접수 후 멘토 답장을 기다리는 방식';
  const requestChecklist = [
    ...(viewModel.requiresRequestTitle
      ? [
          {
            label: '요청 제목 2자 이상',
            done: !viewModel.isRequestTitleTooShort,
          },
        ]
      : []),
    {
      label: viewModel.needsSchedule ? '희망 일정 선택' : '상담 방식 확인',
      done: viewModel.needsSchedule
        ? state.selectedDate !== undefined && state.selectedTime !== ''
        : true,
    },
    { label: '요청서 10자 이상', done: viewModel.requestTextLength >= 10 },
    {
      label:
        selectedMethod === 'note' ? '자료 또는 링크 포함' : '자료 첨부는 선택',
      done: viewModel.isAttachmentReady,
    },
    {
      label: viewModel.needsPaymentMemo ? '결제 메모' : '결제 방식 확인',
      done: viewModel.isPaymentMemoReady,
    },
  ];
  const remainingChecklist = requestChecklist.filter((item) => !item.done);

  return (
    <PageContainer spacing="content">
      {' '}
      <div className="mb-200">
        {' '}
        <Link
          href={`/mentoring/${mentor.id}`}
          className="hover:text-text-default inline-flex items-center gap-50 transition-colors font-designer-13r text-text-subtle"
        >
          {' '}
          <ChevronLeft className="h-16 w-16" /> 상세로 돌아가기{' '}
        </Link>{' '}
      </div>{' '}
      <h1 className="mb-250 font-designer-28b text-text-strong">
        {' '}
        멘토링 신청{' '}
      </h1>{' '}
      <SurfacePanel radius="lg" className="mb-250 p-250">
        {' '}
        <div className="flex items-start gap-150">
          {' '}
          <span className="bg-fill-brand-subtle-default text-text-brand inline-flex h-40 w-40 items-center justify-center rounded-125">
            {' '}
            {methodIconMap[selectedMethod]}{' '}
          </span>{' '}
          <div className="min-w-0">
            {' '}
            <p className="mb-25 font-designer-18b text-text-default">
              {' '}
              {mentorDisplayTitle}{' '}
            </p>{' '}
            <p className="leading-relaxed font-designer-13r text-text-subtle">
              {' '}
              {mentor.nickname} · {mentor.role}{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <p className="mt-150 font-designer-13r text-text-subtle">
          {' '}
          {getMethodLabel(selectedMethod)} · {viewModel.selectedOption.durationLabel}
          <span className="ml-75 font-designer-13m text-text-default">
            {formatWon(viewModel.selectedOption.price)}
          </span>
        </p>{' '}
      </SurfacePanel>{' '}
      <div className="grid grid-cols-1 gap-300 xl:grid-cols-[minmax(0,1fr)_360px]">
        {' '}
        <div className="flex min-w-0 flex-col gap-300">
          {' '}
          {viewModel.needsSchedule && (
            <SurfacePanel radius="lg" className="p-250">
              {' '}
              <div className="mb-150 flex items-start justify-between gap-100">
                {' '}
                <span className="font-designer-16b text-text-strong">
                  {' '}
                  {viewModel.scheduleStepNumber}. 일정 선택{' '}
                </span>{' '}
                <span className="font-designer-16b text-text-brand">
                  {' '}
                  {state.selectedDate
                    ? `${dayjs(state.selectedDate).format('YY.MM.DD')} ${state.selectedTime}`
                    : ''}{' '}
                </span>{' '}
              </div>{' '}
              <div className="flex flex-col gap-200">
                {' '}
                <p className="leading-relaxed font-designer-13r text-text-subtle">
                  {' '}
                  상담 시간은 {viewModel.selectedOption.durationLabel}이며,
                  날짜는 신청일 기준 3일 뒤부터 선택할 수 있어요. 멘토가 열어둔
                  시간 중 이미 예약된 시간은 자동으로 제외돼요.{' '}
                </p>{' '}
                {selectedMethod === 'offline' ? (
                  <p className="mt-50 font-designer-12r text-text-subtle">
                    {' '}
                    대면상담은 희망 지역이나 이동 제약도 요청서에 함께 적어두는
                    편이 안전합니다.{' '}
                  </p>
                ) : null}{' '}
                <div className="grid gap-150 lg:grid-cols-2">
                  {' '}
                  <div>
                    {' '}
                    <DatePicker
                      mode="single"
                      selected={state.selectedDate}
                      onSelect={actions.onDatePickerSelect}
                      placeholder="날짜를 선택해주세요"
                      disabled={viewModel.isDateDisabled}
                    />{' '}
                  </div>{' '}
                  <div className="rounded-125 bg-background-alternative flex min-h-[220px] flex-col gap-75 p-150">
                    {' '}
                    {!state.selectedDate && (
                      <p className="py-100 font-designer-13r text-text-subtle">
                        {' '}
                        먼저 날짜를 선택해 주세요.{' '}
                      </p>
                    )}{' '}
                    {state.selectedDate && viewModel.isAvailabilityLoading && (
                      <p className="py-100 font-designer-13r text-text-subtle">
                        {' '}
                        {viewModel.availabilityStatusMessage}{' '}
                      </p>
                    )}{' '}
                    {state.selectedDate &&
                      !viewModel.isAvailabilityLoading &&
                      viewModel.availableTimeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => actions.onTimeSelect(timeSlot)}
                          className={cn(
                            'rounded-100 border px-150 py-125 text-left transition-colors font-designer-13r',
                            state.selectedTime === timeSlot
                              ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                              : 'border-border-subtle bg-background-default hover:border-border-default hover:bg-background-alternative',
                          )}
                        >
                          {' '}
                          {timeSlot}{' '}
                        </button>
                      ))}{' '}
                    {state.selectedDate &&
                      !viewModel.isAvailabilityLoading &&
                      viewModel.availableTimeSlots.length === 0 && (
                        <p className="py-100 font-designer-13r text-text-subtle">
                          {' '}
                          {viewModel.availabilityStatusMessage ??
                            '선택한 날짜에 가능한 시간이 없습니다.'}{' '}
                        </p>
                      )}{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </SurfacePanel>
          )}{' '}
          <SurfacePanel radius="lg" className="p-250">
            {' '}
            <div className="mb-150 flex items-start justify-between gap-100">
              {' '}
              <div className="flex items-center gap-50">
                {' '}
                <span className="font-designer-16b text-text-strong">
                  {' '}
                  {viewModel.messageStepNumber}. 상담 요청서 작성{' '}
                </span>{' '}
                <span className="font-designer-16b text-text-brand">
                  *
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex flex-col gap-150">
              {' '}
              <div className="rounded-125 bg-background-alternative p-150">
                {' '}
                <p className="mb-100 font-designer-13m text-text-default">
                  {' '}
                  요청서에 이런 내용을 적어주세요{' '}
                </p>{' '}
                <div className="flex flex-col gap-75">
                  {' '}
                  {writingGuideItems.map((item, index) => (
                    <div key={item} className="flex items-start gap-75">
                      {' '}
                      <span className="bg-fill-brand-subtle-default inline-flex h-18 w-18 shrink-0 items-center justify-center rounded-full font-designer-12m text-text-brand">
                        {' '}
                        {index + 1}{' '}
                      </span>{' '}
                      <p className="leading-relaxed font-designer-13r text-text-subtle">
                        {' '}
                        {item}{' '}
                      </p>{' '}
                    </div>
                  ))}{' '}
                </div>{' '}
              </div>{' '}
              {viewModel.requiresRequestTitle ? (
                <div className="flex flex-col gap-75">
                  <p className="font-designer-13m text-text-default">요청 제목</p>
                  <BaseInput
                    value={state.requestTitle}
                    onValueChange={actions.onRequestTitleChange}
                    placeholder="예) 포트폴리오 방향성 피드백 요청"
                    maxLength={60}
                    hideMeta={false}
                    guideText="멘토가 상담 목적을 빠르게 파악할 수 있게 제목을 적어주세요."
                  />
                  {viewModel.shouldShowRequestTitleError ? (
                    <p className="font-designer-12r text-text-error">
                      제목은 2자 이상 입력해주세요.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <MentoringRequestEditor
                method={selectedMethod}
                value={state.requestContents}
                onChange={actions.onRequestContentsChange}
              />{' '}
              <div className="flex items-center justify-between">
                {' '}
                <span
                  className={cn(
                    'font-designer-13r',
                    viewModel.isRequestTextTooShort
                      ? 'text-text-error'
                      : 'text-text-subtlest',
                  )}
                >
                  {' '}
                  텍스트 10자 이상{' '}
                </span>{' '}
                <span className="font-designer-13r text-text-subtlest">
                  {' '}
                  {viewModel.requestTextLength}자{' '}
                </span>{' '}
              </div>{' '}
              <p className="leading-relaxed font-designer-13r text-text-subtle">
                {' '}
                {viewModel.requiresAttachment
                  ? '쪽지/간편 상담은 이미지, 파일, 링크 중 1개 이상 필요합니다.'
                  : '필요한 자료가 있으면 이미지, 파일, 링크를 함께 남겨주세요.'}{' '}
              </p>{' '}
              {viewModel.shouldShowAttachmentError && (
                <p className="font-designer-12r text-text-error">
                  {' '}
                  이미지, 첨부파일, 링크 중 최소 1개를 포함해주세요.{' '}
                </p>
              )}{' '}
            </div>{' '}
          </SurfacePanel>{' '}
          <SurfacePanel radius="lg" className="p-250">
            {' '}
            <div className="mb-150 flex items-start justify-between gap-100">
              {' '}
              <span className="font-designer-16b text-text-strong">
                {' '}
                {viewModel.messageStepNumber + 1}. 결제 방식 선택{' '}
              </span>{' '}
            </div>{' '}
            <div className="flex flex-col gap-200">
              {' '}
              <div>
                {' '}
                <p className="mb-75 font-designer-13m text-text-subtle">
                  {' '}
                  결제 방식{' '}
                </p>{' '}
                <div className="grid gap-100 md:grid-cols-2">
                  {' '}
                  {viewModel.paymentMethodOptions.map((option) => {
                    const isSelected =
                      state.selectedPaymentMethod === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => actions.onPaymentMethodSelect(option.id)}
                        className={cn(
                          'rounded-125 border p-150 text-left transition-colors',
                          isSelected
                            ? 'border-border-brand bg-fill-brand-subtle-default'
                            : 'border-border-subtle bg-background-default hover:border-border-default hover:bg-background-alternative',
                        )}
                      >
                        {' '}
                        <p className="font-designer-13m text-text-default">
                          {' '}
                          {option.label}{' '}
                        </p>{' '}
                        <p className="mt-50 leading-relaxed font-designer-13r text-text-subtle">
                          {' '}
                          {option.description}{' '}
                        </p>{' '}
                      </button>
                    );
                  })}{' '}
                </div>{' '}
              </div>{' '}
              <div className="rounded-125 bg-background-alternative p-150">
                {' '}
                <div className="mb-100 flex items-center justify-between gap-100">
                  {' '}
                  <p className="inline-flex items-center gap-50 font-designer-13m text-text-default">
                    {' '}
                    <Banknote className="h-14 w-14" />{' '}
                    {viewModel.selectedPaymentMethodCopy.title}{' '}
                  </p>{' '}
                  <Badge color="gray" shape="round">
                    {' '}
                    {viewModel.needsPaymentMemo
                      ? '멘토 확인'
                      : '자동 반영'}{' '}
                  </Badge>{' '}
                </div>{' '}
                <p className="mb-75 leading-relaxed font-designer-13r text-text-subtle">
                  {' '}
                  {viewModel.selectedPaymentMethodCopy.description}{' '}
                </p>{' '}
                <p className="inline-flex items-start gap-50 leading-relaxed font-designer-13r text-text-subtle">
                  {' '}
                  <CheckCircle2 className="h-14 w-14" />{' '}
                  {viewModel.selectedPaymentMethodCopy.helper}{' '}
                </p>{' '}
              </div>{' '}
              {viewModel.needsPaymentMemo && (
                <div>
                  {' '}
                  <p className="mb-75 font-designer-13m text-text-subtle">
                    {' '}
                    결제 메모 <span className="text-text-brand">*</span>{' '}
                  </p>{' '}
                  <p className="mb-75 leading-relaxed font-designer-13r text-text-subtle">
                    {' '}
                    입금 시각, 송금자명, 채널을 남겨주세요.{' '}
                  </p>{' '}
                  <textarea
                    value={state.paymentMemo}
                    onChange={(event) =>
                      actions.onPaymentMemoChange(event.target.value)
                    }
                    className={cn(
                      'rounded-125 min-h-[84px] w-full resize-none border px-150 py-125 transition-colors font-designer-13r text-text-default',
                      viewModel.shouldShowPaymentMemoError
                        ? 'border-border-error bg-background-accent-red-subtle'
                        : 'border-border-subtle bg-background-default',
                    )}
                    placeholder="예: 21:30, 홍길동, 카카오뱅크"
                  />{' '}
                  {viewModel.shouldShowPaymentMemoError && (
                    <p className="mt-50 font-designer-12r text-text-error">
                      {' '}
                      수동결제 신청은 결제 메모를 2자 이상 입력해주세요.{' '}
                    </p>
                  )}{' '}
                </div>
              )}{' '}
            </div>{' '}
          </SurfacePanel>{' '}
        </div>{' '}
        <aside className="h-fit xl:sticky xl:top-[96px]">
          {' '}
          <SurfacePanel radius="lg" className="p-200">
            {' '}
            <div className="mb-125 flex items-center justify-between">
              {' '}
              <h2 className="font-designer-16b text-text-strong">신청 확인</h2>{' '}
              <Link href="/my-page">
                {' '}
                <Button color="outlined" size="small">
                  {' '}
                  정보 수정{' '}
                </Button>{' '}
              </Link>{' '}
            </div>{' '}
            <div className="rounded-125 border-border-subtle bg-background-alternative space-y-100 border p-150">
              {' '}
              <SummaryRow label="신청자" value={viewModel.applicantName} />{' '}
              <SummaryRow
                label="연락처"
                value={
                  viewModel.applicantPhone === '-'
                    ? '등록된 번호 없음'
                    : viewModel.applicantPhone
                }
              />{' '}
              <SummaryRow
                label={viewModel.needsSchedule ? '희망 일정' : '진행 방식'}
                value={selectedScheduleSummary}
                multiline
              />{' '}
            </div>{' '}
            <div className="rounded-125 border-border-subtle mt-150 border p-150">
              {' '}
              <div className="mb-100 flex items-center justify-between">
                {' '}
                <h3 className="font-designer-16b text-text-strong">
                  {' '}
                  결제 요약{' '}
                </h3>{' '}
                <Badge color="green" shape="round">
                  {' '}
                  안전 결제{' '}
                </Badge>{' '}
              </div>{' '}
              <div className="space-y-100">
                {' '}
                <SummaryRow
                  label="상담 방식"
                  value={getMethodLabel(selectedMethod)}
                />{' '}
                <SummaryRow
                  label="기본 금액"
                  value={formatWon(viewModel.selectedOption.price)}
                  strong
                />{' '}
                <SummaryRow
                  label="결제 진행"
                  value={viewModel.selectedPaymentMethodCopy.flowLabel}
                />{' '}
                <SummaryRow
                  label={selectedMethod === 'note' ? '시작 기준' : '확인 기준'}
                  value={responseSummary}
                />{' '}
              </div>{' '}
            </div>{' '}
            <div className="rounded-125 bg-background-alternative mt-150 p-150">
              {' '}
              <p className="mb-75 font-designer-13m text-text-default">
                {' '}
                진행 요약{' '}
              </p>{' '}
              <div className="space-y-100">
                {' '}
                {applySummaryItems.map((item) => (
                  <div key={item.label}>
                    {' '}
                    <p className="mb-25 font-designer-13m text-text-subtle">
                      {' '}
                      {item.label}{' '}
                    </p>{' '}
                    <p className="leading-relaxed font-designer-13r text-text-subtle">
                      {' '}
                      {item.value}{' '}
                    </p>{' '}
                  </div>
                ))}{' '}
              </div>{' '}
            </div>{' '}
            <div className="rounded-125 border-border-subtle mt-150 border p-150">
              {' '}
              <p className="mb-100 font-designer-13m text-text-default">
                {' '}
                신청 전에 확인할 내용{' '}
              </p>{' '}
              <div className="space-y-100">
                {' '}
                <div>
                  {' '}
                  <p className="mb-25 font-designer-13m text-text-subtle">
                    {' '}
                    {acceptancePolicy.title}{' '}
                  </p>{' '}
                  <p className="leading-relaxed font-designer-13r text-text-subtle">
                    {' '}
                    {acceptancePolicy.description}{' '}
                  </p>{' '}
                </div>{' '}
                <div>
                  {' '}
                  <p className="mb-25 font-designer-13m text-text-subtle">
                    {' '}
                    환불 및 변경 안내{' '}
                  </p>{' '}
                  <p className="leading-relaxed font-designer-13r text-text-subtle">
                    {' '}
                    {MENTORING_REFUND_POLICY_DETAIL}.{' '}
                    {MENTORING_CHANGE_AND_NO_SHOW_GUIDE}{' '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            {viewModel.isRequestBlockedByOperation ? (
              <div className="rounded-100 border-border-subtle bg-background-accent-orange-subtle mt-150 border px-125 py-100">
                {' '}
                <p className="font-designer-13m text-text-default">
                  {' '}
                  {viewModel.operationBlockedMessage}{' '}
                </p>{' '}
                <p className="mt-50 font-designer-12r text-text-subtle">
                  {' '}
                  사유: {viewModel.operationBlockedReason}{' '}
                </p>{' '}
              </div>
            ) : null}{' '}
            {remainingChecklist.length > 0 ? (
              <div className="rounded-125 border-border-subtle mt-150 border p-125">
                {' '}
                <p className="mb-75 font-designer-13m text-text-default">
                  {' '}
                  제출 전 체크{' '}
                </p>{' '}
                <div className="space-y-75">
                  {' '}
                  {remainingChecklist.map((item) => (
                    <ApplyChecklistItem
                      key={item.label}
                      label={item.label}
                      done={item.done}
                    />
                  ))}{' '}
                </div>{' '}
              </div>
            ) : (
              <div className="rounded-125 bg-fill-success-subtle-default mt-150 px-125 py-100">
                {' '}
                <p className="font-designer-13m text-text-default">
                  {' '}
                  신청 준비가 끝났습니다.{' '}
                </p>{' '}
                <p className="mt-25 font-designer-12r text-text-subtle">
                  {' '}
                  {progressGuide}{' '}
                </p>{' '}
              </div>
            )}{' '}
            <div className="mt-150">
              {' '}
              <Button
                color="primary"
                size="large"
                className="w-full"
                onClick={actions.onSubmit}
                disabled={viewModel.isSubmitDisabled}
              >
                {' '}
                {viewModel.submitButtonLabel}{' '}
              </Button>{' '}
              {viewModel.isSubmitDisabled &&
              !viewModel.isRequestBlockedByOperation ? (
                <p className="mt-75 leading-relaxed font-designer-12r text-text-subtle">
                  {' '}
                  필수 항목을 채우면 신청할 수 있어요.{' '}
                </p>
              ) : null}{' '}
            </div>{' '}
          </SurfacePanel>{' '}
        </aside>{' '}
      </div>{' '}
    </PageContainer>
  );
}
function SummaryRow({
  label,
  value,
  multiline = false,
  strong = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-100">
      {' '}
      <span className="shrink-0 font-designer-13m text-text-subtle">
        {' '}
        {label}{' '}
      </span>{' '}
      <span
        className={cn(
          'text-right text-text-default',
          multiline ? 'leading-relaxed font-designer-13r' : 'font-designer-13r',
          strong ? 'font-designer-16b' : '',
        )}
      >
        {' '}
        {value}{' '}
      </span>{' '}
    </div>
  );
}
function ApplyChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-75">
      {' '}
      <span
        className={cn(
          'inline-flex h-18 w-18 shrink-0 items-center justify-center rounded-full border',
          done
            ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
            : 'border-border-subtle bg-background-default text-text-subtlest',
        )}
      >
        {' '}
        <CheckCircle2 className="h-150 w-150" />{' '}
      </span>{' '}
      <span
        className={cn(
          'font-designer-13r',
          done ? 'text-text-default' : 'text-text-subtle',
        )}
      >
        {' '}
        {label}{' '}
      </span>{' '}
    </div>
  );
}
