export const isMentoringApplyEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_MENTORING_APPLY === 'true';
};

export const isMentoringAdminMockEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_MENTORING_ADMIN_MOCK === 'true';
};
