/**
 * 클라이언트 전용 MSW 부트스트랩. NEXT_PUBLIC_API_MOCKING==='enabled' 일 때만
 * 워커를 시작한다. CI/prod 에서는 env 미설정 → 핸들러 자체가 로드되지 않는다.
 */
let started = false;

export async function initMocks(): Promise<void> {
  if (started) return;
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') return;

  started = true;
  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
