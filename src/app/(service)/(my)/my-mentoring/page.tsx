import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '내 멘토링',
};

export default function MyMentoringRoute() {
  notFound();
}
