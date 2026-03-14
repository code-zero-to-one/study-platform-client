import { axiosInstance } from '@/api/client/axios';
import {
  createDefaultMentorSettings,
  createEmptyWeeklySchedule,
  type MentorSettings,
  type SettlementPayerType,
  type WeekdayKey,
} from '@/features/mentoring/model/mentor-settings';
import {
  MENTORING_METHOD_DEFAULT_DURATION_LABEL_MAP,
  MENTORING_METHOD_LABEL_MAP,
  parseMentoringMethodType,
} from '@/features/mentoring/model/mentoring-method';
import { getNoteConsultationMessagePreviewText } from '@/features/mentoring/model/note-consultation-message';
import { mergeMentoringRequestContentsWithAttachments } from '@/features/mentoring/model/request-content';
import type {
  AdminMentorDetail,
  AdminMentorItem,
  AdminMentoringDashboardMetrics,
  LifecyclePage,
  MentorOperationHistoryEntry,
  MentorOperationRecord,
  MentorOperationStatus,
  MentorScreeningHistoryEntry,
  MentorScreeningRecord,
  MentorScreeningStatus,
} from '@/types/mentoring/admin-domain';
import type {
  MentorProfile,
  MentorReview,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type {
  MentoringAttachedFile,
  MentoringConversationMessage,
  MentoringDisplayStatus,
  MentoringPaymentMethod,
  MentoringRequest,
  MentoringReview,
  MentoringReviewEligibility,
  MentoringReviewRecommendation,
  MentoringSession,
  MentoringSessionIssueType,
} from '@/types/mentoring/management-domain';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';

interface ApiResponse<T> {
  statusCode?: number;
  timestamp?: string;
  content?: T;
  message?: string;
}

export interface MyMentoringDashboardQueryParams {
  page?: number;
  size?: number;
  status?: string;
  method?: MentoringMethodType;
}

export interface CreateMentoringRequestParams {
  mentorId: number;
  method: MentoringMethodType;
  preferredDate?: string;
  preferredTime?: string;
  requestTitle?: string;
  requestMessage: string;
  requestContents?: MentoringRequest['requestContents'];
  attachmentFileKeys?: string[];
  attachedFileNames?: string[];
  referenceLinks?: string[];
}

export interface SendMentoringMessageParams {
  requestId: string;
  messageId?: string;
  content: string;
  messageContents?: MentoringRequest['requestContents'];
  attachmentFileKeys?: string[];
  attachedFileNames?: string[];
  referenceLinks?: string[];
}

export interface IssueMentoringAttachmentUploadTicketParams {
  fileName: string;
  fileSize: number;
  mimeType: string;
  attachmentType: 'FILE' | 'INLINE_IMAGE';
}

export interface MentoringAttachmentUploadTicket {
  fileKey: string;
  uploadUrl: string;
  publicUrl?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface AcceptMentoringRequestParams {
  requestId: string;
  mentorNote?: string;
  schedule?: {
    startsAt: string;
    endsAt: string;
    placeNote: string;
  };
}

export interface RejectMentoringRequestParams {
  requestId: string;
  reason: string;
}

export interface CloseMentoringRequestParams {
  requestId: string;
  note?: string;
}

export interface UpdateMentoringSessionParams {
  sessionId: string;
  startsAt: string;
  endsAt: string;
  placeNote: string;
  mentorNote?: string;
}

export interface CancelMentoringSessionParams {
  sessionId: string;
  issueType?: Extract<
    MentoringSessionIssueType,
    'MENTOR_CANCELLED' | 'MENTEE_CANCELLED'
  >;
  reason: string;
}

export interface MarkMentoringSessionOutcomeParams {
  sessionId: string;
  outcome: 'COMPLETED' | 'MENTEE_NO_SHOW' | 'MENTOR_NO_SHOW';
  note?: string;
}

export interface UpsertMentoringReviewParams {
  requestId: string;
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
}

export interface NoteConsultationListParams {
  requestId?: string;
  mentorId?: number;
}

export interface UpdateMentorScreeningParams {
  mentorId: number;
  status: MentorScreeningStatus;
  note?: string;
}

export interface UpdateMentorOperationParams {
  mentorId: number;
  status: MentorOperationStatus;
  reason?: string;
}

export interface AdminMentorListParams {
  page?: number;
  size?: number;
  mentorId?: number;
  screeningStatus?: MentorScreeningStatus;
  operationStatus?: MentorOperationStatus;
}

export interface AdminMentorDetailParams {
  mentorId: number;
  requestsPage?: number;
  requestsSize?: number;
  sessionsPage?: number;
  sessionsSize?: number;
  reviewsPage?: number;
  reviewsSize?: number;
}

export interface MentoringDashboardItemResource {
  mentor?: MentorProfile;
  request: MentoringRequest;
  session?: MentoringSession;
  review?: MentoringReview;
  reviewEligibility: MentoringReviewEligibility;
}

export interface MyMentoringDashboardResource {
  items: MentoringDashboardItemResource[];
  summary: {
    requestedCount: number;
    confirmedCount: number;
    completedCount: number;
    noteWaitingCount: number;
  };
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MentoringRequestDetailResource {
  mentor?: MentorProfile;
  request: MentoringRequest;
  session?: MentoringSession;
  review?: MentoringReview;
  reviewEligibility: MentoringReviewEligibility;
}

export interface MentorWorkspaceResource {
  mentor?: MentorProfile;
  noteRequests: MentoringDashboardItemResource[];
  reservationRequests: MentoringDashboardItemResource[];
  sessions: MentoringSession[];
  summary: {
    pendingCount: number;
    scheduledCount: number;
    doneCount: number;
    noteCount: number;
  };
}

export type MyMentoringDashboardItem = MentoringDashboardItemResource;
export type MyMentoringDashboardResponse = MyMentoringDashboardResource;
export type MentorWorkspaceResponse = MentorWorkspaceResource;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toTrimmedString = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : '';
};

const toOptionalString = (value: unknown) => {
  const normalized = toTrimmedString(value);

  return normalized.length > 0 ? normalized : undefined;
};

const toOptionalNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const toRequiredNumber = (value: unknown, fallback = 0) => {
  return toOptionalNumber(value) ?? fallback;
};

const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => toTrimmedString(item))
    .filter((item) => item.length > 0);
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
};

const toMethodType = (value: unknown) => {
  return parseMentoringMethodType(value) ?? 'note';
};

const serializeLifecycleMethod = (value: MentoringMethodType | undefined) => {
  if (!value) {
    return undefined;
  }

  return value === 'deep' ? 'in_depth' : value;
};

const toDisplayStatus = (value: unknown): MentoringDisplayStatus | undefined => {
  if (
    value === 'REQUESTED' ||
    value === 'PENDING' ||
    value === 'NOTE_WAITING' ||
    value === 'CONFIRMED' ||
    value === 'COMPLETED' ||
    value === 'REJECTED' ||
    value === 'CANCELLED' ||
    value === 'NO_SHOW'
  ) {
    return value;
  }

  return undefined;
};

const toConversationSender = (
  value: unknown,
): MentoringConversationMessage['sender'] => {
  return value === 'MENTOR' || value === 'SYSTEM' ? value : 'MENTEE';
};

const toPaymentMethod = (
  value: unknown,
): MentoringPaymentMethod | undefined => {
  if (
    value === 'CARD' ||
    value === 'VIRTUAL_ACCOUNT' ||
    value === 'MANUAL_TRANSFER'
  ) {
    return value;
  }

  return undefined;
};

const toIssueType = (value: unknown): MentoringSessionIssueType => {
  if (
    value === 'MENTOR_CANCELLED' ||
    value === 'MENTEE_CANCELLED' ||
    value === 'MENTOR_NO_SHOW' ||
    value === 'MENTEE_NO_SHOW'
  ) {
    return value;
  }

  return 'NONE';
};

const createFallbackMethodOption = (
  type: MentoringMethodType,
): MentoringMethodOption => {
  return {
    type,
    label: MENTORING_METHOD_LABEL_MAP[type],
    durationLabel: MENTORING_METHOD_DEFAULT_DURATION_LABEL_MAP[type],
    price: 0,
    description: '',
    enabled: false,
    requiresSchedule: type !== 'note',
    timeSlots: [],
  };
};

const mapMentoringMethodOption = ({
  type,
  input,
}: {
  type: MentoringMethodType;
  input: unknown;
}): MentoringMethodOption => {
  const fallback = createFallbackMethodOption(type);
  const source = isRecord(input) ? input : undefined;

  return {
    ...fallback,
    label: toOptionalString(source?.label) ?? fallback.label,
    durationLabel:
      toOptionalString(source?.durationLabel) ?? fallback.durationLabel,
    price: toRequiredNumber(source?.price),
    description: toTrimmedString(source?.description),
    enabled: toBoolean(source?.enabled, fallback.enabled),
    timeSlots: toStringArray(source?.timeSlots),
  };
};

const mapMentorReview = (input: unknown): MentorReview | undefined => {
  const source = isRecord(input) ? input : undefined;
  const id = source?.id;

  if (id === undefined) {
    return undefined;
  }

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : String(id),
    authorName: toOptionalString(source.authorName) ?? '익명',
    rating: toRequiredNumber(source.rating, 0),
    createdAt: toOptionalString(source.createdAt) ?? '',
    content: toOptionalString(source.content) ?? '',
    method: toMethodType(source.method),
  };
};

const mapMentorSettings = (input: unknown): MentorSettings | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const defaults = createDefaultMentorSettings();
  const weeklySource = isRecord(input.schedule)
    ? (input.schedule.weekly as Record<string, unknown> | undefined)
    : undefined;

  const weekly = {
    ...createEmptyWeeklySchedule(),
    ...Object.fromEntries(
      (Object.keys(createEmptyWeeklySchedule()) as WeekdayKey[]).map(
        (weekday) => [weekday, toStringArray(weeklySource?.[weekday])],
      ),
    ),
  };

  const settlementDraftSource = isRecord(input.settlementDraft)
    ? input.settlementDraft
    : null;

  return {
    ...defaults,
    contactCountryCode: (toOptionalString(input.contactCountryCode) ??
      defaults.contactCountryCode) as MentorSettings['contactCountryCode'],
    contactPhone: toOptionalString(input.contactPhone) ?? defaults.contactPhone,
    contactEmail: toOptionalString(input.contactEmail) ?? defaults.contactEmail,
    categories: toStringArray(input.categories),
    mentoringTitle:
      toOptionalString(input.mentoringTitle) ?? defaults.mentoringTitle,
    appealLine: toOptionalString(input.appealLine) ?? defaults.appealLine,
    jobGroup: toOptionalString(input.jobGroup) ?? defaults.jobGroup,
    jobTitle: toOptionalString(input.jobTitle) ?? defaults.jobTitle,
    careerYears: toOptionalString(input.careerYears) ?? defaults.careerYears,
    skillTags: toStringArray(input.skillTags),
    companyCategory: (toOptionalString(input.companyCategory) ??
      defaults.companyCategory) as MentorSettings['companyCategory'],
    companyName: toOptionalString(input.companyName) ?? defaults.companyName,
    hideCompanyName: toBoolean(input.hideCompanyName, defaults.hideCompanyName),
    listVisible: toBoolean(input.listVisible, defaults.listVisible),
    maxParticipants: toRequiredNumber(
      input.maxParticipants,
      defaults.maxParticipants,
    ),
    noteEnabled: toBoolean(input.noteEnabled, defaults.noteEnabled),
    notePrice: toRequiredNumber(input.notePrice, defaults.notePrice),
    simpleEnabled: toBoolean(input.simpleEnabled, defaults.simpleEnabled),
    simplePrice: toRequiredNumber(input.simplePrice, defaults.simplePrice),
    deepEnabled: toBoolean(input.deepEnabled, defaults.deepEnabled),
    deepPrice: toRequiredNumber(input.deepPrice, defaults.deepPrice),
    deepDurationMinutes: toRequiredNumber(
      input.deepDurationMinutes,
      defaults.deepDurationMinutes,
    ) as MentorSettings['deepDurationMinutes'],
    offlineEnabled: toBoolean(input.offlineEnabled, defaults.offlineEnabled),
    offlinePrice: toRequiredNumber(input.offlinePrice, defaults.offlinePrice),
    offlineDurationMinutes: toRequiredNumber(
      input.offlineDurationMinutes,
      defaults.offlineDurationMinutes,
    ) as MentorSettings['offlineDurationMinutes'],
    schedule: {
      timezone: 'Asia/Seoul',
      slotUnitMinutes: 30,
      weekly,
    },
    detailedDescription:
      toOptionalString(input.detailedDescription) ??
      defaults.detailedDescription,
    interviewQuestions: toStringArray(input.interviewQuestions),
    preNotice: toOptionalString(input.preNotice) ?? defaults.preNotice,
    settlementDraft: settlementDraftSource
      ? {
          payerType: (toOptionalString(settlementDraftSource.payerType) ??
            'INDIVIDUAL') as SettlementPayerType,
          contractName:
            toOptionalString(settlementDraftSource.contractName) ?? '',
          accountHolder:
            toOptionalString(settlementDraftSource.accountHolder) ?? '',
          bankCode: toOptionalString(settlementDraftSource.bankCode) ?? '',
          accountNumber:
            toOptionalString(settlementDraftSource.accountNumber) ?? '',
          residentId: toOptionalString(settlementDraftSource.residentId),
          businessName: toOptionalString(settlementDraftSource.businessName),
          businessRegistrationNumber: toOptionalString(
            settlementDraftSource.businessRegistrationNumber,
          ),
          verified: toBoolean(settlementDraftSource.verified),
          updatedAt:
            toOptionalString(settlementDraftSource.updatedAt) ??
            defaults.updatedAt,
        }
      : null,
    updatedAt: toOptionalString(input.updatedAt) ?? defaults.updatedAt,
  };
};

const mapMentorProfile = (input: unknown): MentorProfile | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const id = toOptionalNumber(input.id);
  if (id === undefined) {
    return undefined;
  }

  const methodsSource = isRecord(input.methods) ? input.methods : {};

  return {
    id,
    memberId: toOptionalNumber(input.memberId),
    nickname: toOptionalString(input.nickname) ?? `멘토 #${id}`,
    role: toOptionalString(input.role) ?? '멘토',
    career: toOptionalString(input.career) ?? '',
    company: toOptionalString(input.company) ?? '',
    rating: toRequiredNumber(input.rating, 0),
    reviewCount: toRequiredNumber(input.reviewCount, 0),
    mentoringCount: toRequiredNumber(input.mentoringCount, 0),
    menteeCount: toOptionalNumber(input.menteeCount),
    tags: toStringArray(input.tags),
    summary: toOptionalString(input.summary),
    bio: toOptionalString(input.bio),
    careerHistory: toStringArray(input.careerHistory),
    strengths: toStringArray(input.strengths),
    avatarEmoji: toOptionalString(input.avatarEmoji),
    imageUrl: toOptionalString(input.imageUrl),
    methods: {
      note: mapMentoringMethodOption({
        type: 'note',
        input: methodsSource.note,
      }),
      simple: mapMentoringMethodOption({
        type: 'simple',
        input: methodsSource.simple,
      }),
      deep: mapMentoringMethodOption({
        type: 'deep',
        input: methodsSource.deep,
      }),
      offline: mapMentoringMethodOption({
        type: 'offline',
        input: methodsSource.offline,
      }),
    },
    reviews: Array.isArray(input.reviews)
      ? input.reviews
          .map((review) => mapMentorReview(review))
          .filter((review): review is MentorReview => review !== undefined)
      : [],
    mentorSettings: mapMentorSettings(input.mentorSettings ?? input.settings),
  };
};

const mapAttachmentFile = (
  input: unknown,
): MentoringAttachedFile | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const fileName = toOptionalString(input.fileName);
  if (!fileName) {
    return undefined;
  }

  const downloadUrl =
    toOptionalString(input.downloadUrl) ?? toOptionalString(input.publicUrl);

  return {
    fileKey: toOptionalString(input.fileKey),
    fileName,
    fileSize: toRequiredNumber(input.fileSize, 0),
    mimeType: toOptionalString(input.mimeType),
    publicUrl: toOptionalString(input.publicUrl),
    downloadUrl,
  };
};

const mapConversationMessage = (
  input: unknown,
): MentoringConversationMessage | undefined => {
  const source = isRecord(input) ? input : undefined;
  const id = source?.id;

  if (id === undefined) {
    return undefined;
  }

  const attachedFiles = Array.isArray(source.attachedFiles)
    ? source.attachedFiles
        .map((file) => mapAttachmentFile(file))
        .filter((file): file is NonNullable<ReturnType<typeof mapAttachmentFile>> => {
          return file !== undefined;
        })
    : [];
  const rawMessageContents = Array.isArray(source.messageContents)
    ? (source.messageContents as MentoringConversationMessage['messageContents'])
    : undefined;
  const messageContents = mergeMentoringRequestContentsWithAttachments({
    contents: rawMessageContents,
    attachments: attachedFiles,
  });
  const attachedFileNames =
    attachedFiles.length > 0
      ? attachedFiles.map((file) => file.fileName)
      : toStringArray(source.attachedFileNames);

  return {
    id: String(id),
    sender: toConversationSender(source.sender),
    content: toOptionalString(source.content) ?? '',
    contentFormat:
      source.contentFormat === 'HTML' ? 'HTML' : 'PLAIN_TEXT',
    messageContents: messageContents.length > 0 ? messageContents : undefined,
    attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
    attachedFileNames,
    referenceLinks: toStringArray(source.referenceLinks),
    createdAt: toOptionalString(source.createdAt) ?? new Date().toISOString(),
    updatedAt: toOptionalString(source.updatedAt),
  };
};

const mapMentoringRequest = (input: unknown): MentoringRequest | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const id = input.id;
  const mentorId = toOptionalNumber(input.mentorId);
  if (id === undefined || mentorId === undefined) {
    return undefined;
  }

  const attachedFiles = Array.isArray(input.attachedFiles)
    ? input.attachedFiles
        .map((file) => mapAttachmentFile(file))
        .filter((file): file is NonNullable<ReturnType<typeof mapAttachmentFile>> => {
          return file !== undefined;
        })
    : [];
  const requestContents = mergeMentoringRequestContentsWithAttachments({
    contents: Array.isArray(input.requestContents)
      ? (input.requestContents as MentoringRequest['requestContents'])
      : undefined,
    attachments: attachedFiles,
  });

  const conversation = Array.isArray(input.conversation)
    ? input.conversation
        .map((message) => mapConversationMessage(message))
        .filter(
          (message): message is MentoringConversationMessage =>
            message !== undefined,
        )
    : [];

  return {
    id: String(id),
    mentorId,
    method: toMethodType(input.method),
    displayStatus: toDisplayStatus(input.displayStatus),
    mentorDisplayTitle: toOptionalString(input.mentorDisplayTitle),
    mentorNickname: toOptionalString(input.mentorNickname),
    methodLabel: toOptionalString(input.methodLabel),
    durationLabel: toOptionalString(input.durationLabel),
    paymentAmount: toOptionalNumber(input.paymentAmount),
    paymentMode:
      input.paymentMode === 'MANUAL_TRANSFER' ||
      input.paymentMode === 'TOSS_PAYMENTS'
        ? input.paymentMode
        : 'FREE_REQUEST',
    paymentMethod: toPaymentMethod(input.paymentMethod),
    paymentStatus:
      input.paymentStatus === 'PENDING_TRANSFER' ||
      input.paymentStatus === 'CONFIRMED'
        ? input.paymentStatus
        : 'NOT_REQUIRED',
    paymentMemo: toOptionalString(input.paymentMemo),
    menteeMemberId: toOptionalNumber(input.menteeMemberId),
    menteeName: toOptionalString(input.menteeName) ?? '멘티',
    menteeRole: toOptionalString(input.menteeRole) ?? 'ZERO-ONE 멘티',
    requestedAt:
      toOptionalString(input.requestedAt) ?? new Date().toISOString(),
    preferredDate: toOptionalString(input.preferredDate),
    preferredTime: toOptionalString(input.preferredTime),
    requestTitle: toOptionalString(input.requestTitle),
    requestMessage: toOptionalString(input.requestMessage) ?? '',
    requestContents: requestContents.length > 0 ? requestContents : undefined,
    attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
    attachedFileNames:
      attachedFiles.length > 0
        ? attachedFiles.map((file) => file.fileName)
        : toStringArray(input.attachedFileNames),
    referenceLinks: toStringArray(input.referenceLinks),
    status:
      input.status === 'ACCEPTED' ||
      input.status === 'REJECTED' ||
      input.status === 'CLOSED'
        ? input.status
        : 'PENDING',
    decisionNote: toOptionalString(input.decisionNote),
    closeNote: toOptionalString(input.closeNote ?? input.note),
    acceptedAt: toOptionalString(input.acceptedAt),
    rejectedAt: toOptionalString(input.rejectedAt),
    closedAt: toOptionalString(input.closedAt),
    linkedSessionId: toOptionalString(input.linkedSessionId),
    conversation,
  };
};

const mapMentoringSession = (input: unknown): MentoringSession | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const id = input.id;
  const mentorId = toOptionalNumber(input.mentorId);
  if (id === undefined || mentorId === undefined) {
    return undefined;
  }

  return {
    id: String(id),
    mentorId,
    requestId: toOptionalString(input.requestId) ?? '',
    menteeName: toOptionalString(input.menteeName) ?? '멘티',
    method: toMethodType(input.method),
    startsAt: toOptionalString(input.startsAt) ?? new Date().toISOString(),
    endsAt: toOptionalString(input.endsAt) ?? new Date().toISOString(),
    placeNote: toOptionalString(input.placeNote) ?? '',
    status:
      input.status === 'CANCELLED' || input.status === 'COMPLETED'
        ? input.status
        : 'SCHEDULED',
    issueType: toIssueType(input.issueType),
    operationNote: toOptionalString(input.operationNote),
    refundStatus:
      input.refundStatus === 'PENDING' ||
      input.refundStatus === 'COMPLETED' ||
      input.refundStatus === 'NOT_ELIGIBLE'
        ? input.refundStatus
        : 'NOT_APPLICABLE',
    refundNote: toOptionalString(input.refundNote),
    createdAt: toOptionalString(input.createdAt) ?? new Date().toISOString(),
    updatedAt: toOptionalString(input.updatedAt) ?? new Date().toISOString(),
  };
};

const mapMentoringReview = (input: unknown): MentoringReview | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const id = input.id;
  const mentorId = toOptionalNumber(input.mentorId);
  const menteeMemberId = toOptionalNumber(input.menteeMemberId);

  if (
    id === undefined ||
    mentorId === undefined ||
    menteeMemberId === undefined
  ) {
    return undefined;
  }

  return {
    id: String(id),
    mentorId,
    requestId: toOptionalString(input.requestId) ?? '',
    sessionId: toOptionalString(input.sessionId),
    menteeMemberId,
    menteeName: toOptionalString(input.menteeName) ?? '멘티',
    method: toMethodType(input.method),
    rating: toRequiredNumber(input.rating, 0),
    recommendation:
      input.recommendation === 'NOT_RECOMMEND' ? 'NOT_RECOMMEND' : 'RECOMMEND',
    content: toOptionalString(input.content) ?? '',
    createdAt: toOptionalString(input.createdAt) ?? new Date().toISOString(),
    updatedAt: toOptionalString(input.updatedAt) ?? new Date().toISOString(),
  };
};

const mapReviewEligibility = (input: unknown): MentoringReviewEligibility => {
  if (!isRecord(input)) {
    return {
      canReview: false,
      isCompleted: false,
      reason: '후기 작성 가능 여부를 확인하지 못했습니다.',
    };
  }

  return {
    canReview: toBoolean(input.canReview),
    isCompleted: toBoolean(input.isCompleted),
    reason: toOptionalString(input.reason),
  };
};

const withLinkedSessionId = ({
  request,
  session,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
}): MentoringRequest => {
  if (!session || request.linkedSessionId) {
    return request;
  }

  return {
    ...request,
    linkedSessionId: session.id,
  };
};

const mapDashboardItem = (input: unknown): MentoringDashboardItemResource => {
  const source = isRecord(input) ? input : {};
  const session = mapMentoringSession(source.session);
  const review = mapMentoringReview(source.review);
  const request = withLinkedSessionId({
    request:
      mapMentoringRequest(source.request) ??
      ({
        id: '',
        mentorId: 0,
        method: 'note',
        paymentMode: 'FREE_REQUEST',
        paymentStatus: 'NOT_REQUIRED',
        menteeName: '멘티',
        menteeRole: 'ZERO-ONE 멘티',
        requestedAt: new Date().toISOString(),
        requestMessage: '',
        status: 'PENDING',
        conversation: [],
      } satisfies MentoringRequest),
    session,
  });

  return {
    mentor: mapMentorProfile(source.mentor),
    request,
    session,
    review,
    reviewEligibility: mapReviewEligibility(source.reviewEligibility),
  };
};

const mapNoteConsultationListItem = (
  input: unknown,
): NoteConsultationListItem | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const request = mapMentoringRequest(input.request);
  if (!request) {
    return undefined;
  }

  const channel =
    input.channel === 'received' ? ('received' as const) : ('sent' as const);
  const rawLastMessageContent = toOptionalString(input.lastMessageContent) ?? '';
  const lastMessageContent =
    getNoteConsultationMessagePreviewText(rawLastMessageContent) ||
    rawLastMessageContent;
  const lastMessageCreatedAt =
    toOptionalString(input.lastMessageCreatedAt) ?? request.requestedAt;
  const mentorReplyCount = toRequiredNumber(input.mentorReplyCount, 0);
  const hasMentorConversation = request.conversation.some((message) => {
    return message.sender === 'MENTOR';
  });
  const normalizedConversation =
    mentorReplyCount > 0 &&
    !hasMentorConversation &&
    rawLastMessageContent.trim().length > 0
      ? [
          ...request.conversation,
          {
            id: `${request.id}-synthetic-mentor-reply`,
            sender: 'MENTOR' as const,
            content: rawLastMessageContent,
            createdAt: lastMessageCreatedAt,
            attachedFiles: undefined,
          },
        ]
      : request.conversation;
  const normalizedRequest =
    request.status === 'PENDING' && mentorReplyCount > 0
      ? {
          ...request,
          status: 'ACCEPTED' as const,
          acceptedAt: request.acceptedAt ?? lastMessageCreatedAt,
          conversation: normalizedConversation,
        }
      : {
          ...request,
          conversation: normalizedConversation,
        };

  return {
    id: String(input.id ?? request.id),
    request: normalizedRequest,
    displayName: toOptionalString(input.displayName) ?? '상대방',
    displayRole: toOptionalString(input.displayRole) ?? '',
    channel,
    counterpartMemberId: toOptionalNumber(input.counterpartMemberId),
    counterpartProfileImageUrl: toOptionalString(
      input.counterpartProfileImageUrl,
    ),
    lastMessageContent,
    lastMessageCreatedAt,
    mentorReplyCount,
  };
};

const mapMetrics = (input: unknown): AdminMentoringDashboardMetrics => {
  const source = isRecord(input) ? input : {};

  return {
    registeredMentorCount: toRequiredNumber(source.registeredMentorCount, 0),
    pendingScreeningCount: toRequiredNumber(source.pendingScreeningCount, 0),
    inReviewScreeningCount: toRequiredNumber(source.inReviewScreeningCount, 0),
    approvedMentorCount: toRequiredNumber(source.approvedMentorCount, 0),
    rejectedMentorCount: toRequiredNumber(source.rejectedMentorCount, 0),
    pendingRequestCount: toRequiredNumber(source.pendingRequestCount, 0),
    scheduledSessionCount: toRequiredNumber(source.scheduledSessionCount, 0),
    completedReviewCount: toRequiredNumber(source.completedReviewCount, 0),
  };
};

const mapScreeningHistoryEntry = (
  input: unknown,
): MentorScreeningHistoryEntry | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const id = input.id;
  if (id === undefined) {
    return undefined;
  }

  return {
    id: String(id),
    fromStatus:
      input.fromStatus === 'PENDING' ||
      input.fromStatus === 'IN_REVIEW' ||
      input.fromStatus === 'APPROVED' ||
      input.fromStatus === 'REJECTED'
        ? input.fromStatus
        : 'INITIAL',
    toStatus:
      input.toStatus === 'IN_REVIEW' ||
      input.toStatus === 'APPROVED' ||
      input.toStatus === 'REJECTED'
        ? input.toStatus
        : 'PENDING',
    note: toOptionalString(input.note),
    changedAt: toOptionalString(input.changedAt) ?? new Date().toISOString(),
    changedByMemberId: toOptionalNumber(input.changedByMemberId),
  };
};

const mapScreeningRecord = (input: unknown): MentorScreeningRecord => {
  const source = isRecord(input) ? input : {};

  return {
    status:
      source.status === 'IN_REVIEW' ||
      source.status === 'APPROVED' ||
      source.status === 'REJECTED'
        ? source.status
        : 'PENDING',
    note: toOptionalString(source.note),
    startedAt: toOptionalString(source.startedAt),
    startedByMemberId: toOptionalNumber(source.startedByMemberId),
    reviewedAt: toOptionalString(source.reviewedAt),
    reviewedByMemberId: toOptionalNumber(source.reviewedByMemberId),
  };
};

const mapLifecyclePage = <T>({
  input,
  itemMapper,
}: {
  input: unknown;
  itemMapper: (value: unknown) => T | undefined;
}): LifecyclePage<T> => {
  const source = isRecord(input) ? input : {};
  const itemsSource = Array.isArray(source.items) ? source.items : [];

  return {
    items: itemsSource
      .map((item) => itemMapper(item))
      .filter((item): item is T => item !== undefined),
    page: toRequiredNumber(source.page, 0),
    size: toRequiredNumber(source.size, itemsSource.length),
    totalElements: toRequiredNumber(source.totalElements, itemsSource.length),
    totalPages: toRequiredNumber(source.totalPages, 1),
    hasNext: toBoolean(source.hasNext),
    hasPrevious: toBoolean(source.hasPrevious),
  };
};

const mapOperationHistoryEntry = (
  input: unknown,
): MentorOperationHistoryEntry | undefined => {
  if (!isRecord(input)) {
    return undefined;
  }

  const id = input.id;
  if (id === undefined) {
    return undefined;
  }

  return {
    id: String(id),
    fromStatus:
      input.fromStatus === 'OPEN' ||
      input.fromStatus === 'REQUESTS_PAUSED' ||
      input.fromStatus === 'SUSPENDED'
        ? input.fromStatus
        : 'INITIAL',
    toStatus:
      input.toStatus === 'REQUESTS_PAUSED' || input.toStatus === 'SUSPENDED'
        ? input.toStatus
        : 'OPEN',
    reason: toOptionalString(input.reason),
    changedAt: toOptionalString(input.changedAt) ?? new Date().toISOString(),
    changedByMemberId: toOptionalNumber(input.changedByMemberId),
  };
};

const mapOperationRecord = (input: unknown): MentorOperationRecord => {
  const source = isRecord(input) ? input : {};

  return {
    status:
      source.status === 'REQUESTS_PAUSED' || source.status === 'SUSPENDED'
        ? source.status
        : 'OPEN',
    reason: toOptionalString(source.reason),
    changedAt: toOptionalString(source.changedAt),
    changedByMemberId: toOptionalNumber(source.changedByMemberId),
  };
};

const mapAdminMentorBase = (input: unknown): AdminMentorItem => {
  const source = isRecord(input) ? input : {};
  const mentorId = toRequiredNumber(source.mentorId);
  const countsSource = isRecord(source.counts) ? source.counts : {};
  const mentor = mapMentorProfile(source.mentor);

  if (!mentor) {
    throw new Error(
      `Admin mentoring response is missing mentor profile for mentorId=${mentorId}.`,
    );
  }

  return {
    mentor,
    mentorId,
    memberId: toOptionalNumber(source.memberId),
    screening: mapScreeningRecord(source.screening),
    operation: mapOperationRecord(source.operation),
    counts: {
      pendingRequests: toRequiredNumber(countsSource.pendingRequests, 0),
      acceptedRequests: toRequiredNumber(countsSource.acceptedRequests, 0),
      rejectedRequests: toRequiredNumber(countsSource.rejectedRequests, 0),
      closedRequests: toRequiredNumber(countsSource.closedRequests, 0),
      scheduledSessions: toRequiredNumber(countsSource.scheduledSessions, 0),
      completedSessions: toRequiredNumber(countsSource.completedSessions, 0),
      cancelledSessions: toRequiredNumber(countsSource.cancelledSessions, 0),
      reviews: toRequiredNumber(countsSource.reviews, 0),
    },
  };
};

const mapAdminMentorItem = (input: unknown): AdminMentorItem => {
  return mapAdminMentorBase(input);
};

const mapAdminMentorDetail = (input: unknown): AdminMentorDetail => {
  const source = isRecord(input) ? input : {};
  const base = mapAdminMentorBase(source);

  return {
    ...base,
    requestsPage: mapLifecyclePage({
      input: source.requestsPage,
      itemMapper: mapMentoringRequest,
    }),
    sessionsPage: mapLifecyclePage({
      input: source.sessionsPage,
      itemMapper: mapMentoringSession,
    }),
    reviewsPage: mapLifecyclePage({
      input: source.reviewsPage,
      itemMapper: mapMentoringReview,
    }),
    screeningHistory: Array.isArray(source.screeningHistory)
      ? source.screeningHistory
          .map((entry) => mapScreeningHistoryEntry(entry))
          .filter(
            (entry): entry is MentorScreeningHistoryEntry => entry !== undefined,
          )
      : [],
    operationHistory: Array.isArray(source.operationHistory)
      ? source.operationHistory
          .map((entry) => mapOperationHistoryEntry(entry))
          .filter(
            (entry): entry is MentorOperationHistoryEntry => entry !== undefined,
          )
      : [],
  };
};

const unwrapContent = <T>(response: { data?: ApiResponse<T> }) => {
  return response.data?.content;
};

export const getMyMentoringDashboard = async ({
  page = 0,
  size = 100,
  status,
  method,
}: MyMentoringDashboardQueryParams = {}): Promise<MyMentoringDashboardResource> => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    '/mentoring/me/dashboard',
    {
      params: {
        page,
        size,
        status,
        method: serializeLifecycleMethod(method),
      },
    },
  );

  const content = unwrapContent(response);
  const source = isRecord(content) ? content : {};
  const items = Array.isArray(source.items)
    ? source.items.map((item) => mapDashboardItem(item))
    : [];
  const summarySource = isRecord(source.summary) ? source.summary : {};

  return {
    items,
    summary: {
      requestedCount: toRequiredNumber(summarySource.requestedCount, 0),
      confirmedCount: toRequiredNumber(summarySource.confirmedCount, 0),
      completedCount: toRequiredNumber(summarySource.completedCount, 0),
      noteWaitingCount: toRequiredNumber(summarySource.noteWaitingCount, 0),
    },
    page: toRequiredNumber(source.page, page),
    size: toRequiredNumber(source.size, size),
    totalElements: toRequiredNumber(source.totalElements, items.length),
    totalPages: toRequiredNumber(source.totalPages, 1),
    hasNext: toBoolean(source.hasNext),
    hasPrevious: toBoolean(source.hasPrevious),
  };
};

export const getMentoringRequestDetail = async (
  requestId: string,
): Promise<MentoringRequestDetailResource> => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}`,
  );

  const content = unwrapContent(response);
  const source = isRecord(content) ? content : {};
  const session = mapMentoringSession(source.session);
  const detailConversation = Array.isArray(source.conversation)
    ? source.conversation
        .map((message) => mapConversationMessage(message))
        .filter(
          (message): message is MentoringConversationMessage =>
            message !== undefined,
        )
    : [];
  const mappedRequest =
    mapMentoringRequest(source.request) ??
    ({
      id: requestId,
      mentorId: 0,
      method: 'note',
      paymentMode: 'FREE_REQUEST',
      paymentStatus: 'NOT_REQUIRED',
      menteeName: '멘티',
      menteeRole: 'ZERO-ONE 멘티',
      requestedAt: new Date().toISOString(),
      requestMessage: '',
      status: 'PENDING',
      conversation: [],
    } satisfies MentoringRequest);

  return {
    mentor: mapMentorProfile(source.mentor),
    request: withLinkedSessionId({
      request: {
        ...mappedRequest,
        conversation:
          detailConversation.length > 0
            ? detailConversation
            : mappedRequest.conversation,
      },
      session,
    }),
    session,
    review: mapMentoringReview(source.review),
    reviewEligibility: mapReviewEligibility(source.reviewEligibility),
  };
};

export const getNoteConsultations = async ({
  requestId,
  mentorId,
}: NoteConsultationListParams = {}) => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    '/mentoring/note-consultations',
    {
      params: {
        requestId,
        mentorId,
      },
    },
  );

  const content = unwrapContent(response);
  const source = isRecord(content) ? content : {};
  const sentItems = Array.isArray(source.sentItems)
    ? source.sentItems
        .map((item) => mapNoteConsultationListItem(item))
        .filter((item): item is NoteConsultationListItem => item !== undefined)
    : [];
  const receivedItems = Array.isArray(source.receivedItems)
    ? source.receivedItems
        .map((item) => mapNoteConsultationListItem(item))
        .filter((item): item is NoteConsultationListItem => item !== undefined)
    : [];

  return {
    sentItems,
    receivedItems,
  };
};

export const getNoteConsultationList = getNoteConsultations;

export const sendMentoringMessage = async ({
  requestId,
  content,
  messageContents,
  attachmentFileKeys,
  attachedFileNames: _attachedFileNames,
  referenceLinks: _referenceLinks,
}: SendMentoringMessageParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}/messages`,
    {
      content,
      contentFormat: messageContents ? 'HTML' : 'PLAIN_TEXT',
      messageContents,
      attachmentFileKeys,
    },
  );

  const responseContent = unwrapContent(response);
  const source = isRecord(responseContent) ? responseContent : {};

  return {
    messageId: String(source.messageId ?? ''),
    requestId: toOptionalString(source.requestId) ?? requestId,
    lastMessageCreatedAt:
      toOptionalString(source.lastMessageCreatedAt) ?? new Date().toISOString(),
    updatedAt: toOptionalString(source.updatedAt),
    message: mapConversationMessage(source.message),
  };
};

export const updateMentoringMessage = async ({
  requestId,
  messageId,
  content,
  messageContents,
  attachmentFileKeys,
  attachedFileNames: _attachedFileNames,
  referenceLinks: _referenceLinks,
}: SendMentoringMessageParams) => {
  if (!messageId) {
    throw new Error('수정할 메시지 ID가 없습니다.');
  }

  const response = await axiosInstance.patch<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}/messages/${messageId}`,
    {
      content,
      contentFormat: messageContents ? 'HTML' : 'PLAIN_TEXT',
      messageContents,
      attachmentFileKeys,
    },
  );
  const responseContent = unwrapContent(response);
  const source = isRecord(responseContent) ? responseContent : {};

  return {
    messageId: String(source.messageId ?? messageId),
    requestId: toOptionalString(source.requestId) ?? requestId,
    lastMessageCreatedAt:
      toOptionalString(source.lastMessageCreatedAt) ?? new Date().toISOString(),
    updatedAt: toOptionalString(source.updatedAt),
    message: mapConversationMessage(source.message),
  };
};

export const issueMentoringMessageAttachmentUploadTicket = async ({
  fileName,
  fileSize,
  mimeType,
  attachmentType,
}: IssueMentoringAttachmentUploadTicketParams): Promise<MentoringAttachmentUploadTicket> => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    '/mentoring/messages/attachments/upload-ticket',
    {
      fileName,
      fileSize,
      mimeType,
      attachmentType,
    },
  );
  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};
  const uploadUrl = toOptionalString(source.uploadUrl);

  if (!uploadUrl) {
    throw new Error('첨부파일 업로드 URL이 없습니다.');
  }

  return {
    fileKey: toOptionalString(source.fileKey) ?? '',
    uploadUrl,
    publicUrl: toOptionalString(source.publicUrl),
    downloadUrl:
      toOptionalString(source.downloadUrl) ?? toOptionalString(source.publicUrl),
    expiresAt: toOptionalString(source.expiresAt),
  };
};

export const sendNoteConsultationMessage = async ({
  requestId,
  messageId,
  content,
  messageContents,
  attachmentFileKeys,
  attachedFileNames,
  referenceLinks,
}: SendMentoringMessageParams & { mentorId?: number }) => {
  const result = messageId
    ? await updateMentoringMessage({
        requestId,
        messageId,
        content,
        messageContents,
        attachmentFileKeys,
        attachedFileNames,
        referenceLinks,
      })
    : await sendMentoringMessage({
        requestId,
        content,
        messageContents,
        attachmentFileKeys,
        attachedFileNames,
        referenceLinks,
      });

  return {
    ok: true,
    ...result,
  };
};

export const getMentorWorkspace =
  async (): Promise<MentorWorkspaceResource> => {
    const response = await axiosInstance.get<ApiResponse<unknown>>(
      '/mentoring/me/mentor-workspace',
    );

    const content = unwrapContent(response);
    const source = isRecord(content) ? content : {};
    const noteRequests = Array.isArray(source.noteRequests)
      ? source.noteRequests.map((item) => mapDashboardItem(item))
      : [];
    const reservationRequests = Array.isArray(source.reservationRequests)
      ? source.reservationRequests.map((item) => mapDashboardItem(item))
      : [];
    const sessions = Array.isArray(source.sessions)
      ? source.sessions
          .map((session) => mapMentoringSession(session))
          .filter(
            (session): session is MentoringSession => session !== undefined,
          )
      : [];
    const summarySource = isRecord(source.summary) ? source.summary : {};

    return {
      mentor: mapMentorProfile(source.mentor),
      noteRequests,
      reservationRequests,
      sessions,
      summary: {
        pendingCount: toRequiredNumber(summarySource.pendingCount, 0),
        scheduledCount: toRequiredNumber(summarySource.scheduledCount, 0),
        doneCount: toRequiredNumber(summarySource.doneCount, 0),
        noteCount: toRequiredNumber(summarySource.noteCount, 0),
      },
    };
  };

export const createMentoringRequest = async ({
  mentorId,
  method,
  preferredDate,
  preferredTime,
  requestTitle,
  requestMessage,
  requestContents,
  attachmentFileKeys,
  attachedFileNames,
  referenceLinks,
}: CreateMentoringRequestParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    '/mentoring/requests',
    {
      mentorId,
      method: serializeLifecycleMethod(method),
      preferredDate,
      preferredTime,
      requestTitle,
      requestMessage,
      requestContents,
      attachmentFileKeys,
      attachedFileNames,
      referenceLinks,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};
  const request = mapMentoringRequest(source.request);

  return {
    requestId: String(source.requestId ?? request?.id ?? ''),
    request,
  };
};

export const acceptMentoringRequest = async ({
  requestId,
  mentorNote,
  schedule,
}: AcceptMentoringRequestParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}/accept`,
    {
      mentorNote,
      schedule,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    requestId: String(source.requestId ?? requestId),
    status: source.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED',
    sessionId: toOptionalString(source.sessionId),
  };
};

export const rejectMentoringRequest = async ({
  requestId,
  reason,
}: RejectMentoringRequestParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}/reject`,
    {
      reason,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    requestId: String(source.requestId ?? requestId),
    status: 'REJECTED' as const,
  };
};

export const closeMentoringRequest = async ({
  requestId,
  note,
}: CloseMentoringRequestParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}/close`,
    {
      note,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    requestId: String(source.requestId ?? requestId),
    status: source.status === 'CLOSED' ? 'CLOSED' : 'CLOSED',
    closedAt: toOptionalString(source.closedAt) ?? new Date().toISOString(),
  };
};

export const updateMentoringSession = async ({
  sessionId,
  startsAt,
  endsAt,
  placeNote,
  mentorNote,
}: UpdateMentoringSessionParams) => {
  const response = await axiosInstance.patch<ApiResponse<unknown>>(
    `/mentoring/sessions/${sessionId}`,
    {
      startsAt,
      endsAt,
      placeNote,
      mentorNote,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    sessionId: String(source.sessionId ?? sessionId),
    updatedAt: toOptionalString(source.updatedAt) ?? new Date().toISOString(),
  };
};

export const rescheduleMentoringSession = updateMentoringSession;

export const cancelMentoringSession = async ({
  sessionId,
  issueType,
  reason,
}: CancelMentoringSessionParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/mentoring/sessions/${sessionId}/cancel`,
    {
      issueType: issueType ?? 'MENTOR_CANCELLED',
      reason,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    sessionId: String(source.sessionId ?? sessionId),
    status: 'CANCELLED' as const,
  };
};

export const markMentoringSessionOutcome = async ({
  sessionId,
  outcome,
  note,
}: MarkMentoringSessionOutcomeParams) => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/mentoring/sessions/${sessionId}/outcome`,
    {
      outcome,
      note,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    sessionId: String(source.sessionId ?? sessionId),
    status: source.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
    issueType: toIssueType(source.issueType),
  };
};

export const upsertMentoringReview = async ({
  requestId,
  rating,
  recommendation,
  content,
}: UpsertMentoringReviewParams) => {
  const response = await axiosInstance.put<ApiResponse<unknown>>(
    `/mentoring/requests/${requestId}/review`,
    {
      rating,
      recommendation,
      content,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    reviewId: String(source.reviewId ?? ''),
    isUpdated: toBoolean(source.updated),
  };
};

export const getAdminMentoringOverview =
  async (): Promise<AdminMentoringDashboardMetrics> => {
    const response = await axiosInstance.get<ApiResponse<unknown>>(
      '/admin/mentoring/overview',
    );

    return mapMetrics(unwrapContent(response));
  };

export const getAdminMentoringMentors = async ({
  page = 0,
  size = 20,
  mentorId,
  screeningStatus,
  operationStatus,
}: AdminMentorListParams = {}): Promise<LifecyclePage<AdminMentorItem>> => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    '/admin/mentoring/mentors',
    {
      params: {
        page,
        size,
        mentorId,
        screeningStatus,
        operationStatus,
      },
    },
  );

  return mapLifecyclePage({
    input: unwrapContent(response),
    itemMapper: mapAdminMentorItem,
  });
};

export const getAdminMentoringMentorDetail = async ({
  mentorId,
  requestsPage = 0,
  requestsSize = 20,
  sessionsPage = 0,
  sessionsSize = 20,
  reviewsPage = 0,
  reviewsSize = 20,
}: AdminMentorDetailParams): Promise<AdminMentorDetail> => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    `/admin/mentoring/mentors/${mentorId}`,
    {
      params: {
        requestsPage,
        requestsSize,
        sessionsPage,
        sessionsSize,
        reviewsPage,
        reviewsSize,
      },
    },
  );

  return mapAdminMentorDetail(unwrapContent(response));
};

export const updateMentorScreening = async ({
  mentorId,
  status,
  note,
}: UpdateMentorScreeningParams) => {
  const response = await axiosInstance.patch<ApiResponse<unknown>>(
    `/admin/mentoring/mentors/${mentorId}/screening`,
    {
      status,
      note,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    mentorId: toRequiredNumber(source.mentorId, mentorId),
    screening: mapScreeningRecord(source.screening),
  };
};

export const updateMentorOperation = async ({
  mentorId,
  status,
  reason,
}: UpdateMentorOperationParams) => {
  const response = await axiosInstance.patch<ApiResponse<unknown>>(
    `/admin/mentoring/mentors/${mentorId}/operation`,
    {
      status,
      reason,
    },
  );

  const payload = unwrapContent(response);
  const source = isRecord(payload) ? payload : {};

  return {
    mentorId: toRequiredNumber(source.mentorId, mentorId),
    operation: mapOperationRecord(source.operation),
  };
};
