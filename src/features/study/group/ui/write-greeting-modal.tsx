import { XIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/shared/ui/button';
import { TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';

export default function WriteGreetingModal() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>작성하기</Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              가입인사
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <WriteGreetingForm onClose={() => setOpen(false)} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function WriteGreetingForm({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form id="write-greeting" className="flex flex-col gap-150">
          <label
            htmlFor="greeting"
            className="text-text-default font-designer-15b"
          >
            나에 대한 소개 혹은 지원동기를 작성해주세요.
          </label>

          <TextAreaInput
            id="greeting"
            placeholder="안녕하세요. 함께 성장하고 싶은 마음으로 스터디에 참여하게 되었습니다.&#13;&#10;혼자 공부할 때보다 서로의 경험과 피드백을 나누며 더 깊이 배우고 싶어요. 잘 부탁드립니다 :)"
            minLength={20}
            maxLength={500}
            className="h-[216px]"
          />
        </form>
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
        </Modal.Close>
        <Button
          color="primary"
          size="large"
          type="submit"
          form="write-greeting"
        >
          완료
        </Button>
      </Modal.Footer>
    </>
  );
}
