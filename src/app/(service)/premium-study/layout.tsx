import GlobalToast from '@/components/ui/global-toast';

export default function PremiumStudyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <GlobalToast />
      {children}
    </>
  );
}
