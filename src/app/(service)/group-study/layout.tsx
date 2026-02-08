import GlobalToast from '@/components/ui/global-toast';

export default function GroupStudyLayout({
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
