import './global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import MainProvider from '@/app/provider';
import Header from '@/widgets/home/header';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
  icons: {
    icon: '/favicon.ico',
  },
};

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}</head>
      <body
        className={clsx(pretendard.className, 'flex w-screen justify-center')}
      >
        <MainProvider>
          <div className="flex w-full max-w-[1200px] flex-col items-center overflow-x-scroll">
            <Header />
            <main className="w-full px-[48px]">{children}</main>
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
