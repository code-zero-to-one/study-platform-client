import type { Meta, StoryObj } from '@storybook/react';

import { XIcon } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';

const meta: Meta<typeof Modal> = {};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    return (
      <Modal.Provider>
        <Modal.Trigger>Open Modal</Modal.Trigger>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header className="flex items-center justify-between">
              <Modal.Title>Modal Header</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </Modal.Header>
            <Modal.Body>Modal Body</Modal.Body>
            <Modal.Footer className="flex justify-end">
              <Modal.Close asChild>
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    console.log('확인 요청하기');
                  }}
                >
                  확인
                </button>
              </Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Provider>
    );
  },
};
