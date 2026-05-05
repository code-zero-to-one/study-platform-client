import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'lucide-react';
import { TextArea, TextField } from '.';

const meta: Meta<typeof TextField> = {
  title: 'Common/UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['L', 'M'] },
    error: { control: 'boolean' },
    success: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showClear: { control: 'boolean' },
  },
  args: {
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
  },
  render: (args) => <TextField {...args} />,
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: { size: 'L', placeholder: '입력하세요', helperText: '가이드 메세지' },
};

export const Focused: Story = {
  args: {
    size: 'L',
    defaultValue: '입력하세요',
    helperText: '가이드 메세지',
    showClear: true,
  },
};

export const ErrorState: Story = {
  args: {
    size: 'L',
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
    error: true,
  },
};

export const Success: Story = {
  args: {
    size: 'L',
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
    success: true,
  },
};

export const Disabled: Story = {
  args: {
    size: 'L',
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
    disabled: true,
  },
};

export const SizeMedium: Story = {
  args: { size: 'M', placeholder: '입력하세요', helperText: '가이드 메세지' },
};

export const WithSearchIcon: Story = {
  args: {
    size: 'M',
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
    trailingIcon: <Search size={20} />,
  },
};

export const TextAreaDefault: StoryObj<typeof TextArea> = {
  render: (args) => <TextArea {...args} />,
  args: {
    size: 'L',
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
    showCounter: true,
    maxLength: 1000,
  },
};

export const TextAreaError: StoryObj<typeof TextArea> = {
  render: (args) => <TextArea {...args} />,
  args: {
    size: 'L',
    placeholder: '입력하세요',
    helperText: '가이드 메세지',
    showCounter: true,
    maxLength: 1000,
    error: true,
  },
};

export const LiveStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '런타임 :hover / :focus-within / :active 검증용. FigmaFullSpec 매트릭스는 정적 override라 실제 인터랙션 동작을 보장하지 않으므로, 이 스토리에서 마우스/포커스를 직접 적용해 확인.',
      },
    },
  },
  render: () => (
    <div className="flex max-w-md flex-col gap-300 p-300">
      <TextField placeholder="hover/focus 직접 적용" helperText="default" />
      <TextField placeholder="error" helperText="가이드 메세지" error />
      <TextField placeholder="success" helperText="가이드 메세지" success />
      <TextField placeholder="disabled" helperText="가이드 메세지" disabled />
      <TextField
        defaultValue="trailing icon shrinks pr"
        helperText="cancel 아이콘 → pr-100 적용"
        showClear
      />
      <TextArea
        placeholder="textarea 자연 높이 (rows=3)"
        helperText="가이드 메세지"
        showCounter
        maxLength={1000}
      />
    </div>
  ),
};

type FieldType = 'default' | 'textarea';
type FieldSize = 'L' | 'M';
type Interaction =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'disabled'
  | 'error'
  | 'success';
interface FocusPlaceholder {
  focused: boolean;
  placeholder: boolean;
  label: string;
}

const INTERACTIONS: Interaction[] = [
  'default',
  'hover',
  'pressed',
  'disabled',
  'error',
  'success',
];

const ROW_VARIANTS: FocusPlaceholder[] = [
  { focused: false, placeholder: true, label: 'Empty (placeholder)' },
  { focused: true, placeholder: false, label: 'Focused + value' },
  { focused: false, placeholder: false, label: 'Filled' },
];

const TYPE_SIZES: { type: FieldType; size: FieldSize; title: string }[] = [
  { type: 'default', size: 'L', title: 'Type=Default · Size=L' },
  { type: 'default', size: 'M', title: 'Type=Default · Size=M' },
  { type: 'textarea', size: 'L', title: 'Type=Text Area · Size=L' },
  { type: 'textarea', size: 'M', title: 'Type=Text Area · Size=M' },
];

// Static visual overrides for the FigmaFullSpec matrix only.
// Runtime hover/pressed are driven by `hover:` / `active:` variants in
// `inputBoxVariants`; this matrix forces the visual so reviewers can see
// every state side-by-side without simulating pointer events.
// Use the LiveStates story (or interactive Default story) to verify the
// real `:hover` / `:focus-within` chain.
const BG_OVERRIDE: Record<Interaction, string> = {
  default: '',
  hover: '!bg-fill-neutral-subtle-hover',
  pressed: '!bg-fill-neutral-subtle-pressed',
  disabled: '',
  error: '',
  success: '',
};

function MatrixCell({
  type,
  size,
  interaction,
  focused,
  placeholder,
}: {
  type: FieldType;
  size: FieldSize;
  interaction: Interaction;
  focused: boolean;
  placeholder: boolean;
}) {
  const isError = interaction === 'error';
  const isSuccess = interaction === 'success';
  const isDisabled = interaction === 'disabled';
  const valueText = placeholder ? undefined : '입력하세요';
  const placeholderText = placeholder ? '입력하세요' : undefined;
  const focusBorderOverride =
    focused &&
    interaction !== 'disabled' &&
    interaction !== 'error' &&
    interaction !== 'success'
      ? '!border-border-strong'
      : '';
  const overrideClass =
    `${BG_OVERRIDE[interaction]} ${focusBorderOverride}`.trim();

  if (type === 'default') {
    const showSearch =
      size === 'M' &&
      placeholder &&
      !focused &&
      (interaction === 'default' ||
        interaction === 'hover' ||
        interaction === 'pressed');
    const showCancelIcon = focused && !placeholder;
    const trailingIconNode =
      !showCancelIcon && showSearch ? <Search size={20} /> : undefined;
    return (
      <TextField
        size={size}
        defaultValue={valueText}
        placeholder={placeholderText}
        disabled={isDisabled}
        error={isError}
        success={isSuccess}
        helperText="가이드 메세지"
        showClear={showCancelIcon}
        trailingIcon={trailingIconNode}
        className={overrideClass || undefined}
      />
    );
  }
  return (
    <TextArea
      size={size}
      defaultValue={valueText}
      placeholder={placeholderText}
      disabled={isDisabled}
      error={isError}
      success={isSuccess}
      helperText="가이드 메세지"
      showCounter
      maxLength={1000}
      className={overrideClass || undefined}
    />
  );
}

export const FigmaFullSpec: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Figma DS 2.0 (node 181:2263) 전체 72 variant 배치를 그대로 재현. 4 (Type × Size) 섹션 × 6 Interaction × 3 (Focused, Placeholder) 행. Hover/Pressed는 `!bg-*` override로 정적 시각화. Focused 행은 `!border-border-strong` override + cancel 아이콘.',
      },
    },
  },
  argTypes: {
    size: { table: { disable: true } },
    error: { table: { disable: true } },
    success: { table: { disable: true } },
    disabled: { table: { disable: true } },
    showClear: { table: { disable: true } },
    helperText: { table: { disable: true } },
    placeholder: { table: { disable: true } },
  },
  render: () => (
    <div className="bg-fill-neutral-subtle-default flex flex-col gap-300 p-300">
      {TYPE_SIZES.map(({ type, size, title }) => (
        <section key={`${type}-${size}`} className="flex flex-col gap-150">
          <h3 className="font-designer-16b text-text-default">{title}</h3>
          <div
            className="grid gap-100"
            style={{
              gridTemplateColumns: `repeat(${INTERACTIONS.length}, minmax(200px, 1fr))`,
            }}
          >
            {INTERACTIONS.map((interaction) => (
              <span
                key={`hdr-${type}-${size}-${interaction}`}
                className="font-designer-13b text-text-subtlest uppercase"
              >
                {interaction}
              </span>
            ))}
            {ROW_VARIANTS.flatMap(({ focused, placeholder }) =>
              INTERACTIONS.map((interaction) => (
                <MatrixCell
                  key={`${type}-${size}-${interaction}-${focused}-${placeholder}`}
                  type={type}
                  size={size}
                  interaction={interaction}
                  focused={focused}
                  placeholder={placeholder}
                />
              )),
            )}
          </div>
        </section>
      ))}
    </div>
  ),
};
