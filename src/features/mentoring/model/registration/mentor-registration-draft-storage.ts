const MENTOR_REGISTRATION_DRAFT_STORAGE_PREFIX = 'mentor-registration-draft:v1';
const MENTOR_REGISTRATION_UI_DRAFT_STORAGE_PREFIX =
  'mentor-registration-ui-draft:v1';

export const getMentorRegistrationDraftStorageKey = (memberId: number) =>
  `${MENTOR_REGISTRATION_DRAFT_STORAGE_PREFIX}:${memberId}`;

export const getMentorRegistrationUiDraftStorageKey = (memberId: number) =>
  `${MENTOR_REGISTRATION_UI_DRAFT_STORAGE_PREFIX}:${memberId}`;
