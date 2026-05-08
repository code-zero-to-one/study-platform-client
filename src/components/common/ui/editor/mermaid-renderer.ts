import DOMPurify from 'dompurify';

let mermaidRenderIndex = 0;
let mermaidInitialized = false;

const MERMAID_CODE_SELECTOR = 'pre code.language-mermaid';

const createMermaidErrorElement = (document: Document, source: string) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'mermaid-render-error';

  const message = document.createElement('p');
  message.textContent =
    'Mermaid 다이어그램을 렌더링하지 못했습니다. 문법을 확인해주세요.';

  const code = document.createElement('pre');
  code.textContent = source;

  wrapper.append(message, code);

  return wrapper;
};

export const renderMermaidBlocks = async (container: HTMLElement) => {
  const codeBlocks = Array.from(
    container.querySelectorAll<HTMLElement>(MERMAID_CODE_SELECTOR),
  );

  if (codeBlocks.length === 0) {
    return;
  }

  const mermaid = (await import('mermaid')).default;
  if (!mermaidInitialized) {
    mermaid.initialize({
      securityLevel: 'strict',
      startOnLoad: false,
      theme: 'default',
    });
    mermaidInitialized = true;
  }

  await Promise.all(
    codeBlocks.map(async (codeBlock) => {
      const preElement = codeBlock.closest('pre');
      if (!preElement || !preElement.parentElement) {
        return;
      }

      const source = codeBlock.textContent ?? '';
      const id = `mermaid-preview-${Date.now()}-${mermaidRenderIndex++}`;

      try {
        const { svg } = await mermaid.render(id, source);
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-rendered-diagram';
        wrapper.innerHTML = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
        preElement.replaceWith(wrapper);
      } catch {
        preElement.replaceWith(createMermaidErrorElement(document, source));
      }
    }),
  );
};

export const isMermaidCodeBlock = (element: Element) => {
  return element.classList.contains('language-mermaid');
};
