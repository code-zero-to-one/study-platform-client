'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import CommunitySectionShell from './community-section-shell';

const DISCORD_BUTTON_IMAGE = '/images/community-discord-logo-blurple.svg';

interface CommunityHeroSectionProps {
  discordUrl: string;
  writeHref: string;
  writeLabel: string;
}

export default function CommunityHeroSection({
  discordUrl,
  writeHref,
  writeLabel,
}: CommunityHeroSectionProps) {
  return (
    <CommunitySectionShell className="gap-300 border-b border-border-subtle pb-400">
      <div className="flex flex-col gap-250 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-150">
          <p className="font-designer-12m text-text-subtle">
            질문답변 · 자유 · 자랑거리 · IT 지식
          </p>
          <h1 className="font-designer-28b text-text-strong">
            ZERO-ONE 커뮤니티
          </h1>
          <Link
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="ZERO-ONE 디스코드로 이동"
            className="inline-flex w-fit transition-opacity hover:opacity-90"
          >
            <Image
              src={DISCORD_BUTTON_IMAGE}
              alt="Discord"
              width={219}
              height={32}
              unoptimized
            />
          </Link>
        </div>

        <div className="flex">
          <Button asChild size="large">
            <Link href={writeHref}>{writeLabel}</Link>
          </Button>
        </div>
      </div>
    </CommunitySectionShell>
  );
}
