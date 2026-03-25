'use client';

import dayjs from 'dayjs';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';

export const getConversationWithFallback = (
  request: MentoringRequest,
): MentoringConversationMessage[] => {
  const hasMenteeMessage = request.conversation.some((message) => {
    return message.sender === 'MENTEE';
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
};

export const getLastMessagePreview = (request: MentoringRequest) => {
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
};
