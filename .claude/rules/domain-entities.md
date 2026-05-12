# Domain Warning: Mentoring vs MentorStudy

### Mentoring (1:1 individual consultation)
- **URL**: `/mentoring`, `/mentoring/[id]`, `/mentoring/[id]/apply`, `/mentoring/become-mentor`
- **Feature**: `src/features/mentoring/`
- **API hooks**: `useMentorDirectoryQuery`, `useMentorDetail`, `useMentoringApplyController`, etc.
- **Backend endpoint**: `/api/v1/mentors`
- **Nature**: 1:1 consultation between a professional mentor and a learner. Separate application/acceptance flow. No assignments or member management.

### MentorStudy (premium type of group study)
- **URL**: `/premium-study`, `/premium-study/[id]`
- **Components**: `src/components/pages/premium-study-*.tsx`, `src/app/(service)/premium-study/`
- **API hooks**: `useGetGroupStudyDetail`, `useGetGroupStudyList` (shared GroupStudy hooks)
- **Backend endpoint**: `/api/v1/group-studies` (MENTOR_STUDY distinguished by query parameter)
- **Nature**: Special type of group study (MentorStudy extends GroupStudy). Includes member management, assignments, and evaluations.

### Key Differences

| | Mentoring | MentorStudy |
|---|---|---|
| Participation | 1:1 | 1:N group |
| Frontend URL | `/mentoring/*` | `/premium-study/*` |
| API path | `/api/v1/mentors` | `/api/v1/group-studies` |
| Entity | `Mentor`, `MentoringApplication` | `MentorStudy extends GroupStudy` |
| Assignments & Evaluations | No | Yes |
