'use client';

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const FORM_MIN_CONTENT_WIDTH = 320;
const PREVIEW_PANEL_EXTRA_WIDTH = 200;
const PREVIEW_PANEL_TOTAL_MIN_WIDTH = 320;
const PREVIEW_PANEL_TOTAL_DEFAULT_WIDTH = 600;
const PREVIEW_PANEL_MIN_WIDTH = Math.max(
  0,
  PREVIEW_PANEL_TOTAL_MIN_WIDTH - PREVIEW_PANEL_EXTRA_WIDTH,
);
const PREVIEW_PANEL_DEFAULT_WIDTH = Math.max(
  PREVIEW_PANEL_MIN_WIDTH,
  PREVIEW_PANEL_TOTAL_DEFAULT_WIDTH - PREVIEW_PANEL_EXTRA_WIDTH,
);
const PREVIEW_PANEL_FORM_GAP = 60;

export interface MentorRegistrationPreviewPanelState {
  isPreviewOpen: boolean;
  isResizing: boolean;
  panelWidth: number;
  committedPanelWidth: number;
}

export interface MentorRegistrationPreviewPanelRefs {
  previewLayoutRef: RefObject<HTMLDivElement>;
}

export interface MentorRegistrationPreviewPanelActions {
  openPreview: () => void;
  closePreview: () => void;
  onPreviewResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

export const useMentorRegistrationPreviewPanel = (): {
  state: MentorRegistrationPreviewPanelState;
  refs: MentorRegistrationPreviewPanelRefs;
  actions: MentorRegistrationPreviewPanelActions;
} => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(PREVIEW_PANEL_DEFAULT_WIDTH);
  const [committedPanelWidth, setCommittedPanelWidth] = useState(
    PREVIEW_PANEL_DEFAULT_WIDTH,
  );

  const panelWidthRef = useRef(PREVIEW_PANEL_DEFAULT_WIDTH);
  const previewLayoutRef = useRef<HTMLDivElement>(null);

  const getPreviewPanelMaxWidth = useCallback(() => {
    const viewportLimit =
      Math.floor(window.innerWidth * 0.75) - PREVIEW_PANEL_EXTRA_WIDTH;
    const layoutWidth = previewLayoutRef.current?.getBoundingClientRect().width;

    if (!layoutWidth) {
      return Math.max(0, viewportLimit);
    }

    const formSafeLimit = Math.floor(
      layoutWidth -
        FORM_MIN_CONTENT_WIDTH -
        PREVIEW_PANEL_EXTRA_WIDTH -
        PREVIEW_PANEL_FORM_GAP,
    );

    return Math.max(0, Math.min(viewportLimit, formSafeLimit));
  }, []);

  const clampPreviewPanelWidth = useCallback(
    (width: number) => {
      const maxWidth = getPreviewPanelMaxWidth();
      const minWidth = Math.min(PREVIEW_PANEL_MIN_WIDTH, maxWidth);

      return Math.max(minWidth, Math.min(width, maxWidth));
    },
    [getPreviewPanelMaxWidth],
  );

  const syncPreviewPanelWidth = useCallback(
    (nextWidth: number) => {
      const clampedWidth = clampPreviewPanelWidth(nextWidth);
      panelWidthRef.current = clampedWidth;
      setPanelWidth(clampedWidth);
      setCommittedPanelWidth(clampedWidth);
    },
    [clampPreviewPanelWidth],
  );

  useEffect(() => {
    const handleWindowResize = () => {
      const clampedWidth = clampPreviewPanelWidth(panelWidthRef.current);
      if (clampedWidth === panelWidthRef.current) {
        return;
      }

      panelWidthRef.current = clampedWidth;
      setPanelWidth(clampedWidth);
      setCommittedPanelWidth(clampedWidth);
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  }, [clampPreviewPanelWidth]);

  const openPreview = useCallback(() => {
    syncPreviewPanelWidth(panelWidthRef.current);
    setIsPreviewOpen(true);
  }, [syncPreviewPanelWidth]);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const onPreviewResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startWidth = panelWidthRef.current;
      setIsResizing(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = startX - moveEvent.clientX;
        const newWidth = clampPreviewPanelWidth(startWidth + delta);
        panelWidthRef.current = newWidth;
        setPanelWidth(newWidth);
      };

      const handlePointerUp = () => {
        setIsResizing(false);
        setCommittedPanelWidth(panelWidthRef.current);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [clampPreviewPanelWidth],
  );

  return {
    state: {
      isPreviewOpen,
      isResizing,
      panelWidth,
      committedPanelWidth,
    },
    refs: {
      previewLayoutRef,
    },
    actions: {
      openPreview,
      closePreview,
      onPreviewResizeStart,
    },
  };
};
