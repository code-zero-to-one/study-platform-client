import { beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeImageFileForUpload } from './image-utils';

const { heic2anyMock } = vi.hoisted(() => ({
  heic2anyMock: vi.fn(),
}));

vi.mock('heic2any', () => ({
  default: heic2anyMock,
}));

const createFile = (
  bytes: number[],
  fileName: string,
  type: string,
  lastModified = 1712345678901,
) => {
  return new File([Uint8Array.from(bytes)], fileName, {
    type,
    lastModified,
  });
};

describe('normalizeImageFileForUpload', () => {
  beforeEach(() => {
    heic2anyMock.mockReset();
  });

  it('fixes disguised png files by the actual file signature', async () => {
    const disguisedPngFile = createFile(
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d],
      'badge.jpg',
      'image/jpeg',
    );

    const normalizedFile = await normalizeImageFileForUpload(disguisedPngFile);

    expect(normalizedFile).not.toBe(disguisedPngFile);
    expect(normalizedFile.name).toBe('badge.png');
    expect(normalizedFile.type).toBe('image/png');
    expect(normalizedFile.lastModified).toBe(disguisedPngFile.lastModified);
  });

  it('converts heic files to jpg before upload', async () => {
    heic2anyMock.mockResolvedValue(
      new Blob([Uint8Array.from([0xff, 0xd8, 0xff, 0xdb])], {
        type: 'image/jpeg',
      }),
    );
    const heicFile = createFile(
      [
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
        0x00, 0x00, 0x00, 0x00, 0x6d, 0x69, 0x66, 0x31, 0x68, 0x65, 0x69, 0x63,
      ],
      'ios-photo.heic',
      'image/heic',
    );

    const normalizedFile = await normalizeImageFileForUpload(heicFile);

    expect(heic2anyMock).toHaveBeenCalledTimes(1);
    expect(normalizedFile.name).toBe('ios-photo.jpg');
    expect(normalizedFile.type).toBe('image/jpeg');
    expect(normalizedFile.lastModified).toBe(heicFile.lastModified);
  });
});
