import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-45px)] w-full flex-col items-center justify-center gap-5">
      <Image src="/images/404.png" alt="404 에러" width={256} height={221} />
      <Link href="/">
        <Button size="large" type="button" color="secondary">
          홈으로 이동
        </Button>
      </Link>
    </div>
  );
}
