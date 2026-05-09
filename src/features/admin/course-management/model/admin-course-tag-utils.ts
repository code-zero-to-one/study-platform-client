export const parseAdminCourseCardTags = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );

export const serializeAdminCourseCardTags = (tags: string[]) =>
  parseAdminCourseCardTags(tags.join(', ')).join(', ');
