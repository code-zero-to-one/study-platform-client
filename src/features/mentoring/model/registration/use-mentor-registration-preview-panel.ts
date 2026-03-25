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
  formOverflowWidth: number;
  committedFormOverflowWidth: number;
  panelWidth: number;
  committedPanelWidth: number;
  panelOverflowWidth: number;
  committedPanelOverflowWidth: number;
}

export interface MentorRegistrationPreviewPanelRefs {
  previewLayoutRef: RefObject<HTMLDivElement>;
}

export interface MentorRegistrationPreviewPanelActions {
  openPreview: () => void;
  closePreview: () => void;
  onPreviewResizeStart: (
    event: ReactPointerEvent<HTMLDivElement>,
    direction?: 'form-left' | 'left' | 'right',
  ) => void;
}

export const useMentorRegistrationPreviewPanel = (): {
  state: MentorRegistrationPreviewPanelState;
  refs: MentorRegistrationPreviewPanelRefs;
  actions: MentorRegistrationPreviewPanelActions;
} => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [formOverflowWidth, setFormOverflowWidth] = useState(0);
  const [committedFormOverflowWidth, setCommittedFormOverflowWidth] =
    useState(0);
  const [panelWidth, setPanelWidth] = useState(PREVIEW_PANEL_DEFAULT_WIDTH);
  const [committedPanelWidth, setCommittedPanelWidth] = useState(
    PREVIEW_PANEL_DEFAULT_WIDTH,
  );
  const [panelOverflowWidth, setPanelOverflowWidth] = useState(0);
  const [committedPanelOverflowWidth, setCommittedPanelOverflowWidth] =
    useState(0);

  const formOverflowWidthRef = useRef(0);
  const panelWidthRef = useRef(PREVIEW_PANEL_DEFAULT_WIDTH);
  const panelOverflowWidthRef = useRef(0);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const previewLayoutRef = useRef<HTMLDivElement>(null);

  const clearPreviewResizeListeners = useCallback(() => {
    const cleanup = resizeCleanupRef.current;

    if (!cleanup) {
      return;
    }

    resizeCleanupRef.current = null;
    cleanup();
  }, []);

  const getFormPanelMaxOverflowWidth = useCallback(() => {
    const layoutRect = previewLayoutRef.current?.getBoundingClientRect();

    if (!layoutRect) {
      return 0;
    }

    return Math.max(0, Math.floor(layoutRect.left));
  }, []);

  const clampFormOverflowWidth = useCallback(
    (width: number) => {
      return Math.max(0, Math.min(width, getFormPanelMaxOverflowWidth()));
    },
    [getFormPanelMaxOverflowWidth],
  );

  const syncFormOverflowWidth = useCallback(
    (nextWidth: number) => {
      const clampedWidth = clampFormOverflowWidth(nextWidth);
      formOverflowWidthRef.current = clampedWidth;
      setFormOverflowWidth(clampedWidth);
      setCommittedFormOverflowWidth(clampedWidth);
    },
    [clampFormOverflowWidth],
  );

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

  const getPreviewPanelMaxOverflowWidth = useCallback(() => {
    const layoutRect = previewLayoutRef.current?.getBoundingClientRect();

    if (!layoutRect) {
      return 0;
    }

    return Math.max(0, Math.floor(window.innerWidth - layoutRect.right));
  }, []);

  const clampPreviewPanelOverflowWidth = useCallback(
    (width: number) => {
      return Math.max(0, Math.min(width, getPreviewPanelMaxOverflowWidth()));
    },
    [getPreviewPanelMaxOverflowWidth],
  );

  const syncPreviewPanelOverflowWidth = useCallback(
    (nextWidth: number) => {
      const clampedWidth = clampPreviewPanelOverflowWidth(nextWidth);
      panelOverflowWidthRef.current = clampedWidth;
      setPanelOverflowWidth(clampedWidth);
      setCommittedPanelOverflowWidth(clampedWidth);
    },
    [clampPreviewPanelOverflowWidth],
  );

  useEffect(() => {
    const handleWindowResize = () => {
      const clampedFormOverflowWidth = clampFormOverflowWidth(
        formOverflowWidthRef.current,
      );
      const clampedWidth = clampPreviewPanelWidth(panelWidthRef.current);
      const clampedOverflowWidth = clampPreviewPanelOverflowWidth(
        panelOverflowWidthRef.current,
      );

      if (clampedFormOverflowWidth !== formOverflowWidthRef.current) {
        formOverflowWidthRef.current = clampedFormOverflowWidth;
        setFormOverflowWidth(clampedFormOverflowWidth);
        setCommittedFormOverflowWidth(clampedFormOverflowWidth);
      }

      if (clampedWidth !== panelWidthRef.current) {
        panelWidthRef.current = clampedWidth;
        setPanelWidth(clampedWidth);
        setCommittedPanelWidth(clampedWidth);
      }

      if (clampedOverflowWidth === panelOverflowWidthRef.current) {
        return;
      }

      panelOverflowWidthRef.current = clampedOverflowWidth;
      setPanelOverflowWidth(clampedOverflowWidth);
      setCommittedPanelOverflowWidth(clampedOverflowWidth);
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  }, [
    clampFormOverflowWidth,
    clampPreviewPanelOverflowWidth,
    clampPreviewPanelWidth,
  ]);

  useEffect(() => {
    return () => {
      clearPreviewResizeListeners();
    };
  }, [clearPreviewResizeListeners]);

  const openPreview = useCallback(() => {
    syncFormOverflowWidth(formOverflowWidthRef.current);
    syncPreviewPanelWidth(panelWidthRef.current);
    syncPreviewPanelOverflowWidth(panelOverflowWidthRef.current);
    setIsPreviewOpen(true);
  }, [
    syncFormOverflowWidth,
    syncPreviewPanelOverflowWidth,
    syncPreviewPanelWidth,
  ]);

  const closePreview = useCallback(() => {
    clearPreviewResizeListeners();
    setIsResizing(false);
    setIsPreviewOpen(false);
  }, [clearPreviewResizeListeners]);

  const onPreviewResizeStart = useCallback(
    (
      event: ReactPointerEvent<HTMLDivElement>,
      direction: 'form-left' | 'left' | 'right' = 'left',
    ) => {
      clearPreviewResizeListeners();
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startFormOverflowWidth = formOverflowWidthRef.current;
      const startWidth = panelWidthRef.current;
      const startOverflowWidth = panelOverflowWidthRef.current;
      setIsResizing(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (direction === 'form-left') {
          const delta = startX - moveEvent.clientX;
          const newFormOverflowWidth = clampFormOverflowWidth(
            startFormOverflowWidth + delta,
          );

          formOverflowWidthRef.current = newFormOverflowWidth;
          setFormOverflowWidth(newFormOverflowWidth);

          return;
        }

        if (direction === 'right') {
          const delta = moveEvent.clientX - startX;
          const newOverflowWidth = clampPreviewPanelOverflowWidth(
            startOverflowWidth + delta,
          );

          panelOverflowWidthRef.current = newOverflowWidth;
          setPanelOverflowWidth(newOverflowWidth);

          return;
        }

        const delta = startX - moveEvent.clientX;
        const newWidth = clampPreviewPanelWidth(startWidth + delta);
        panelWidthRef.current = newWidth;
        setPanelWidth(newWidth);
      };

      const handlePointerComplete = () => {
        clearPreviewResizeListeners();
        setIsResizing(false);
        setCommittedFormOverflowWidth(formOverflowWidthRef.current);
        setCommittedPanelWidth(panelWidthRef.current);
        setCommittedPanelOverflowWidth(panelOverflowWidthRef.current);
      };

      resizeCleanupRef.current = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerComplete);
        document.removeEventListener('pointercancel', handlePointerComplete);
      };
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerComplete);
      document.addEventListener('pointercancel', handlePointerComplete);
    },
    [
      clearPreviewResizeListeners,
      clampFormOverflowWidth,
      clampPreviewPanelOverflowWidth,
      clampPreviewPanelWidth,
    ],
  );

  return {
    state: {
      isPreviewOpen,
      isResizing,
      formOverflowWidth,
      committedFormOverflowWidth,
      panelWidth,
      committedPanelWidth,
      panelOverflowWidth,
      committedPanelOverflowWidth,
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
