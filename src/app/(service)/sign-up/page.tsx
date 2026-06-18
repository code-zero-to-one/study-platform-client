// 로그인한 회원이 가입되지 않은 회원일 경우 리다이렉트되는 페이지
import type { Metadata } from 'next';
import Landing from '@/components/forms/landing';

export const metadata: Metadata = {
  title: '회원가입',
};

// 랜딩페이지에서 회원가입 모달이 뜨는 것으로 파악
export default function SignupPage() {
  return <Landing isSignupPage={true} />;
}
