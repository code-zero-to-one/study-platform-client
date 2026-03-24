import { useEffect, useRef, useState } from 'react';

export function useExpandableContent(content: string | undefined) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight =
        parseInt(window.getComputedStyle(contentRef.current).lineHeight, 10) ||
        20;
      const maxHeight = lineHeight * 3;
      setShowButton(contentRef.current.scrollHeight > maxHeight);
    }
  }, []);

  return { contentRef, expanded, setExpanded, showButton };
}
