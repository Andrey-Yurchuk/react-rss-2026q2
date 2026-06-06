import { describe, expect, it } from 'vitest';
import { fileToBase64 } from './fileToBase64';

describe('fileToBase64', () => {
  it('converts a file to a data URL string', async () => {
    const file = new File(['hello'], 'avatar.png', { type: 'image/png' });

    await expect(fileToBase64(file)).resolves.toMatch(
      /^data:image\/png;base64,/
    );
  });

  it('rejects when FileReader returns a non-string result', async () => {
    const file = new File(['hello'], 'avatar.png', { type: 'image/png' });
    const originalFileReader = globalThis.FileReader;

    class NonStringResultFileReader {
      public onload: (() => void) | null = null;
      public result: ArrayBuffer = new ArrayBuffer(8);

      readAsDataURL() {
        this.onload?.();
      }
    }

    globalThis.FileReader =
      NonStringResultFileReader as unknown as typeof FileReader;

    try {
      await expect(fileToBase64(file)).rejects.toThrow(
        'Failed to read file as data URL'
      );
    } finally {
      globalThis.FileReader = originalFileReader;
    }
  });

  it('rejects when FileReader fails', async () => {
    const file = new File(['hello'], 'avatar.png', { type: 'image/png' });
    const originalFileReader = globalThis.FileReader;

    class FailingFileReader {
      public onerror: (() => void) | null = null;

      readAsDataURL() {
        this.onerror?.();
      }
    }

    globalThis.FileReader = FailingFileReader as unknown as typeof FileReader;

    try {
      await expect(fileToBase64(file)).rejects.toThrow('Failed to read file');
    } finally {
      globalThis.FileReader = originalFileReader;
    }
  });
});
