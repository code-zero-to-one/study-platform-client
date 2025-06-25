import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import { Badge as BadgeShadcn } from '@/shared/shadcn/ui/badge';

const badgeVariants = cva(
  'inline-flex min-w-[24px] px-100 py-50 justify-center items-center gap-[2px] text-xs font-medium whitespace-nowrap',
  {
    variants: {
      color: {
        default:
          'bg-background-accent-blue-subtle text-text-subtlest border-border-default',
        completed: 'bg-fill-success-subtle-default text-text-success',
        incomplete: 'bg-fill-danger-subtle-default text-text-error',
        orange:
          'bg-background-accent-orange-subtle text-background-accent-orange-strong',
        gray: 'bg-background-accent-gray-subtle text-background-accent-gray-strong',
        purple:
          'bg-background-accent-purple-subtle text-background-accent-purple-strong',
      },
      shape: {
        rectangle: 'rounded-50',
        round: 'rounded-full',
      },
    },
    defaultVariants: {
      color: 'default',
      shape: 'rectangle',
    },
  },
);

interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof BadgeShadcn> {
  color?: VariantProps<typeof badgeVariants>['color'];
  shape?: VariantProps<typeof badgeVariants>['shape'];
}

/** 완료/미완료 등 상태를 보여주는 배지 컴포넌트 */
function Badge({
  color = 'default',
  shape = 'rectangle',
  className,
  children,
  ...props
}: BadgeProps) {
  /** 
현재 Radix 의 Slot 을 사용하는 방식과 지금 icon 을 삽입하려는 방식이
본질적으로 부딪히기 때문에 다음과 같은 수정 방식을 제안합니다.

1. Slot 과 asChild 값을 사용하는 이유는 자유롭게 컴포넌트가 렌더링되는 HTML 요소 자체를 바꾸기 위해서입니다.
예를 들어서 다음과 같이 구성하면, span -> button 으로 렌더링 되는 형식입니다.

e.g. <Badge asChild><a href="/prev">뒤로 이동</a></Badge>


2. 해당 기능을 위해서는 반드시, Slot 의 하위 자식으로 하나의 React Child를 넘겨주어야합니다.
다만, 지금 Icon 추가를 위한 children 인 leftIcon, righIcon 이 충돌을 일으키는 상황입니다.

이를 해결하기 위해서 다른 컴포넌트 혹은 Fragment 로 바디를 감싸줄 경우, Slot의 기능이 제대로 동작하지 않고, 
문제가 발생하고 React.cloneElemnt 를 사용해 직접 갈아끼워주는 경우, 
Slot 자체를 사용할 필요가 없어지며 코드 베이스가 shadcn 과 멀어집니다.

3. 따라서, Icon 은 그 자체로 Children 형태로 Badge 의 제공하도록 합니다.
이를 통해, asChild 의 기능을 제대로 작동시킴과 동시에 Icon 부분이 좀 더 명시적으로 보일 수 있도록 하고,
자식 요소들의 고정된 마진 사이즈도 필요할 때 변경해서 넣어 줄 수 있을 것입니다.


4. Icon 이 필요하면 다음과 같이 사용하면 됩니다.

e.g. 
<Badge>
<Icon className="mr-2">
<label>뱃지레이블</label>
</Badge>


<Badge asChild>
<a href="/example">
  <Icon className="mr-2">
  <label>뱃지레이블</label>
</a>
</Badge>


5. 기본 shadcn 위에 저희 baseUI 디자인 시스템은 다음과 같이 가도록 하는 게 좋을 것 같습니다.
현재 어떤 것은 shadcn 을 그대로 복사해와서 직접 수정하는 방식을 거치는데, 이럴 경우 shadcn 자체를 
유지하기로 한 저희 의도에 위반되므로 다음과 같이 수정된 방식(Button 이 작성된 방식) 대로 사용하는 게 좋을 듯합니다.



6. 만약 현행 방식을 유지하고 싶다면, asChild / Slot 사용 자체를 디자인시스템 내에서 막아버리는 게 좋을 듯 합니다.

TODO: PR 이 approve 되면 해당 주석은 제거합니다.
  */

  return (
    <BadgeShadcn
      className={cn(badgeVariants({ color, shape }), className)}
      {...props}
    >
      {children}
    </BadgeShadcn>
  );
}

export default Badge;
