// Next.js 서버 사이드 에러 테스트 페이지
// 이 페이지는 서버 컴포넌트에서 에러를 발생시켜 Next.js Error Boundary를 트리거합니다.

export default async function TestServerErrorPage() {
  // 서버 사이드에서 에러 발생 (prefetch 실패 시뮬레이션)
  throw new Error(
    'Next.js 서버 사이드 에러: 데이터 페칭 실패 또는 서버 컴포넌트 에러',
  );
}
