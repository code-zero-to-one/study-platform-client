import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
};

export default async function Landing() {
  return <div className="flex gap-600 py-600"></div>;
}
