import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio';

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        story: 'RadioGroupItem 컴포넌트의 id와 label의 htmlFor을 맞춰주세요.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => {
    const [state, setState] = useState<'first' | 'second'>('first');

    return (
      <div>
        <RadioGroup
          className="flex flex-col gap-2.5"
          defaultValue="first"
          onValueChange={(value: 'first' | 'second') => setState(value)}
        >
          <div className="flex items-center gap-100">
            <RadioGroupItem value="first" id="option1" />
            <label htmlFor="option1">first</label>
          </div>
          <div className="flex items-center gap-100">
            <RadioGroupItem value="second" id="option2" />

            <label htmlFor="option2">second</label>
          </div>
        </RadioGroup>

        <Button type="button" onClick={() => {}}>
          submit
        </Button>
      </div>
    );
  },
};
