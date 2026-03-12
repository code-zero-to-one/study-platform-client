'use client';

import { usePathname } from 'next/navigation';

const isWideMyPagePath = (pathname: string) => {
  return (
    pathname.startsWith('/my-mentoring') ||
    pathname.startsWith('/mentoring-management')
  );
};

export default function MyPageContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isWideLayout = isWideMyPagePath(pathname);

  if (!isWideLayout) {
    return (
      <div className="m-auto pt-500 pb-[100px]">
        <div className="w-[780px]">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-600 pt-500 pb-[100px]">
      <div className="w-full">{children}</div>
    </div>
  );
}
