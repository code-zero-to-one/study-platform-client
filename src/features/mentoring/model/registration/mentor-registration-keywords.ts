import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';

interface PersistedSelectableCoreKeyword {
  code: string;
  label: string;
}

const normalizeKeywordLookupKey = (value: string) => value.trim().toLowerCase();

const appendSelectableCoreKeyword = ({
  codeLookup,
  code,
  label,
}: {
  codeLookup: Map<string, string>;
  code: string;
  label: string;
}) => {
  const normalizedCode = normalizeKeywordLookupKey(code);
  if (normalizedCode.length > 0 && !codeLookup.has(normalizedCode)) {
    codeLookup.set(normalizedCode, code);
  }

  const normalizedLabel = normalizeKeywordLookupKey(label);
  if (normalizedLabel.length > 0 && !codeLookup.has(normalizedLabel)) {
    codeLookup.set(normalizedLabel, code);
  }
};

export const buildSelectableCoreKeywordCodeLookup = ({
  registrationOptions,
  persistedPredefinedCoreKeywords = [],
}: {
  registrationOptions: Pick<
    MentorRegistrationOptions,
    'selectableCoreKeywords'
  >;
  persistedPredefinedCoreKeywords?: ReadonlyArray<PersistedSelectableCoreKeyword>;
}) => {
  const codeLookup = new Map<string, string>();

  registrationOptions.selectableCoreKeywords.forEach((keyword) => {
    appendSelectableCoreKeyword({
      codeLookup,
      code: keyword.code,
      label: keyword.label,
    });
  });

  persistedPredefinedCoreKeywords.forEach((keyword) => {
    appendSelectableCoreKeyword({
      codeLookup,
      code: keyword.code,
      label: keyword.label,
    });
  });

  return codeLookup;
};

export const normalizeMentorProfileKeywordValues = ({
  profileKeywords,
  registrationOptions,
  persistedPredefinedCoreKeywords = [],
}: {
  profileKeywords: string[];
  registrationOptions: Pick<
    MentorRegistrationOptions,
    'selectableCoreKeywords'
  >;
  persistedPredefinedCoreKeywords?: ReadonlyArray<PersistedSelectableCoreKeyword>;
}) => {
  const selectableCoreKeywordCodeLookup = buildSelectableCoreKeywordCodeLookup({
    registrationOptions,
    persistedPredefinedCoreKeywords,
  });
  const normalizedKeywords: string[] = [];
  const seenKeywords = new Set<string>();

  profileKeywords.forEach((keyword) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length === 0) {
      return;
    }

    const canonicalKeyword =
      selectableCoreKeywordCodeLookup.get(
        normalizeKeywordLookupKey(trimmedKeyword),
      ) ?? trimmedKeyword;
    const normalizedCanonicalKeyword =
      normalizeKeywordLookupKey(canonicalKeyword);

    if (seenKeywords.has(normalizedCanonicalKeyword)) {
      return;
    }

    seenKeywords.add(normalizedCanonicalKeyword);
    normalizedKeywords.push(canonicalKeyword);
  });

  return normalizedKeywords;
};
