import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '스터디 후기',
};

export default function MyStudyReviewPage() {
  redirect('/my-study-review/group');
}
