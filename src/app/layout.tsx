import './global.css';

import { clsx } from 'clsx';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import { DemoControls } from '@/components/pages/class/_components/demo-controls';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
  icons: {
    icon: '/favicon.ico',
  },
};

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200&display=block"
        />
      </head>
      <body className={clsx(pretendard.className, 'min-h-screen w-screen')}>
        {children}
        <DemoControls />
      </body>
    </html>
  );
}
