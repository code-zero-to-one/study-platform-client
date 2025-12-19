import { Meta, StoryObj } from '@storybook/react';
import Badge from '@/components/ui/badge/index';

const meta: Meta<typeof Badge> = {
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: [
        'default',
        'primary',
        'green',
        'blue',
        'orange',
        'gray',
        'purple',
        'red',
      ],
    },
    shape: {
      control: { type: 'select' },
      options: ['rectangle', 'round'],
    },
    leftIcon: {
      control: false,
    },
    rightIcon: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/* ---------------------------------------------
 * 0) 기본 스토리
 * --------------------------------------------- */
export const Default: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'default',
    shape: 'rectangle',
  },
};

/* ---------------------------------------------
 * 1) 기본 렌더링: span
 * --------------------------------------------- */
export const DefaultSpan: Story = {
  args: {
    children: '기본 Badge(span)',
    color: 'default',
    shape: 'rectangle',
  },
};
DefaultSpan.parameters = {
  docs: {
    description: {
      story: `
Badge는 기본적으로 **\`<span>\` 태그**로 렌더링됩니다.

\`\`\`html
<span class="badge">기본 Badge</span>
\`\`\`
      `,
    },
  },
};

/* ---------------------------------------------
 * 2) asChild=false 인데 button을 넣으면 중첩됨
 * --------------------------------------------- */
// export const NestedButton: Story = {
//   args: {
//     children: <button>버튼 안에 Badge</button>,
//     color: 'default',
//     shape: 'rectangle',
//   },
// };
// NestedButton.parameters = {
//   docs: {
//     description: {
//       story: `
// **asChild = false**
// → Badge는 항상 \`<span>\` 으로 렌더링됩니다.

// 그래서 버튼을 넣으면 다음처럼 DOM이 됩니다:

// \`\`\`html
// <span class="badge">
//   <button>버튼 안에 Badge</button>
// </span>
// \`\`\`

// HTML 의미상 좋은 구조가 아니며, 불필요한 중첩이 생깁니다.
//       `,
//     },
//   },
// };

// /* ---------------------------------------------
//  * 3) asChild=true → Slot 사용 → 버튼 자체가 Badge가 됨
//  * --------------------------------------------- */
// export const ButtonAsBadge: Story = {
//   args: {
//     asChild: true,
//     children: <button>버튼을 Badge처럼</button>,
//     color: 'default',
//     shape: 'rectangle',
//   },
// };
// ButtonAsBadge.parameters = {
//   docs: {
//     description: {
//       story: `
// **asChild = true**
// → Radix Slot을 사용하여, 자식 요소가 Badge 역할을 대신합니다.

// 렌더링 결과:

// \`\`\`html
// <button class="badge">버튼을 Badge처럼</button>
// \`\`\`

// span 태그가 없어지고,
// **버튼 자체가 Badge처럼 스타일링됩니다.**

// ---

// ### ⚠️ asChild=true일 때는 아이콘(leftIcon, rightIcon)을 사용할 수 없습니다.

// Radix \`Slot\`은 **children으로 단 하나의 React element만 받을 수 있기 때문에**,
// 아이콘 + 텍스트처럼 여러 노드를 Badge 내부에서 구성할 수 없습니다.

// 아이콘을 사용하고 싶다면 다음처럼
// \`children\` 내부에서 직접 렌더링해야 합니다:

// \`\`\`tsx
// <Badge asChild>
//   <button>
//     <Icon />
//     버튼 텍스트
//   </button>
// </Badge>
// \`\`\`

// 이 방식은 Slot이 단일 요소(button)를 유지하면서
// 아이콘 렌더링도 허용합니다.
//       `,
//     },
//   },
// };

// /* ---------------------------------------------
//  * 4) 링크(a tag)를 Badge처럼 사용
//  * --------------------------------------------- */
// export const LinkAsBadge: Story = {
//   args: {
//     asChild: true,
//     children: <a href="#">링크 Badge</a>,
//     color: 'default',
//     shape: 'rectangle',
//   },
// };
// LinkAsBadge.parameters = {
//   docs: {
//     description: {
//       story: `
// 링크를 Badge 스타일로 바꾸고 싶다면:

// \`\`\`html
// <a href="#" class="badge">링크 Badge</a>
// \`\`\`

// Badge는 a 태그를 감싸지 않고,
// **a 태그 자체가 Badge 스타일을 그대로 가져갑니다.**
//       `,
//     },
//   },
// };
