export type AlerttalkApprovalStatus =
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING_REVIEW'
  | 'NOT_SYNCED';

export type AlerttalkDeliveryStatus =
  | 'CREATED'
  | 'READY'
  | 'SENT'
  | 'FAILED'
  | 'SKIPPED';

export type AlerttalkRuleType =
  | 'DAILY_REMINDER'
  | 'LESSON_NUDGE_3D'
  | 'RE_ENGAGEMENT'
  | 'FINAL_NOTICE';

export interface ApiBaseResponse<T> {
  statusCode: number;
  timestamp: string;
  content: T;
}

export interface AdminAlerttalkTemplateListParams {
  templateKey?: string;
  approvalStatus?: AlerttalkApprovalStatus;
}

export interface AdminAlerttalkTemplate {
  templateKey: string;
  aligoTemplateCode?: string;
  templateName: string;
  approvalStatus: AlerttalkApprovalStatus | string;
  dispatchEnabled: boolean;
  testSendEnabled: boolean;
  sendPolicySummary: string;
  templateBodyPreview?: string;
  lastSyncedAt?: string;
  rejectionReason?: string;
}

export interface AdminAlerttalkTemplateListResponse {
  templates: AdminAlerttalkTemplate[];
}

export interface AdminAlerttalkTemplateSyncRequest {
  force?: boolean;
}

export interface AdminAlerttalkTemplateSyncResponse {
  syncedCount: number;
  changedKeys: string[];
  approvalSummary: Record<string, number>;
  lastSyncedAt: string;
}

export interface AdminAlerttalkTemplateTestSendRequest {
  phoneNumber: string;
  receiverName?: string;
  variables?: Record<string, string>;
}

export interface AdminAlerttalkTemplateTestSendResponse {
  templateKey: string;
  templateName: string;
  requestAccepted: boolean;
  aligoMessageId?: string;
  finalPreview: string;
}

export interface AdminAlerttalkDeliveryLogFilters {
  templateKey?: string;
  status?: Extract<AlerttalkDeliveryStatus, 'SENT' | 'FAILED' | 'SKIPPED'>;
  from?: string;
  to?: string;
}

export interface AdminAlerttalkDeliveryLog {
  jobId: number;
  triggerType: string;
  sourceKey: string;
  memberId?: number;
  phoneMasked?: string;
  status: AlerttalkDeliveryStatus | string;
  templateKey: string;
  failureReason?: string;
  sentAt?: string;
  payloadSnapshot?: Record<string, unknown>;
}

export interface AdminAlerttalkDeliveryLogListResponse {
  logs: AdminAlerttalkDeliveryLog[];
}

export interface AdminAlerttalkDeliveryLogDetail {
  jobId: number;
  templateKey: string;
  triggerType: string;
  sourceKey: string;
  status: AlerttalkDeliveryStatus | string;
  targetCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  targets: AdminAlerttalkDeliveryLog[];
}

export interface AdminAlerttalkRetryRequest {
  targetIds?: number[];
  reason?: string;
}

export interface AdminAlerttalkRetryResponse {
  retriedJobId: number;
  originalJobId: number;
  retriedTargetCount: number;
  status: string;
}

export interface AdminAlerttalkDryRunRequest {
  templateKey: AlerttalkRuleType;
  at: string;
  limit?: number;
}

export interface AdminAlerttalkDryRunResponse {
  templateKey: string;
  candidateCount: number;
  previewTargets: Array<{
    memberId?: number;
    phoneMasked?: string;
    whyIncluded: string;
  }>;
  dispatchCreated: boolean;
}
