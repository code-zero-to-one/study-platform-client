import { GoogleTagManager } from '@next/third-parties/google';
import FloatingClassActionButtons from '@/components/common/ui/floating-class-action-buttons';
import GlobalToast from '@/components/common/ui/global-toast';
import { createAuthHydrationSession } from '@/features/auth/model/auth-hydration-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';
import MainProvider from '@/providers';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default async function ClassLessonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await readServerAuthSession();
  const initialHydrationSession = createAuthHydrationSession(initialSession);

  return (
    <>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <MainProvider initialSession={initialHydrationSession}>
        {children}
        <GlobalToast />
        <FloatingClassActionButtons scrollContainerSelector="[data-lesson-scroll]" />
      </MainProvider>
    </>
  );
}
