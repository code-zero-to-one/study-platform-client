import { bypass, http, HttpResponse } from 'msw';

/**
 * MSW handlers — 백엔드 미배포 4개 갭(Item 2/3/5/6) 선개발용.
 * 배포 후에는 해당 핸들러만 삭제하면 production 코드는 그대로 동작한다.
 *
 * 스코프 원칙: 실제 엔드포인트(lesson detail, qnas, retro)는 passthrough 로
 * 실데이터를 받아 필요한 필드만 보강(augment)하고, 백엔드에 아예 없는
 * 엔드포인트(course feedback)만 순수 mock 으로 응답한다.
 */

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v5`;

export const handlers = [
  // ── Item 2: 무료 수료 설문 — 백엔드에 없음 → 순수 mock ──
  // TODO: confirm endpoint + DTO with backend.
  http.get(`${API}/courses/:courseId/feedback`, () =>
    HttpResponse.json({
      content: {
        goodOptions: [
          { optionId: 1, label: '강의 내용이 알찼어요' },
          { optionId: 2, label: '실습 구성이 좋았어요' },
          { optionId: 3, label: '멘토 피드백이 도움됐어요' },
          { optionId: 4, label: '학습 속도가 적당했어요' },
          { optionId: 5, label: '커뮤니티가 활발했어요' },
        ],
        badOptions: [
          { optionId: 11, label: '난이도가 높았어요' },
          { optionId: 12, label: '분량이 많았어요' },
          { optionId: 13, label: '실습 환경이 불편했어요' },
          { optionId: 14, label: '피드백이 느렸어요' },
          { optionId: 15, label: '가격이 부담됐어요' },
        ],
      },
    }),
  ),

  http.post(`${API}/courses/:courseId/feedback`, async ({ request }) => {
    await request.json();
    return HttpResponse.json({ content: { feedbackId: 1 } });
  }),

  // ── Item 3: 회고 다중 스크린샷 — 배열 수신 확인용 순수 mock ──
  http.post(`${API}/lessons/:lessonId/retrospective`, async ({ request }) => {
    await request.json();
    return HttpResponse.json({
      content: {
        retrospectiveId: 1,
        feedId: 1,
        isLessonCompleted: true,
        nextAccessibleLessonId: null,
        isCourseCompleted: false,
      },
    });
  }),

  // ── Item 5: 레슨 태그 — 실데이터에 tags 보강 ──
  http.get(`${API}/lessons/:lessonId`, async ({ request }) => {
    const real = await fetch(bypass(request));
    if (!real.ok) return real;
    const json = await real.json();
    if (json?.content && !json.content.tags) {
      json.content.tags = ['바이브_코딩', '자연어', '터미널'];
    }
    return HttpResponse.json(json, { status: real.status });
  }),

  // ── Item 6: QnA chapter/lesson 필터 — 실데이터를 param 으로 필터 ──
  http.get(`${API}/courses/:courseId/qnas`, async ({ request }) => {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get('lessonId');
    const real = await fetch(bypass(request));
    if (!real.ok) return real;
    const json = await real.json();
    if (lessonId && Array.isArray(json?.content?.qnas)) {
      json.content.qnas = json.content.qnas.filter(
        (q: { lessonId: number }) => String(q.lessonId) === lessonId,
      );
      json.content.totalCount = json.content.qnas.length;
    }
    return HttpResponse.json(json, { status: real.status });
  }),
];
