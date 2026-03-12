'use client';
import dayjs from 'dayjs';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import UserAvatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { MENTORING_REQUEST_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import { MENTORING_NOTE_LABEL } from '@/features/mentoring/model/my-mentoring-display-meta';
import { getConversationWithFallback } from '@/features/mentoring/model/note-consultation-message';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  NoteConsultationFiltersProps,
  NoteConsultationGridProps,
  NoteConsultationListProps,
} from '@/types/mentoring/note-consultation-composite-view';
import type { NoteConsultationStatusFilter } from '@/types/mentoring/note-consultation-controller-view';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';
const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);
const getMentoringDetailRows = (request: MentoringRequest) => {
  return [
    {
      term: '상담 상태',
      value: `${MENTORING_REQUEST_STATUS_META[request.status].label}`,
    },
    {
      term: '요청 일시',
      value: dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm'),
    },
    {
      term: '결제 방식',
      value:
        request.paymentMode === 'MANUAL_TRANSFER'
          ? '수동 계좌이체'
          : request.paymentMode === 'TOSS_PAYMENTS'
            ? '토스페이먼츠'
            : '무료 문의',
    },
    {
      term: '입금 상태',
      value:
        request.paymentMode === 'MANUAL_TRANSFER'
          ? request.paymentStatus === 'CONFIRMED'
            ? '입금 완료'
            : '입금 확인 대기'
          : '-',
    },
  ];
};
const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  return dayjs(value).format('YYYY.MM.DD HH:mm');
};
const NOTE_STATUS_TAB_DESCRIPTION_MAP: Partial<
  Record<NoteConsultationStatusFilter, string>
> = {
  'mentor-requested': '새 신청을 확인하고 수락 또는 거절을 결정합니다.',
  'mentor-drafting': '수락한 상담의 첫 답변을 작성하는 단계입니다.',
  'mentor-completed': '답변 완료와 거절된 신청을 함께 확인합니다.',
  'mentee-pending': '멘토 승인과 첫 답변을 기다리는 단계입니다.',
  'mentee-answered': '멘토 답변을 확인하고 후속 질문을 이어갈 수 있습니다.',
  'mentee-completed': '처리가 끝난 상담 내역을 모아 확인합니다.',
};
interface BoardAnswer {
  id: string;
  content: string;
  createdAt: string;
}
interface BoardQuestionEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  answers: BoardAnswer[];
}
const getQuestionTitle = (content: string, questionOrder: number) => {
  const firstLine =
    content
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) || `질문 ${questionOrder}`;
  if (firstLine.length <= 42) {
    return firstLine;
  }

  return `${firstLine.slice(0, 42)}...`;
};

const getRequestTitle = (
  request: Pick<MentoringRequest, 'requestTitle' | 'requestMessage'>,
  fallback: string,
) => {
  const explicitTitle = request.requestTitle?.trim();
  if (explicitTitle && explicitTitle.length > 0) {
    return explicitTitle;
  }
  const firstLine = request.requestMessage
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstLine || fallback;
};

const buildQuestionBoard = (
  request: MentoringRequest,
): BoardQuestionEntry[] => {
  const messages = getConversationWithFallback(request).filter((message) => {
    return message.sender !== 'SYSTEM';
  });
  const board: BoardQuestionEntry[] = [];
  let activeQuestion: BoardQuestionEntry | null = null;
  messages.forEach((message) => {
    if (message.sender === 'MENTEE') {
      const nextQuestionOrder = board.length + 1;
      const defaultTitle = getQuestionTitle(message.content, nextQuestionOrder);
      const question: BoardQuestionEntry = {
        id: `${request.id}-question-${message.id}`,
        title:
          nextQuestionOrder === 1
            ? getRequestTitle(request, defaultTitle)
            : defaultTitle,
        content: message.content.trim() || '질문 본문이 비어 있습니다.',
        createdAt: message.createdAt,
        answers: [],
      };
      board.push(question);
      activeQuestion = question;

      return;
    }
    if (!activeQuestion) {
      const fallbackQuestion: BoardQuestionEntry = {
        id: `${request.id}-question-fallback`,
        title: getRequestTitle(request, '질문 1'),
        content: request.requestMessage.trim() || '질문 본문이 비어 있습니다.',
        createdAt: request.requestedAt,
        answers: [],
      };
      board.push(fallbackQuestion);
      activeQuestion = fallbackQuestion;
    }
    activeQuestion.answers.push({
      id: message.id,
      content: message.content.trim() || '답변 본문이 비어 있습니다.',
      createdAt: message.createdAt,
    });
  });
  if (board.length === 0) {
    board.push({
      id: `${request.id}-question-initial`,
      title: getRequestTitle(request, '질문 1'),
      content: request.requestMessage.trim() || '질문 본문이 비어 있습니다.',
      createdAt: request.requestedAt,
      answers: [],
    });
  }

  return board;
};
function ParticipantProfileAvatar({
  name,
  imageUrl,
  memberId,
  size = 44,
}: {
  name: string;
  imageUrl?: string;
  memberId?: number;
  size?: number;
}) {
  const avatar = (
    <UserAvatar
      image={imageUrl}
      alt={`${name} 프로필 이미지`}
      size={size}
      className="shrink-0"
    />
  );
  if (!memberId) {
    return avatar;
  }

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {' '}
      <UserProfileModal
        memberId={memberId}
        trigger={
          <span className="ring-border-subtle hover:ring-fill-brand-default-default inline-flex rounded-full ring-1 ring-transparent ring-inset transition-shadow">
            {avatar}
          </span>
        }
      />{' '}
    </div>
  );
}
function RequestListCard({
  item,
  selected,
  onClick,
}: {
  item: NoteConsultationListItem;
  selected: boolean;
  onClick: () => void;
}) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const detailRows = getMentoringDetailRows(item.request);
  const title = getRequestTitle(item.request, '멘토링 쪽지 상담');

  return (
    <>
      {' '}
      <div
        className={`rounded-200 w-full border px-200 py-200 text-left transition-colors ${selected ? 'border-border-brand bg-fill-brand-subtle-default shadow-1' : 'border-border-subtle bg-background-default hover:border-border-brand'}`}
      >
        {' '}
        <button type="button" onClick={onClick} className="w-full text-left">
          {' '}
          <div className="flex items-start justify-between gap-100">
            {' '}
            <p className="line-clamp-1 min-w-0 flex-1 font-designer-16b text-text-default">
              {' '}
              {title}{' '}
            </p>{' '}
            <span className="shrink-0 font-designer-12m text-text-subtle">
              {' '}
              {dayjs(item.lastMessageCreatedAt).format('MM.DD HH:mm')}{' '}
            </span>{' '}
          </div>{' '}
          <p className="mt-100 line-clamp-3 whitespace-pre-line font-designer-13r text-text-subtle">
            {' '}
            {item.lastMessageContent}{' '}
          </p>{' '}
          <div className="mt-150 flex items-center gap-100">
            {' '}
            <ParticipantProfileAvatar
              name={item.displayName}
              imageUrl={item.counterpartProfileImageUrl}
              memberId={item.counterpartMemberId}
              size={36}
            />{' '}
            <div className="min-w-0">
              {' '}
              <p className="truncate font-designer-13m text-text-default">
                {' '}
                {item.displayName}{' '}
              </p>{' '}
              <p className="truncate font-designer-11r text-text-subtle">
                {' '}
                {item.displayRole || '상담 참여자'}{' '}
              </p>{' '}
            </div>{' '}
          </div>{' '}
        </button>{' '}
        <div className="mt-150 flex justify-end">
          {' '}
          <Button
            type="button"
            color={selected ? 'primary' : 'outlined'}
            size="xsmall"
            onClick={() => setIsDetailModalOpen(true)}
          >
            {' '}
            상세내역{' '}
          </Button>{' '}
        </div>{' '}
      </div>{' '}
      <Modal.Root open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        {' '}
        <Modal.Portal>
          {' '}
          <Modal.Overlay />{' '}
          <Modal.Content size="small" className="w-[560px]">
            {' '}
            <Modal.Header variant="form" className="items-center">
              {' '}
              <Modal.Title>멘토링 상세 내역</Modal.Title>{' '}
              <Modal.CloseButton className="text-text-subtle hover:text-text-default" />{' '}
            </Modal.Header>{' '}
            <Modal.Body variant="form" className="gap-0 px-300 py-250">
              {' '}
              <dl className="grid gap-100">
                {' '}
                {detailRows.map((row) => (
                  <div
                    key={row.term}
                    className="border-border-subtle flex items-start justify-between gap-125 border-b pb-100 last:border-0"
                  >
                    {' '}
                    <dt className="min-w-0 flex-1 font-designer-12m text-text-subtle">
                      {' '}
                      {row.term}{' '}
                    </dt>{' '}
                    <dd className="text-right font-designer-13m text-text-default">
                      {' '}
                      {row.value}{' '}
                    </dd>{' '}
                  </div>
                ))}{' '}
              </dl>{' '}
            </Modal.Body>{' '}
          </Modal.Content>{' '}
        </Modal.Portal>{' '}
      </Modal.Root>{' '}
    </>
  );
}
function DetailPanel({
  request,
  displayName,
  displayRole,
  counterpartMemberId,
  counterpartProfileImageUrl,
  onBack,
}: {
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  counterpartMemberId?: number;
  counterpartProfileImageUrl?: string;
  onBack: () => void;
}) {
  const questionBoard = buildQuestionBoard(request);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-default">
      {' '}
      <header className="border-border-subtle border-b px-250 pt-250 pb-175">
        {' '}
        <div className="flex items-center gap-125">
          {' '}
          <button
            type="button"
            onClick={onBack}
            className="border-border-subtle hover:text-text-default shrink-0 inline-flex items-center gap-75 rounded-150 border px-125 py-75 font-designer-13m text-text-subtle"
          >
            {' '}
            <ChevronLeft className="h-200 w-200" /> 목록으로 돌아가기{' '}
          </button>{' '}
          <span className="truncate font-designer-11r text-text-subtle">
            {' '}
            상담 ID {request.id}{' '}
          </span>{' '}
        </div>{' '}
        <div className="mt-175 flex flex-wrap items-center justify-between gap-150">
          {' '}
          <div className="flex min-w-0 items-center gap-125">
            {' '}
            <ParticipantProfileAvatar
              name={displayName}
              imageUrl={counterpartProfileImageUrl}
              memberId={counterpartMemberId}
            />{' '}
            <div className="min-w-0">
              {' '}
              <p className="truncate font-designer-18b text-text-default">
                {' '}
                {displayName}{' '}
              </p>{' '}
              <p className="truncate font-designer-12r text-text-subtle">
                {' '}
                {displayRole || '상담 참여자'}{' '}
              </p>{' '}
              <p className="mt-25 truncate font-designer-11r text-text-subtlest">
                {' '}
                요청 시각 {formatDateTime(request.requestedAt)}{' '}
              </p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </header>{' '}
      <div className="min-h-0 overflow-y-auto overscroll-contain min-h-0 flex-1 px-250 pb-250">
        {' '}
        <div className="mt-175 space-y-150">
          {' '}
          {questionBoard.map((question, questionIndex) => (
            <article
              key={question.id}
              className="rounded-200 border-border-subtle bg-background-default border px-200 py-200"
            >
              {' '}
              <div className="border-border-subtle border-b pb-125">
                {' '}
                <p className="inline-flex font-designer-12m text-text-brand">
                  {' '}
                  질문 {questionIndex + 1}{' '}
                </p>{' '}
                <h3 className="mt-25 font-designer-16b text-text-default">
                  {' '}
                  {question.title}{' '}
                </h3>{' '}
                <p className="mt-25 font-designer-11r text-text-subtle">
                  {' '}
                  {formatDateTime(question.createdAt)}{' '}
                </p>{' '}
              </div>{' '}
              <p className="mt-125 leading-relaxed whitespace-pre-line font-designer-14r text-text-default">
                {' '}
                {question.content}{' '}
              </p>{' '}
              <div className="border-border-subtle mt-150 border-t pt-125">
                {' '}
                <p className="mb-75 font-designer-12m text-text-default">
                  {' '}
                  멘토 답변{' '}
                </p>{' '}
                {question.answers.length === 0 ? (
                  <p className="mt-75 font-designer-13r text-text-subtle">
                    {' '}
                    아직 등록된 답변이 없습니다.{' '}
                  </p>
                ) : (
                  <div className="mt-100 space-y-100">
                    {' '}
                    {question.answers.map((answer, answerIndex) => (
                      <div
                        key={answer.id}
                        className="rounded-150 bg-background-alternative px-150 py-125"
                      >
                        {' '}
                        <div className="mb-75 flex min-w-0 items-center gap-75">
                          {' '}
                          <ParticipantProfileAvatar
                            name={displayName}
                            imageUrl={counterpartProfileImageUrl}
                            memberId={counterpartMemberId}
                            size={28}
                          />{' '}
                          <div className="min-w-0">
                            {' '}
                            <p className="truncate font-designer-12m text-text-default">
                              {' '}
                              {displayName}{' '}
                            </p>{' '}
                            <p className="truncate font-designer-11r text-text-subtle">
                              {' '}
                              {displayRole || '상담 참여자'}{' '}
                            </p>{' '}
                            <p className="mt-25 truncate font-designer-11r text-text-subtlest">
                              {' '}
                              요청 시각 {formatDateTime(request.requestedAt)}{' '}
                            </p>{' '}
                          </div>{' '}
                        </div>{' '}
                        <p className="mb-50 font-designer-12m text-text-brand">
                          {' '}
                          답변 {answerIndex + 1}{' '}
                        </p>{' '}
                        <p className="mt-50 leading-relaxed whitespace-pre-line font-designer-14r text-text-default">
                          {' '}
                          {answer.content}{' '}
                        </p>{' '}
                        <p className="mt-75 font-designer-11r text-text-subtle">
                          {' '}
                          {formatDateTime(answer.createdAt)}{' '}
                        </p>{' '}
                      </div>
                    ))}{' '}
                  </div>
                )}{' '}
              </div>{' '}
            </article>
          ))}{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
export function NoteConsultationHeader() {
  return (
    <header className="flex flex-col gap-150">
      {' '}
      <div className="flex flex-wrap items-center gap-100">
        {' '}
        <Link href="/mentoring">
          {' '}
          <Button color="outlined" size="small">
            {' '}
            멘토링 목록{' '}
          </Button>{' '}
        </Link>{' '}
        <span className="bg-fill-brand-subtle-default inline-flex h-44 w-44 items-center justify-center rounded-full">
          {' '}
          <MessageCircle className="text-text-brand h-22 w-22" />{' '}
        </span>{' '}
        <h1 className="font-designer-24b text-text-default">
          {' '}
          {MENTORING_NOTE_LABEL}{' '}
        </h1>{' '}
      </div>{' '}
      <p className="max-w-[720px] font-designer-14r text-text-subtle">
        {' '}
        신청 내역을 목록에서 선택하면 질문과 멘토 답변을 바로 확인합니다.{' '}
      </p>{' '}
    </header>
  );
}
export function NoteConsultationEmpty() {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default flex flex-col items-center justify-center border px-300 py-500 text-center min-h-[520px]">
      {' '}
      <div className="bg-fill-brand-subtle-default rounded-500 mb-200 flex items-center justify-center h-[72px] w-[72px]">
        {' '}
        <MessageCircle className="text-text-brand h-32 w-32" />{' '}
      </div>{' '}
      <h2 className="mb-75 font-designer-24b text-text-default">
        {' '}
        아직 {MENTORING_NOTE_LABEL} 내역이 없어요{' '}
      </h2>{' '}
      <p className="mb-50 font-designer-16m text-text-default">
        {' '}
        멘토를 찾아 {MENTORING_NOTE_LABEL}을 신청해보세요.{' '}
      </p>{' '}
      <p className="mb-250 font-designer-14r text-text-subtle">
        {' '}
        신청만 있어도 이 곳에서 질문과 멘토 답변을 확인할 수 있어요.{' '}
      </p>{' '}
      <Link href="/mentoring">
        {' '}
        <Button color="primary" size="large">
          {' '}
          멘토링 둘러보기{' '}
        </Button>{' '}
      </Link>{' '}
    </section>
  );
}
export function NoteConsultationFilters({
  activeChannel,
  statusFilter,
  statusTabs,
  showChannelTabs = true,
  compactLayout = false,
  onActiveChannelChange,
  onStatusFilterChange,
}: NoteConsultationFiltersProps) {
  const showStatusTabs = statusTabs.length > 0;
  if (!showChannelTabs && !showStatusTabs) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-75 ${compactLayout ? '' : 'px-250 py-175'}`}
    >
      {' '}
      {showChannelTabs ? (
        <div className="bg-background-alternative rounded-150 flex p-50">
          {' '}
          <button
            type="button"
            onClick={() => onActiveChannelChange('sent')}
            className={`rounded-100 h-40 flex-1 font-designer-13m ${activeChannel === 'sent' ? 'note-consultation-filter-tab-active bg-fill-brand-subtle-default text-text-brand' : 'hover:bg-background-default text-text-subtle'}`}
          >
            {' '}
            멘티 게시판{' '}
          </button>{' '}
          <button
            type="button"
            onClick={() => onActiveChannelChange('received')}
            className={`rounded-100 h-40 flex-1 font-designer-13m ${activeChannel === 'received' ? 'note-consultation-filter-tab-active bg-fill-brand-subtle-default text-text-brand' : 'hover:bg-background-default text-text-subtle'}`}
          >
            {' '}
            멘토 게시판{' '}
          </button>{' '}
        </div>
      ) : null}{' '}
      {showStatusTabs ? (
        <div className="grid grid-cols-1 gap-125 lg:grid-cols-3">
          {' '}
          {statusTabs.map((tab, index) => {
            const isActive = tab.key === statusFilter;
            const step = `${index + 1}`.padStart(2, '0');
            const description =
              NOTE_STATUS_TAB_DESCRIPTION_MAP[tab.key] ??
              '상태별 상담 흐름을 이 단계에서 확인합니다.';

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={`rounded-150 border p-200 text-left transition-colors ${isActive ? 'border-border-brand bg-background-default' : 'border-border-subtle bg-background-default hover:bg-background-alternative'}`}
              >
                <div className="flex items-center justify-between">
                  {' '}
                  <div className="flex items-center gap-100">
                    {' '}
                    <span
                      className={`inline-flex h-300 w-300 shrink-0 items-center justify-center rounded-full font-designer-12b ${isActive ? 'bg-fill-brand-default-default text-text-inverse' : 'bg-background-alternative text-text-subtle'}`}
                    >
                      {' '}
                      {step}{' '}
                    </span>{' '}
                    <span
                      className={`font-designer-15b ${isActive ? 'text-text-brand' : 'text-text-default'}`}
                    >
                      {' '}
                      {tab.label}{' '}
                    </span>{' '}
                  </div>{' '}
                  <span className="shrink-0 font-designer-13m text-text-subtle">
                    {' '}
                    {tab.count}건{' '}
                  </span>{' '}
                </div>{' '}
                <p className="mt-100 font-designer-12r text-text-subtle">
                  {' '}
                  {description}{' '}
                </p>{' '}
              </button>
            );
          })}{' '}
        </div>
      ) : null}{' '}
    </div>
  );
}
export function NoteConsultationList({
  items,
  selectedRequestId,
  compactLayout = false,
  onSelectRequestId,
}: NoteConsultationListProps) {
  return (
    <div
      className={
        compactLayout
          ? 'min-h-0 flex-1 space-y-100 overflow-y-auto overscroll-contain'
          : 'min-h-[640px] min-h-0 flex-1 space-y-100 px-250 py-175 overflow-y-auto overscroll-contain'
      }
    >
      {' '}
      {items.length === 0 ? (
        <div className="rounded-150 bg-background-alternative px-150 py-175 text-center">
          {' '}
          <p className="font-designer-13m text-text-subtle">
            {' '}
            표시할 상담 내역이 없습니다.{' '}
          </p>{' '}
        </div>
      ) : (
        items.map((item) => (
          <RequestListCard
            key={item.id}
            item={item}
            selected={item.id === selectedRequestId}
            onClick={() => onSelectRequestId(item.id)}
          />
        ))
      )}{' '}
    </div>
  );
}
function PinnedRequestCallout({
  isRestoringPinnedItem,
  hasMissingPinnedItem,
}: {
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
}) {
  if (isRestoringPinnedItem) {
    return (
      <div className="border-border-information bg-background-accent-blue-subtle border-b px-200 py-125">
        {' '}
        <p className="font-designer-12b text-text-default">
          {' '}
          선택한 상담을 불러오는 중입니다{' '}
        </p>{' '}
        <p className="mt-25 font-designer-11r text-text-subtle">
          {' '}
          신청 직후라면 몇 초 안에 상태와 상세 보드가 이어집니다.{' '}
        </p>{' '}
      </div>
    );
  }
  if (hasMissingPinnedItem) {
    return (
      <div className="border-border-warning bg-background-accent-yellow-subtle border-b px-200 py-125">
        {' '}
        <p className="font-designer-12b text-text-default">
          {' '}
          선택한 상담을 찾지 못해 최신 목록을 보여주고 있습니다{' '}
        </p>{' '}
        <p className="mt-25 font-designer-11r text-text-subtle">
          {' '}
          상태가 바뀌었거나 다른 목록으로 이동된 경우일 수 있습니다.{' '}
        </p>{' '}
      </div>
    );
  }

  return null;
}
export function NoteConsultationGrid({
  activeChannel,
  statusFilter,
  statusTabs,
  showChannelTabs = true,
  compactLayout = false,
  filteredItems,
  itemStatusSummaries,
  selectedRequestId,
  selectedItem,
  isRestoringPinnedItem,
  hasMissingPinnedItem,
  onActiveChannelChange,
  onStatusFilterChange,
  onSelectRequestId,
  onBack,
}: NoteConsultationGridProps) {
  const board = (
    <>
      {' '}
      <div className={compactLayout ? 'pb-150' : 'px-250 pt-250 pb-150'}>
        {' '}
        <h2 className="font-designer-20b text-text-default">상담 목록</h2>{' '}
        <p className="mt-25 font-designer-12r text-text-subtle">
          {' '}
          목록에서 상담을 선택하면 상세 화면으로 이동합니다.{' '}
        </p>{' '}
      </div>{' '}
      <NoteConsultationFilters
        activeChannel={activeChannel}
        statusFilter={statusFilter}
        statusTabs={statusTabs}
        showChannelTabs={showChannelTabs}
        compactLayout={compactLayout}
        onActiveChannelChange={onActiveChannelChange}
        onStatusFilterChange={onStatusFilterChange}
      />{' '}
      <PinnedRequestCallout
        isRestoringPinnedItem={isRestoringPinnedItem}
        hasMissingPinnedItem={hasMissingPinnedItem}
      />{' '}
      <NoteConsultationList
        items={filteredItems}
        itemStatusSummaries={itemStatusSummaries}
        selectedRequestId={selectedRequestId}
        compactLayout={compactLayout}
        onSelectRequestId={onSelectRequestId}
      />{' '}
    </>
  );
  if (!selectedItem) {
    return (
      <div
        className={
          compactLayout ? 'min-h-0 flex flex-col gap-200' : 'min-h-0 flex flex-col'
        }
      >
        {board}
      </div>
    );
  }

  return (
    <DetailPanel
      request={selectedItem.request}
      displayName={selectedItem.displayName}
      displayRole={selectedItem.displayRole}
      counterpartMemberId={selectedItem.counterpartMemberId}
      counterpartProfileImageUrl={selectedItem.counterpartProfileImageUrl}
      onBack={onBack}
    />
  );
}
