// 소셜 로그인이 실패할 경우 리다이렉트되는 페이지
import { Metadata } from 'next';
import Landing from '@/components/forms/landing';

export const metadata: Metadata = {
  title: '로그인',
  description: '로그인 페이지',
};

export default function LoginPage() {
  return <Landing isSignupPage={false} />;
}
