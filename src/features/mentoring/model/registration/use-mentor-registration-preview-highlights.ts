'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getChangedSections } from '@/features/mentoring/model/registration/mentor-registration-preview';
import type { MentorRegistrationPreviewHighlightSection } from '@/types/mentoring/registration-view';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

const PREVIEW_HIGHLIGHT_DEBOUNCE_MS = 220;
const PREVIEW_HIGHLIGHT_DURATION_MS = 1400;

interface UseMentorRegistrationPreviewHighlightsParams {
  isPreviewOpen: boolean;
  previewFormValues: MentorRegistrationFormValues;
}

export const useMentorRegistrationPreviewHighlights = ({
  isPreviewOpen,
  previewFormValues,
}: UseMentorRegistrationPreviewHighlightsParams) => {
  const [highlightedSections, setHighlightedSections] = useState<
    MentorRegistrationPreviewHighlightSection[]
  >([]);
  const prevPreviewFormValuesRef = useRef<MentorRegistrationFormValues | null>(
    null,
  );
  const highlightDebounceTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const highlightClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearHighlightTimers = useCallback(() => {
    if (highlightDebounceTimerRef.current !== null) {
      clearTimeout(highlightDebounceTimerRef.current);
      highlightDebounceTimerRef.current = null;
    }

    if (highlightClearTimerRef.current !== null) {
      clearTimeout(highlightClearTimerRef.current);
      highlightClearTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isPreviewOpen) {
      clearHighlightTimers();
      setHighlightedSections((current) =>
        current.length === 0 ? current : [],
      );
      prevPreviewFormValuesRef.current = previewFormValues;

      return;
    }

    const prev = prevPreviewFormValuesRef.current;
    prevPreviewFormValuesRef.current = previewFormValues;

    if (prev === null) {
      return;
    }

    const changed = getChangedSections(prev, previewFormValues);
    if (changed.length === 0) {
      return;
    }

    clearHighlightTimers();
    highlightDebounceTimerRef.current = setTimeout(() => {
      setHighlightedSections(changed);
      highlightDebounceTimerRef.current = null;
      highlightClearTimerRef.current = setTimeout(() => {
        setHighlightedSections([]);
        highlightClearTimerRef.current = null;
      }, PREVIEW_HIGHLIGHT_DURATION_MS);
    }, PREVIEW_HIGHLIGHT_DEBOUNCE_MS);
  }, [clearHighlightTimers, isPreviewOpen, previewFormValues]);

  useEffect(() => {
    return () => {
      clearHighlightTimers();
    };
  }, [clearHighlightTimers]);

  return highlightedSections;
};
