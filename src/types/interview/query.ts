export const interviewQueryKeys = {
  all: ['interview'] as const,
  dailyStudyDetails: () =>
    [...interviewQueryKeys.all, 'daily-study-detail'] as const,
  dailyStudyDetail: (studyDate: string) =>
    [...interviewQueryKeys.dailyStudyDetails(), studyDate] as const,
};
