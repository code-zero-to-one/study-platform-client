const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

export const isUserFacingValidationMessage = (message: string): boolean => {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return false;
  }

  return !trimmed.startsWith('Invalid input:');
};

export const collectErrorMessages = (value: unknown): string[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const messages: string[] = [];
  const visited = new WeakSet<object>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') {
      continue;
    }

    if (visited.has(node)) {
      continue;
    }
    visited.add(node);

    if (Array.isArray(node)) {
      queue.push(...node);
      continue;
    }

    if (!isPlainObject(node)) {
      continue;
    }

    const message = node.message;
    if (typeof message === 'string') {
      const trimmed = message.trim();
      if (isUserFacingValidationMessage(trimmed)) {
        messages.push(trimmed);
      }
    }

    Object.entries(node).forEach(([key, child]) => {
      if (key === 'ref') {
        return;
      }
      queue.push(child);
    });
  }

  return messages;
};

export const collectFirstErrorFieldPath = (
  value: unknown,
  parentPath = '',
): string | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      const nextPath = collectFirstErrorFieldPath(child, parentPath);
      if (nextPath) {
        return nextPath;
      }
    }

    return undefined;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  if (typeof value.message === 'string' && parentPath.length > 0) {
    return parentPath;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'ref' || key === 'message') {
      continue;
    }

    const nextPath = collectFirstErrorFieldPath(
      child,
      parentPath.length > 0 ? `${parentPath}.${key}` : key,
    );

    if (nextPath) {
      return nextPath;
    }
  }

  return undefined;
};
