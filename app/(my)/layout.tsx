import Sidebar from '@/widgets/my-page/sidebar';

export default function MyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full px-[150px] pt-[var(--spacing-500)] pb-[100px]">
        {children}
      </div>
    </div>
  );
}
