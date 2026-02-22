'use client';

import dayjs from 'dayjs';
import {
  MessageCircle,
  MoreVertical,
  Paperclip,
  Search,
  SendHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getMentorById } from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useToastStore } from '@/stores/use-toast-store';
import {
  type MentoringConversationMessage,
  type MentoringRequest,
  type MentoringRequestStatus,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';

const statusLabelMap: Record<MentoringRequestStatus, string> = {
  PENDING: '대기중',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
};

const statusColorMap: Record<
  MentoringRequestStatus,
  'orange' | 'green' | 'red'
> = {
  PENDING: 'orange',
  ACCEPTED: 'green',
  REJECTED: 'red',
};

type RequestChannel = 'sent' | 'received';

interface RequestListItem {
  id: string;
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  channel: RequestChannel;
}

function UserAvatar({
  name,
  color = 'brand',
}: {
  name: string;
  color?: 'brand' | 'neutral';
}) {
  const initial = name.trim().charAt(0) || '?';

  return (
    <div
      className={`flex h-44 w-44 shrink-0 items-center justify-center rounded-full ${
        color === 'brand'
          ? 'bg-fill-brand-subtle-default text-text-brand'
          : 'bg-fill-neutral-default-default text-text-subtle'
      }`}
    >
      <span className="font-designer-16b">{initial}</span>
    </div>
  );
}

function getConversationWithFallback(
  request: MentoringRequest,
): MentoringConversationMessage[] {
  const hasMenteeMessage = request.conversation.some((msg) => {
    return msg.sender === 'MENTEE';
  });
  const fallbackMenteeMessage: MentoringConversationMessage | null =
    hasMenteeMessage
      ? null
      : {
          id: `${request.id}-fallback-mentee`,
          sender: 'MENTEE',
          content: request.requestMessage,
          createdAt: request.requestedAt,
        };

  return [
    ...(fallbackMenteeMessage ? [fallbackMenteeMessage] : []),
    ...request.conversation,
  ].sort((first, second) => {
    return dayjs(first.createdAt).valueOf() - dayjs(second.createdAt).valueOf();
  });
}

function getLastMessage(request: MentoringRequest) {
  const messages = getConversationWithFallback(request);
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return {
      content: request.requestMessage,
      createdAt: request.requestedAt,
    };
  }

  return {
    content: lastMessage.content,
    createdAt: lastMessage.createdAt,
  };
}

function RequestListCard({
  item,
  selected,
  onClick,
}: {
  item: RequestListItem;
  selected: boolean;
  onClick: () => void;
}) {
  const { content, createdAt } = getLastMessage(item.request);
  const mentorReplyCount = item.request.conversation.filter((message) => {
    return message.sender === 'MENTOR';
  }).length;
  const isUnreadLike = item.channel === 'sent' && mentorReplyCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-150 px-175 py-175 text-left transition-colors ${
        selected
          ? 'bg-fill-brand-subtle-default'
          : 'hover:bg-background-alternative'
      }`}
    >
      <div className="flex items-start gap-150">
        <UserAvatar name={item.displayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-75">
            <p className="font-designer-16b text-text-default truncate">
              {item.displayName}
            </p>
            <span className="font-designer-12m text-text-subtle shrink-0">
              {dayjs(createdAt).format('MM.DD HH:mm')}
            </span>
          </div>
          <p className="font-designer-12r text-text-subtle mt-50 truncate">
            {item.displayRole || '상담 참여자'}
          </p>
          <div className="mt-75 flex items-center justify-between gap-75">
            <p className="font-designer-13r text-text-subtle line-clamp-1 flex-1">
              {content}
            </p>
            {isUnreadLike && (
              <span className="bg-fill-brand-default-default text-text-inverse font-designer-11m inline-flex h-20 min-w-[20px] items-center justify-center rounded-full px-50 shrink-0">
                {mentorReplyCount}
          <p className="font-designer-11m text-text-subtlest mt-25 truncate">
            {item.displayRole || '상담 참여자'}
          </p>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  displayName,
}: {
  message: MentoringConversationMessage;
  displayName: string;
}) {
  if (message.sender === 'SYSTEM') {
    return (
      <div className="py-75 text-center">
        <span className="font-designer-11m text-text-subtle bg-background-default inline-flex rounded-full px-150 py-50 shadow-sm">
          {message.content}
        </span>
      </div>
    );
  }

  const isMentor = message.sender === 'MENTOR';

  return (
    <div className={`flex ${isMentor ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`flex max-w-[78%] items-start gap-100 ${isMentor ? '' : 'flex-row-reverse'}`}
      >
        <UserAvatar name={isMentor ? displayName : '나'} color={isMentor ? 'brand' : 'neutral'} />
        <div
          className={`rounded-200 px-150 py-100 shadow-sm ${
            isMentor
              ? 'bg-background-default text-text-default rounded-tl-50'
              : 'bg-fill-brand-default-default text-text-inverse rounded-tr-50'
          }`}
        >
          <p className="font-designer-13r leading-relaxed whitespace-pre-line">
            {message.content}
          </p>
          <p
            className={`font-designer-10r mt-50 opacity-70 ${
              isMentor ? 'text-text-subtle text-right' : 'text-text-inverse text-right'
            }`}
          >
            {dayjs(message.createdAt).format('A h:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  request,
  displayName,
  displayRole,
  channel,
  draft,
  onDraftChange,
  onSend,
  canSend,
}: {
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  channel: RequestChannel;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
}) {
  const messages = getConversationWithFallback(request);
  const hasFiles =
    (request.attachedFileNames?.length ?? 0) > 0 ||
    (request.referenceLinks?.length ?? 0) > 0;
  const canEditMessage = channel === 'received' && request.status !== 'REJECTED';

  return (
    <section className="flex h-full flex-col">
      <header className="border-border-subtle bg-background-default flex items-center justify-between border-b px-250 py-150">
        <div className="flex min-w-0 items-center gap-125">
          <UserAvatar name={displayName} />
          <div className="min-w-0">
            <p className="font-designer-18b text-text-default truncate">
              {displayName}
            </p>
            <p className="font-designer-12r text-text-subtle truncate">
              {displayRole || '상담 참여자'} · #{request.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-text-subtle hover:text-text-default inline-flex h-32 w-32 items-center justify-center rounded-full"
          aria-label="더보기"
        >
          <MoreVertical className="h-16 w-16" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-border-subtle border-b px-250 py-125">
          <div className="flex flex-wrap items-center gap-75">
            <Badge color={statusColorMap[request.status]} shape="round">
              {statusLabelMap[request.status]}
            </Badge>
            <span className="font-designer-12r text-text-subtle">
              신청 {dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm')}
            </span>
            {request.paymentMode !== 'FREE_REQUEST' && (
              <span className="font-designer-12r text-text-subtlest">
                {request.paymentStatus === 'CONFIRMED'
                  ? '결제 완료'
                  : request.paymentStatus === 'PENDING_TRANSFER'
                    ? '입금 대기'
                    : '결제 불필요'}
              </span>
            )}
          </div>
          {hasFiles && (
            <div className="mt-100 flex flex-wrap gap-75">
              {request.attachedFileNames?.map((fileName) => (
                <span
                  key={fileName}
                  className="font-designer-11m text-text-subtle border-border-subtle inline-flex items-center gap-50 rounded-full border px-100 py-50"
                >
                  <Paperclip className="h-12 w-12" />
                  {fileName}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background-alternative min-h-0 flex-1 overflow-y-auto px-250 py-200">
          <div className="space-y-175">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                displayName={displayName}
              />
            ))}
          </div>
        </div>

        <div className="border-border-subtle bg-background-default border-t px-200 py-150">
          <div className="bg-background-alternative flex items-end gap-100 rounded-full px-175 py-100">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (canEditMessage && canSend) {
                    onSend();
                  }
                }
              }}
              placeholder={
                canEditMessage
                  ? '메시지를 입력하세요. (Enter 전송 / Shift+Enter 줄바꿈)'
                  : '현재 내역은 조회 전용입니다.'
              }
              disabled={!canEditMessage}
              rows={1}
              className="font-designer-13r text-text-default placeholder:text-text-subtlest max-h-[100px] min-h-[24px] flex-1 resize-none bg-transparent leading-relaxed outline-none disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={!canEditMessage || !canSend}
              onClick={onSend}
              className="bg-fill-brand-default-default text-text-inverse disabled:bg-background-disabled disabled:text-text-disabled mb-[2px] inline-flex h-32 w-32 shrink-0 items-center justify-center rounded-full transition-colors"
              aria-label="메시지 전송"
            >
              <SendHorizontal className="h-14 w-14" />
            </button>
          </div>
          {!canEditMessage && (
            <p className="font-designer-11m text-text-subtle mt-75 px-50">
              멘토로 받은 신청 건에서만 답장을 보낼 수 있어요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default flex min-h-[520px] flex-col items-center justify-center border px-300 py-500 text-center">
      <div className="bg-fill-brand-subtle-default rounded-500 mb-200 flex h-[72px] w-[72px] items-center justify-center">
        <MessageCircle className="text-text-brand h-32 w-32" />
      </div>
      <h2 className="font-designer-24b text-text-default mb-75">
        아직 쪽지 상담 내역이 없어요
      </h2>
      <p className="font-designer-16m text-text-default mb-50">
        멘토를 찾아 쪽지 상담을 신청해보세요.
      </p>
      <p className="font-designer-14r text-text-subtle mb-250">
        궁금한 점을 쪽지로 남기면 빠르게 피드백을 받을 수 있어요.
      </p>
      <Link href="/mentoring">
        <Button color="primary" size="large">
          멘토링 둘러보기
        </Button>
      </Link>
    </section>
  );
}

export default function NoteConsultationPage() {
  const { memberId } = useAuthReady();
  const { showToast } = useToastStore();

  const hasHydrated = useMentoringManagementStore((state) => state.hasHydrated);
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const ensureNoteDemoData = useMentoringManagementStore(
    (state) => state.ensureNoteDemoData,
  );
  const sendMentorMessage = useMentoringManagementStore(
    (state) => state.sendMentorMessage,
  );

  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );

  const [activeChannel, setActiveChannel] = useState<RequestChannel>('sent');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftByRequest, setDraftByRequest] = useState<Record<string, string>>({});

  const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;

  useEffect(() => {
    if (memberId && hasHydrated) {
      ensureNoteDemoData(memberId);
    }
  }, [memberId, hasHydrated, ensureNoteDemoData]);

  const allRequests = useMemo(() => {
    return Object.values(requestsByMentor).flat();
  }, [requestsByMentor]);

  const getMentorDisplayInfo = (mentorId: number) => {
    const fromStore = createdMentors.find((mentor) => mentor.id === mentorId);
    if (fromStore) {
      return { name: fromStore.nickname, role: fromStore.role };
    }
    const fromMock = getMentorById(mentorId);
    if (fromMock) {
      return { name: fromMock.nickname, role: fromMock.role };
    }
    return { name: '멘토', role: '' };
  };

  const sentItems = useMemo<RequestListItem[]>(() => {
    const requests = allRequests.filter((request) => {
      return request.method === 'note' && request.menteeMemberId === memberId;
    });
    return requests.map((request) => {
      const mentorInfo = getMentorDisplayInfo(request.mentorId);
      return {
        id: request.id,
        request,
        displayName: mentorInfo.name,
        displayRole: mentorInfo.role,
        channel: 'sent',
      };
    });
  }, [allRequests, memberId, createdMentors]);

  const receivedItems = useMemo<RequestListItem[]>(() => {
    if (!myMentorId) return [];
    return (requestsByMentor[myMentorId] ?? [])
      .filter((request) => request.method === 'note')
      .map((request) => ({
        id: request.id,
        request,
        displayName: request.menteeName,
        displayRole: request.menteeRole,
        channel: 'received',
      }));
  }, [myMentorId, requestsByMentor]);

  const activeItems = activeChannel === 'sent' ? sentItems : receivedItems;
  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return activeItems;
    return activeItems.filter((item) => {
      const lastMessage = getLastMessage(item.request).content;
      return (
        item.displayName.includes(keyword) ||
        item.displayRole.includes(keyword) ||
        lastMessage.includes(keyword)
      );
    });
  }, [activeItems, searchKeyword]);

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedRequestId('');
      return;
    }
    const hasSelected = filteredItems.some((item) => item.id === selectedRequestId);
    if (!hasSelected) {
      setSelectedRequestId(filteredItems[0].id);
    }
  }, [filteredItems, selectedRequestId]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedRequestId) ?? null;
  const draft = selectedItem ? draftByRequest[selectedItem.id] ?? '' : '';
  const canSend = draft.trim().length > 0;

  const handleSendMessage = () => {
    if (!selectedItem || selectedItem.channel !== 'received') return;

    const content = (draftByRequest[selectedItem.id] ?? '').trim();
    if (!content) return;

    const result = sendMentorMessage({
      mentorId: selectedItem.request.mentorId,
      requestId: selectedItem.id,
      content,
    });

    if (!result.ok) {
      showToast(result.reason ?? '메시지 전송에 실패했습니다.', 'error');
      return;
    }

    setDraftByRequest((prev) => ({
      ...prev,
      [selectedItem.id]: '',
    }));
    showToast('메시지를 보냈습니다.', 'success');
  };

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-300">
        <div className="rounded-100 bg-background-alternative h-[40px] w-[200px] animate-pulse" />
        <div className="rounded-200 bg-background-alternative h-[660px] animate-pulse" />
      </div>
    );
  }

  const hasAnyRequest = sentItems.length > 0 || receivedItems.length > 0;

  return (
    <div className="flex flex-col gap-200">
      <header>
        <div className="mb-75 inline-flex items-center gap-100">
          <MessageCircle className="text-text-brand h-24 w-24" />
          <h1 className="font-designer-24b text-text-default">쪽지 상담</h1>
        </div>
        <p className="font-designer-14r text-text-subtle">
          상담 목록과 대화 상세를 한 화면에서 확인할 수 있어요.
        </p>
      </header>

      {!hasAnyRequest ? (
        <EmptyState />
      ) : (
        <section className="-mx-[90px] rounded-200 border-border-subtle bg-background-default overflow-hidden border">
          <div className="grid min-h-[660px] grid-cols-[300px_minmax(0,1fr)]">
            <aside className="border-border-subtle flex min-h-0 flex-col border-r">
              <div className="border-border-subtle border-b px-175 py-150">
                <h2 className="font-designer-20b text-text-default">메시지</h2>
                <p className="font-designer-12r text-text-subtle mt-25">
                  내역을 선택하면 상세 대화가 열립니다.
                </p>
              </div>

              <div className="border-border-subtle border-b px-175 py-125">
                <div className="bg-background-alternative flex rounded-100 p-25">
                  <button
                    type="button"
                    onClick={() => setActiveChannel('sent')}
                    className={`font-designer-13m h-36 flex-1 rounded-75 ${
                      activeChannel === 'sent'
                        ? 'bg-fill-brand-subtle-default text-text-brand'
                        : 'text-text-subtle'
                    }`}
                  >
                    내가 신청한 상담
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChannel('received')}
                    className={`font-designer-13m h-36 flex-1 rounded-75 ${
                      activeChannel === 'received'
                        ? 'bg-fill-brand-subtle-default text-text-brand'
                        : 'text-text-subtle'
                    }`}
                  >
                    받은 쪽지 신청
                  </button>
                </div>

                <label className="border-border-subtle mt-100 flex h-36 items-center gap-50 rounded-100 border px-100">
                  <Search className="text-text-subtlest h-14 w-14" />
                  <input
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    className="font-designer-12r text-text-default placeholder:text-text-subtlest h-full flex-1 bg-transparent outline-none"
                    placeholder="이름, 역할, 메시지 검색"
                  />
                </label>
              </div>

              <div className="min-h-0 flex-1 space-y-50 overflow-y-auto px-100 py-100">
                {filteredItems.length === 0 ? (
                  <div className="rounded-100 bg-background-alternative px-125 py-150 text-center">
                    <p className="font-designer-13m text-text-subtle">
                      표시할 상담 내역이 없습니다.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <RequestListCard
                      key={item.id}
                      item={item}
                      selected={item.id === selectedRequestId}
                      onClick={() => setSelectedRequestId(item.id)}
                    />
                  ))
                )}
              </div>
            </aside>

            <div className="min-h-0">
              {selectedItem ? (
                <DetailPanel
                  request={selectedItem.request}
                  displayName={selectedItem.displayName}
                  displayRole={selectedItem.displayRole}
                  channel={selectedItem.channel}
                  draft={draft}
                  onDraftChange={(value) =>
                    setDraftByRequest((prev) => ({
                      ...prev,
                      [selectedItem.id]: value,
                    }))
                  }
                  onSend={handleSendMessage}
                  canSend={canSend}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-300">
                  <p className="font-designer-16m text-text-subtle text-center">
                    좌측 목록에서 상담을 선택하면
                    <br />
                    상세 대화를 확인할 수 있어요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
