// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Plus } from 'lucide-react';
import Button from '.';

const meta: Meta<typeof Button> = {
  title: 'Common/UI/Button',
  component: Button,
  tags: ['autodocs'],
  render: (args) => <Button {...args} />,
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outlined'],
    },
    size: {
      control: { type: 'select' },
      options: ['xsmall', 'small', 'medium', 'large'],
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    icon: {
      control: false,
    },
    asChild: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary 버튼',
    color: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary 버튼',
    color: 'secondary',
    size: 'medium',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined 버튼',
    color: 'outlined',
    size: 'medium',
  },
};

export const Sizes: Story = {
  args: {
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: '각 size variant를 한 번에 확인할 수 있는 예시입니다.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button {...args} size="xsmall">
        XSmall
      </Button>
      <Button {...args} size="small">
        Small
      </Button>
      <Button {...args} size="medium">
        Medium
      </Button>
      <Button {...args} size="large">
        Large
      </Button>
    </div>
  ),
};

export const WithLeftIcon: Story = {
  args: {
    children: '아이콘 (왼쪽)',
    color: 'primary',
    size: 'medium',
    icon: <Plus />,
    iconPosition: 'left',
  },
};

export const WithRightIcon: Story = {
  args: {
    children: '아이콘 (오른쪽)',
    color: 'primary',
    size: 'medium',
    icon: <ArrowRight />,
    iconPosition: 'right',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성화 버튼',
    color: 'primary',
    size: 'medium',
    disabled: true,
  },
};

type ButtonSize = 'large' | 'medium' | 'small' | 'xsmall';
type ButtonType = 'primary' | 'secondary';
type ButtonState = 'default' | 'hover' | 'pressed' | 'disabled';
type IconArrangement = 'none' | 'right' | 'left';

const SIZE_ORDER: ButtonSize[] = ['large', 'medium', 'small', 'xsmall'];
const STATE_ORDER: ButtonState[] = ['default', 'hover', 'pressed', 'disabled'];
const TYPE_ORDER: ButtonType[] = ['primary', 'secondary'];
const ICON_ORDER: IconArrangement[] = ['none', 'right', 'left'];

const STATE_LABEL: Record<ButtonState, string> = {
  default: 'Default',
  hover: 'Hover',
  pressed: 'Pressed',
  disabled: 'Disabled',
};

const SIZE_TO_PROP: Record<
  ButtonSize,
  'large' | 'medium' | 'small' | 'xsmall'
> = {
  large: 'large',
  medium: 'medium',
  small: 'small',
  xsmall: 'xsmall',
};

const STATE_OVERRIDE: Record<ButtonType, Record<ButtonState, string>> = {
  primary: {
    default: '',
    hover: '!bg-fill-brand-default-hover',
    pressed: '!bg-fill-brand-default-pressed',
    disabled: '',
  },
  secondary: {
    default: '',
    hover: '!bg-fill-neutral-default-hover',
    pressed: '!bg-fill-neutral-default-pressed',
    disabled: '',
  },
};

function FigmaCell({
  size,
  type,
  state,
  icon,
  label,
}: {
  size: ButtonSize;
  type: ButtonType;
  state: ButtonState;
  icon: IconArrangement;
  label: string;
}) {
  const isDisabled = state === 'disabled';
  const overrideClass = STATE_OVERRIDE[type][state];
  const iconNode =
    icon === 'left' || icon === 'right' ? <ArrowRight /> : undefined;
  const iconPosition = icon === 'right' ? 'right' : 'left';

  return (
    <Button
      color={type}
      size={SIZE_TO_PROP[size]}
      disabled={isDisabled}
      className={overrideClass}
      icon={iconNode}
      iconPosition={iconPosition}
    >
      {label}
    </Button>
  );
}

export const FigmaFullSpec: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Figma DS 2.0 (node 164:1175) 전체 96 variant 배치를 그대로 재현. 4 Size × 4 Interaction × 2 Type × 3 Icon. Hover/Pressed는 `!bg-*` 강제 override로 정적 시각화. children만 Controls로 조정 가능.',
      },
    },
  },
  argTypes: {
    color: { table: { disable: true } },
    size: { table: { disable: true } },
    iconPosition: { table: { disable: true } },
    icon: { table: { disable: true } },
    disabled: { table: { disable: true } },
    loading: { table: { disable: true } },
    loadingText: { table: { disable: true } },
    spinner: { table: { disable: true } },
    asChild: { table: { disable: true } },
  },
  args: {
    children: 'Label',
  },
  render: (args) => {
    const label = typeof args.children === 'string' ? args.children : 'Label';

    const SIZE_BASE_X: Record<ButtonSize, number> = {
      large: 0,
      medium: 604,
      small: 1176,
      xsmall: 1664,
    };
    const STATE_DX: Record<ButtonSize, Record<ButtonState, number>> = {
      large: { default: 0, hover: 145, pressed: 290, disabled: 435 },
      medium: { default: 0, hover: 137, pressed: 274, disabled: 411 },
      small: { default: 0, hover: 116, pressed: 232, disabled: 348 },
      xsmall: { default: 0, hover: 112, pressed: 224, disabled: 336 },
    };
    const ICON_DY: Record<IconArrangement, number> = {
      none: 0,
      right: 78,
      left: 156,
    };
    const TYPE_BASE_Y: Record<ButtonType, number> = {
      primary: 0,
      secondary: 354,
    };

    const cells = SIZE_ORDER.flatMap((size) =>
      STATE_ORDER.flatMap((state) =>
        TYPE_ORDER.flatMap((type) =>
          ICON_ORDER.map((icon) => ({
            size,
            state,
            type,
            icon,
            x: SIZE_BASE_X[size] + STATE_DX[size][state],
            y: TYPE_BASE_Y[type] + ICON_DY[icon],
          })),
        ),
      ),
    );

    const columnLabels = SIZE_ORDER.flatMap((size) =>
      STATE_ORDER.map((state) => ({
        key: `${size}-${state}`,
        text: STATE_LABEL[state],
        x: SIZE_BASE_X[size] + STATE_DX[size][state],
      })),
    );

    const LABEL_ROW_HEIGHT = 28;

    return (
      <div style={{ overflow: 'auto', padding: 48, background: '#ffffff' }}>
        <div
          style={{
            position: 'relative',
            width: 2072,
            height: 558 + LABEL_ROW_HEIGHT,
          }}
        >
          {columnLabels.map(({ key, text, x }) => (
            <span
              key={`label-${key}`}
              style={{
                position: 'absolute',
                left: x,
                top: 0,
                fontSize: 11,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {text}
            </span>
          ))}
          {cells.map(({ size, state, type, icon, x, y }) => (
            <div
              key={`${size}-${state}-${type}-${icon}`}
              style={{
                position: 'absolute',
                left: x,
                top: y + LABEL_ROW_HEIGHT,
              }}
            >
              <FigmaCell
                size={size}
                type={type}
                state={state}
                icon={icon}
                label={label}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
    color: 'primary',
    size: 'medium',
    children: <a href="#as-child-link">링크 형태 버튼 (asChild)</a>,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`asChild`를 사용해 실제 DOM 엘리먼트를 교체하는 예시입니다. Slot을 통해 className과 props가 자식 엘리먼트로 전달됩니다.',
      },
    },
  },
};
