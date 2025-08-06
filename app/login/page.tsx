// 소셜 로그인이 실패할 경우 리다이렉트되는 페이지
import { Metadata } from 'next';
import Landing from '@/features/auth/ui/landing';

export const metadata: Metadata = {
  title: '로그인',
  description: '로그인 페이지',
};

// 랜딩페이지에서 로그인 모달이 뜨는 것으로 파악
export default function LoginPage() {
  return <Landing isSignupPage={false} />;
}
