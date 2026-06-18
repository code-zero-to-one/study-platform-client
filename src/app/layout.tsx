import './global.css';

import type { Metadata } from 'next';
import { Corinthia } from 'next/font/google';
import localFont from 'next/font/local';
import React from 'react';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

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

// Decorative script face for the "Benefit" display heading (Figma: Thesignature).
const thesignature = localFont({
  src: '../../public/fonts/Thesignature.otf',
  variable: '--font-thesignature',
  display: 'swap',
});

// Decorative Latin script face for the Instructor "Define / Build / Run" headings (Figma: Corinthia).
const corinthia = Corinthia({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-corinthia',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn(
        pretendard.variable,
        thesignature.variable,
        corinthia.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          pretendard.className,
          'min-h-screen w-screen overflow-x-hidden',
        )}
      >
        {children}
      </body>
    </html>
  );
}
