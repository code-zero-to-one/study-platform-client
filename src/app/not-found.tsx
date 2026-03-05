import './global.css';

import { Metadata } from 'next';
import { clsx } from 'clsx';
import localFont from 'next/font/local';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/common/ui/button';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다 - ZERO-ONE',
  description:
    '요청하신 페이지를 찾을 수 없습니다. 홈페이지로 이동하여 다시 시작하세요.',
  robots: {
    index: false,
    follow: true,
  },
};

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

export default function NotFound() {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={clsx(pretendard.className, 'min-h-screen w-screen')}>
        <div className="flex h-screen w-full flex-col items-center justify-center gap-150 bg-background-default">
          <Image
            src="/images/404.png"
            alt="404 에러 페이지"
            width={256}
            height={221}
          />
          <h1 className="font-designer-24b text-text-default">페이지를 찾을 수 없습니다</h1>
          <p className="font-designer-16r text-text-subtle text-center max-w-md">
            요청하신 페이지가 더 이상 존재하지 않습니다.
          </p>
          <Link href="/">
            <Button size="large" type="button" color="secondary">
              홈으로 이동
            </Button>
          </Link>
        </div>
      </body>
    </html>
  );
}

