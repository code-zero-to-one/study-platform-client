// 로그인한 회원이 가입되지 않은 회원일 경우 리다이렉트되는 페이지
import Landing from '@/features/auth/ui/landing';

// 랜딩페이지에서 회원가입 모달이 뜨는 것으로 파악
export default function SignupPage() {
  // TODO : URL 에서 토큰 파싱후
  console.log('회원가입 페이지');

  return <Landing isSignupPage={true} />;
}
