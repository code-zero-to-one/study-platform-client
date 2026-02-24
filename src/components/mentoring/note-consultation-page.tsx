'use client';

import dayjs from 'dayjs';
import {
  MessageCircle,
  Paperclip,
  Search,
  SendHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { MENTORING_REQUEST_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getMentorById } from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';

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

function QuestionCard({ request }: { request: MentoringRequest }) {
  const hasFiles =
    (request.attachedFileNames?.length ?? 0) > 0 ||
    (request.referenceLinks?.length ?? 0) > 0;

  return (
    <div className="rounded-150 border border-border-subtle bg-background-default p-250">
      <div className="mb-175 flex items-center gap-100">
        <UserAvatar name={request.menteeName} color="neutral" />
        <div className="min-w-0 flex-1">
          <p className="font-designer-15b text-text-default">{request.menteeName}</p>
          <p className="font-designer-12r text-text-subtle">
            {request.menteeRole || '멘티'} · {dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-75">
          <Badge
            color={MENTORING_REQUEST_STATUS_META[request.status].color}
            shape="round"
          >
            {MENTORING_REQUEST_STATUS_META[request.status].label}
          </Badge>
        </div>
      </div>
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {request.requestMessage}
      </p>
      {hasFiles && (
        <div className="mt-175 flex flex-wrap gap-75 border-t border-border-subtle pt-150">
          {request.attachedFileNames?.map((fileName) => (
            <span
              key={fileName}
              className="font-designer-11m text-text-subtle border-border-subtle inline-flex items-center gap-50 rounded-full border px-100 py-50"
            >
              <Paperclip className="h-12 w-12" />
              {fileName}
            </span>
          ))}
          {request.referenceLinks?.map((link) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-designer-11m text-text-brand border-border-subtle inline-flex items-center gap-50 rounded-full border px-100 py-50 underline"
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function AnswerCard({
  message,
  authorName,
  authorLabel,
}: {
  message: MentoringConversationMessage;
  authorName: string;
  authorLabel: string;
}) {
  return (
    <div className="rounded-150 border border-border-subtle bg-background-default p-250">
      <div className="mb-175 flex items-center gap-100">
        <UserAvatar name={authorName} color="brand" />
        <div className="min-w-0 flex-1">
          <p className="font-designer-15b text-text-default">{authorName}</p>
          <p className="font-designer-12r text-text-subtle">
            {dayjs(message.createdAt).format('YYYY.MM.DD HH:mm')}
          </p>
        </div>
        <span className="font-designer-12m text-text-brand bg-fill-brand-subtle-default rounded-full px-100 py-50">
          {authorLabel}
        </span>
      </div>
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {message.content}
      </p>
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
  const mentorMessages = messages.filter((msg) => msg.sender === 'MENTOR');
  const systemMessages = messages.filter((msg) => msg.sender === 'SYSTEM');
  const canEditMessage = channel === 'received' && request.status !== 'REJECTED';
  const mentorAuthorName = channel === 'sent' ? displayName : '나';

  return (
    <section className="flex h-full flex-col">
      <header className="border-border-subtle bg-background-default flex items-center justify-between border-b px-250 py-150">
        <div className="flex min-w-0 items-center gap-125">
          <UserAvatar name={displayName} color={channel === 'sent' ? 'brand' : 'neutral'} />
          <div className="min-w-0">
            <p className="font-designer-18b text-text-default truncate">
              {displayName}
            </p>
            <p className="font-designer-12r text-text-subtle truncate">
              {displayRole || '상담 참여자'} · #{request.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
        {request.paymentMode === 'MANUAL_TRANSFER' && (
          <span className="font-designer-12r text-text-subtlest border-border-subtle rounded-full border px-100 py-50">
            {request.paymentStatus === 'CONFIRMED'
              ? '입금 확인 완료'
              : request.paymentStatus === 'PENDING_TRANSFER'
                ? '입금 대기'
                : '결제 불필요'}
          </span>
        )}
      </header>

      <div className="bg-background-alternative min-h-0 flex-1 overflow-y-auto px-250 py-200">
        <div className="space-y-175">
          <QuestionCard request={request} />

          {systemMessages.map((msg) => (
            <div key={msg.id} className="py-50 text-center">
              <span className="font-designer-11m text-text-subtle bg-background-default inline-flex rounded-full px-150 py-50 shadow-sm">
                {msg.content}
              </span>
            </div>
          ))}

          {mentorMessages.length > 0 ? (
            <div className="space-y-150">
              <div className="flex items-center gap-100">
                <div className="h-[1px] flex-1 bg-border-subtle" />
                <span className="font-designer-13m text-text-subtle px-75">
                  답변 {mentorMessages.length}개
                </span>
                <div className="h-[1px] flex-1 bg-border-subtle" />
              </div>
              {mentorMessages.map((msg) => (
                <AnswerCard
                  key={msg.id}
                  message={msg}
                  authorName={mentorAuthorName}
                  authorLabel="멘토 답변"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-150 border border-border-subtle bg-background-default px-250 py-200 text-center">
              <p className="font-designer-14m text-text-subtle">아직 답변이 없습니다.</p>
              <p className="font-designer-12r text-text-subtlest mt-50">
                멘토가 곧 답변을 등록할 예정이에요.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-border-subtle bg-background-default border-t px-200 py-150">
        {canEditMessage ? (
          <div className="rounded-150 border border-border-subtle bg-background-default px-175 py-125">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="답변을 작성해주세요."
              rows={4}
              className="font-designer-14r text-text-default placeholder:text-text-subtlest w-full resize-none bg-transparent leading-relaxed outline-none"
            />
            <div className="mt-100 flex items-center justify-between border-t border-border-subtle pt-100">
              <span className="font-designer-12r text-text-subtlest">
                {draft.trim().length > 0 ? `${draft.trim().length}자` : ''}
              </span>
              <button
                type="button"
                disabled={!canSend}
                onClick={onSend}
                className="bg-fill-brand-default-default text-text-inverse disabled:bg-background-disabled disabled:text-text-disabled inline-flex h-36 items-center gap-75 rounded-100 px-150 transition-colors"
              >
                <SendHorizontal className="h-14 w-14" />
                <span className="font-designer-13m">답변 등록</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-150 bg-background-alternative px-175 py-125 text-center">
            <p className="font-designer-13m text-text-subtle">
              {channel === 'sent'
                ? '내가 신청한 상담은 조회만 가능합니다.'
                : request.status === 'REJECTED'
                  ? '거절된 신청 건에는 답변할 수 없습니다.'
                  : '멘토로 받은 신청 건에서만 답변을 작성할 수 있어요.'}
            </p>
          </div>
        )}
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

  const getMentorDisplayInfo = useCallback(
    (mentorId: number) => {
      const fromStore = createdMentors.find((mentor) => mentor.id === mentorId);
      if (fromStore) {
        return { name: fromStore.nickname, role: fromStore.role };
      }
      const fromMock = getMentorById(mentorId);
      if (fromMock) {
        return { name: fromMock.nickname, role: fromMock.role };
      }

      return { name: '멘토', role: '' };
    },
    [createdMentors],
  );

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
  }, [allRequests, memberId, getMentorDisplayInfo]);

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
          <Link href="/mentoring-management">
            <Button color="outlined" size="small">
              멘토링 관리
            </Button>
          </Link>
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
