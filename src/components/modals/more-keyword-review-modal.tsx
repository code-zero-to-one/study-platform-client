import { XIcon } from 'lucide-react';
import KeywordReview from '@/components/cards/keyword-review';
import { Modal } from '@/components/ui/modal';

export default function MoreKeywordReviewModal({
  title,
  keywords,
}: {
  title: string;
  keywords: { id: number; content: string; count: number }[];
}) {
  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        {keywords.length > 5 && (
          <button className="font-designer-12m text-text-subtlest cursor-pointer">
            더보기
          </button>
        )}
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large" className="w-full">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              {title}
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-400 p-400">
            <ul className="flex flex-col gap-50">
              {keywords.map((keyword) => (
                <KeywordReview key={keyword.id} {...keyword} />
              ))}
            </ul>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
