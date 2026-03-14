'use client';

import dayjs from 'dayjs';
import Button from '@/components/common/ui/button';
import {
  getConversationWithFallback,
  getNoteConsultationMessagePreviewText,
} from '@/features/mentoring/model/note-consultation-message';
import RequestContentViewer from '@/features/mentoring/ui/apply/request-content-viewer';
import MentoringMarkdownContent from '@/features/mentoring/ui/common/mentoring-markdown-content';
import NoteConsultationParticipantAvatar from '@/features/mentoring/ui/note-consultation/note-consultation-participant-avatar';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';

interface BoardAnswer {
  id: string;
  content: string;
  messageContents?: MentoringRequestContentBlock[];
  createdAt: string;
}

interface BoardQuestionEntry {
  id: string;
  title: string;
  content: string;
  messageContents?: MentoringRequestContentBlock[];
  createdAt: string;
  answers: BoardAnswer[];
}

interface NoteConsultationQuestionBoardProps {
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  counterpartMemberId?: number;
  counterpartProfileImageUrl?: string;
  canEditSelectedReply?: boolean;
  onStartEditingSelectedReply?: () => void;
}

export const formatNoteConsultationDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  return dayjs(value).format('YYYY.MM.DD HH:mm');
};

const getMessageContents = (message: {
  messageContents?: MentoringRequestContentBlock[];
}) => {
  return message.messageContents?.length ? message.messageContents : undefined;
};

const getQuestionTitle = (content: string, questionOrder: number) => {
  const firstLine =
    getNoteConsultationMessagePreviewText(content)
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

  const firstLine = getNoteConsultationMessagePreviewText(request.requestMessage)
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstLine || fallback;
};

const buildQuestionBoard = (request: MentoringRequest): BoardQuestionEntry[] => {
  const mentorAnswers = getConversationWithFallback(request)
    .filter((message) => {
      return message.sender === 'MENTOR';
    })
    .map((message) => ({
      id: message.id,
      content: message.content.trim() || '답변 본문이 비어 있습니다.',
      messageContents: getMessageContents(message),
      createdAt: message.createdAt,
    }));

  return [
    {
      id: `${request.id}-question-initial`,
      title: getRequestTitle(
        request,
        getQuestionTitle(request.requestMessage, 1),
      ),
      content: request.requestMessage.trim() || '질문 본문이 비어 있습니다.',
      messageContents:
        request.requestContents?.length ? request.requestContents : undefined,
      createdAt: request.requestedAt,
      answers: mentorAnswers,
    },
  ];
};

function MentorAnswerCard({
  answer,
  answerIndex,
  displayName,
  displayRole,
  counterpartMemberId,
  counterpartProfileImageUrl,
  requestedAt,
  showEditButton,
  onEdit,
}: {
  answer: BoardAnswer;
  answerIndex: number;
  displayName: string;
  displayRole: string;
  counterpartMemberId?: number;
  counterpartProfileImageUrl?: string;
  requestedAt: string;
  showEditButton: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="rounded-150 bg-background-alternative px-150 py-125">
      <div className="mb-75 flex items-start justify-between gap-100">
        <div className="flex min-w-0 items-center gap-75">
          <NoteConsultationParticipantAvatar
            name={displayName}
            imageUrl={counterpartProfileImageUrl}
            memberId={counterpartMemberId}
            size={28}
          />
          <div className="min-w-0">
            <p className="truncate font-designer-12m text-text-default">
              {displayName}
            </p>
            <p className="truncate font-designer-11r text-text-subtle">
              {displayRole || '상담 참여자'}
            </p>
            <p className="mt-25 truncate font-designer-11r text-text-subtlest">
              요청 시각 {formatNoteConsultationDateTime(requestedAt)}
            </p>
          </div>
        </div>
        {showEditButton ? (
          <Button type="button" color="outlined" size="xsmall" onClick={onEdit}>
            답변 수정
          </Button>
        ) : null}
      </div>
      <p className="mb-50 font-designer-12m text-text-brand">
        답변 {answerIndex + 1}
      </p>
      <div className="mt-50">
        {answer.messageContents ? (
          <RequestContentViewer
            requestMessage={answer.content}
            requestContents={answer.messageContents}
            hideGuidance
          />
        ) : (
          <MentoringMarkdownContent
            content={answer.content}
            emptyMessage="답변 본문이 비어 있습니다."
          />
        )}
      </div>
      <p className="mt-75 font-designer-11r text-text-subtle">
        {formatNoteConsultationDateTime(answer.createdAt)}
      </p>
    </div>
  );
}

function QuestionBoardArticle({
  question,
  questionIndex,
  request,
  displayName,
  displayRole,
  counterpartMemberId,
  counterpartProfileImageUrl,
  canEditSelectedReply,
  onStartEditingSelectedReply,
}: {
  question: BoardQuestionEntry;
  questionIndex: number;
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  counterpartMemberId?: number;
  counterpartProfileImageUrl?: string;
  canEditSelectedReply?: boolean;
  onStartEditingSelectedReply?: () => void;
}) {
  const canShowReplyEditButton =
    !!canEditSelectedReply &&
    request.status !== 'CLOSED' &&
    request.status !== 'REJECTED';

  return (
    <article className="rounded-200 border-border-subtle bg-background-default border px-200 py-200">
      <div className="border-border-subtle border-b pb-125">
        <p className="inline-flex font-designer-12m text-text-brand">
          질문 {questionIndex + 1}
        </p>
        <h3 className="mt-25 font-designer-16b text-text-default">
          {question.title}
        </h3>
        <p className="mt-25 font-designer-11r text-text-subtle">
          {formatNoteConsultationDateTime(question.createdAt)}
        </p>
      </div>
      <div className="mt-125">
        {question.messageContents ? (
          <RequestContentViewer
            requestMessage={question.content}
            requestContents={question.messageContents}
            hideGuidance
          />
        ) : (
          <MentoringMarkdownContent
            content={question.content}
            emptyMessage="질문 본문이 비어 있습니다."
          />
        )}
      </div>
      <div className="border-border-subtle mt-150 border-t pt-125">
        <p className="mb-75 font-designer-12m text-text-default">멘토 답변</p>
        {question.answers.length === 0 ? (
          <p className="mt-75 font-designer-13r text-text-subtle">
            아직 등록된 답변이 없습니다.
          </p>
        ) : (
          <div className="mt-100 space-y-100">
            {question.answers.map((answer, answerIndex) => {
              const isLatestAnswer = answerIndex === question.answers.length - 1;

              return (
                <MentorAnswerCard
                  key={answer.id}
                  answer={answer}
                  answerIndex={answerIndex}
                  displayName={displayName}
                  displayRole={displayRole}
                  counterpartMemberId={counterpartMemberId}
                  counterpartProfileImageUrl={counterpartProfileImageUrl}
                  requestedAt={request.requestedAt}
                  showEditButton={canShowReplyEditButton && isLatestAnswer}
                  onEdit={onStartEditingSelectedReply}
                />
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

export default function NoteConsultationQuestionBoard({
  request,
  displayName,
  displayRole,
  counterpartMemberId,
  counterpartProfileImageUrl,
  canEditSelectedReply,
  onStartEditingSelectedReply,
}: NoteConsultationQuestionBoardProps) {
  const questionBoard = buildQuestionBoard(request);

  return (
    <div className="mt-175 space-y-150">
      {questionBoard.map((question, questionIndex) => (
        <QuestionBoardArticle
          key={question.id}
          question={question}
          questionIndex={questionIndex}
          request={request}
          displayName={displayName}
          displayRole={displayRole}
          counterpartMemberId={counterpartMemberId}
          counterpartProfileImageUrl={counterpartProfileImageUrl}
          canEditSelectedReply={canEditSelectedReply}
          onStartEditingSelectedReply={onStartEditingSelectedReply}
        />
      ))}
    </div>
  );
}
