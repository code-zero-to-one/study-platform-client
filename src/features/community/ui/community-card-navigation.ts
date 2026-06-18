'use client';

const COMMUNITY_CARD_INTERACTIVE_SELECTOR = [
  'button',
  'input',
  'textarea',
  'select',
  'label',
  '[role="button"]',
  '[role="menuitem"]',
].join(',');

export const isCommunityCardNestedInteraction = (
  target: EventTarget | undefined,
) => {
  return (
    target instanceof Element &&
    Boolean(target.closest(COMMUNITY_CARD_INTERACTIVE_SELECTOR))
  );
};
